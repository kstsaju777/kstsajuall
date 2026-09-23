import { NextResponse, type NextRequest, after } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/confirm";
import { isCurrentUserAdmin } from "@/lib/auth";
import { isSajuApiConfigured, fetchSajuAnalysis, formatSajuToManseryeok, type BirthInfo } from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { serverEnv } from "@/lib/env";
import { sendOrderSms, sendOrderEmail } from "@/lib/order-notifications";

export const maxDuration = 300;
const SITE_ORIGIN = "https://www.hongyeondang.com";
const API_ROUTE = "/api/kunghap_gyeolhon-report";
const TOTAL_CHAPTERS = 10;

const PRODUCT_NAME = "결혼궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_gyeolhon/report-preview";

// 결제 직후 서버가 알아서 전체 리포트를 만들어두는 백그라운드 작업.
// 챕터 생성은 여기서 안정적으로 완료된다(실측 확인). 반면 AI 사주화 이미지
// 생성(OpenAI 호출, 20~30초)은 after() 백그라운드 컨텍스트 안에서는 원인 불명의
// 이유로 계속 실패해서, 이미지는 checkout/success 화면(브라우저)이 직접
// 요청하도록 분리했고, 혹시 놓치더라도 1분마다 도는 예약 작업(/api/cron/
// complete-images)이 마저 완성시킨다. 클라이언트는 챕터는 직접 생성하지 않고
// 진행률만 폴링한다.
async function generateReportInBackground(resultId: string) {
  try {
    fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId, concernOnly: true }),
    }).catch((e) => console.error(`[bg-gen] ${resultId} 고민조언 생성 실패:`, e));

    const merged = {};
    const chapterTasks = Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).map(async (chapter) => {
      try {
        const genRes = await fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resultId, chapter }),
        });
        const genJson = await genRes.json().catch(() => null);
        const sections = genJson?.sections;
        if (!sections) {
          console.error(`[bg-gen] ${resultId} ${chapter}장 생성 실패:`, genJson?.error ?? genRes.status);
          return;
        }
        Object.assign(merged, sections);
      } catch (e) {
        console.error(`[bg-gen] ${resultId} ${chapter}장 처리 중 예외:`, e);
      }
    });

    await Promise.all(chapterTasks);

    if (Object.keys(merged).length > 0) {
      const saveRes = await fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: merged }),
      });
      if (!saveRes.ok) console.error(`[bg-gen] ${resultId} 합본 저장 실패:`, saveRes.status);
    }
  } catch (e) {
    console.error(`[bg-gen] ${resultId} 백그라운드 생성 전체 실패:`, e);
  }
}

const bodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  const { paymentKey, orderId, amount } = parsed.data;

  const service = createServiceClient();
  // 어드민 계정 결제는 GA/메타 픽셀 구매 전환 이벤트 집계에서 제외하기 위해
  // 클라이언트에 isTest 플래그로 알려준다(관리자 페이지 매출 집계와 동일 기준).
  const isLive = !(await isCurrentUserAdmin());

  const { data: order } = await service.from("orders").select("id, amount, status, guest_email, product_id").eq("order_id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "paid") {
    const { data: result } = await service.from("saju_results").select("id").eq("order_id", order.id).maybeSingle();
    if (result) {
      const { data: si } = await service.from("saju_inputs").select("name, gender").eq("order_id", order.id).maybeSingle();
      return NextResponse.json({ resultId: result.id, name: si?.name ?? "", gender: si?.gender ?? "male", alreadyPaid: true, isTest: !isLive });
    }
  }
  if (order.amount !== amount) return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });
  const toss = await confirmTossPayment({ paymentKey, orderId, amount }, isLive);
  if (!toss.ok) {
    await service.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: toss.error.message, code: toss.error.code }, { status: 402 });
  }
  if (toss.data.totalAmount !== amount) {
    await service.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: "토스 응답 금액 불일치" }, { status: 400 });
  }
  await service.from("orders").update({ status: "paid", toss_payment_key: paymentKey, paid_at: toss.data.approvedAt }).eq("id", order.id);

  const { data: input } = await service.from("saju_inputs").select("*").eq("order_id", order.id).maybeSingle();
  if (!input) return NextResponse.json({ error: "사주 정보를 찾을 수 없습니다" }, { status: 500 });
  if (!isSajuApiConfigured()) return NextResponse.json({ error: "사주 API가 설정되지 않았습니다" }, { status: 503 });

  try {
    const concernsArr = (input.concerns as string[] | null) ?? [];
    const partnerDataRaw = concernsArr.at(-1) ?? "{}";
    const partnerData = JSON.parse(partnerDataRaw);
    const userConcern = concernsArr.length >= 2 ? concernsArr[0] : "";
    const { partnerName: pName, partnerBirthDate, partnerBirthTime, partnerGender: pGenderRaw, partnerCalendar: pCalendar } = partnerData;

    const pad = (n: string | number) => String(n).padStart(2, "0");
    const [y, m, d] = String(input.birth_date).split("-");
    const hasTime = !input.time_unknown && !!input.birth_time;
    const [hh, mm] = hasTime ? String(input.birth_time).split(":") : ["", ""];
    const g: "male" | "female" = input.gender === "female" ? "female" : "male";

    const birthInfo: BirthInfo = {
      birthYear: y, birthMonth: String(Number(m)), birthDay: String(Number(d)),
      ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
      calendarType: input.calendar === "lunar" ? "음력" : "양력",
      gender: g,
    };
    const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "confirm" });
    const view = buildMyeongsikView(analysis);
    const myManseryeokText = formatSajuToManseryeok(analysis, birthInfo);

    const pg: "male" | "female" = pGenderRaw === "female" ? "female" : "male";
    const pymd = partnerBirthDate ? String(partnerBirthDate).split("-") : null;
    let partnerView = null;
    let partnerManseryeokText = "";
    let partnerBirth = null;

    if (pymd && pymd.length === 3) {
      const [py, pm, pd] = pymd;
      const phasTime = !!partnerBirthTime;
      const [phh, pmm2] = phasTime ? String(partnerBirthTime).split(":") : ["", ""];
      const partnerBirthInfo: BirthInfo = {
        birthYear: py, birthMonth: String(Number(pm)), birthDay: String(Number(pd)),
        ...(phasTime ? { birthHour: String(Number(phh)), birthMinute: String(Number(pmm2)) } : {}),
        calendarType: pCalendar === "lunar" ? "음력" : "양력",
        gender: pg,
      };
      const partnerAnalysis = await fetchSajuAnalysis(partnerBirthInfo, [], { source: "confirm" });
      partnerView = buildMyeongsikView(partnerAnalysis);
      partnerManseryeokText = formatSajuToManseryeok(partnerAnalysis, partnerBirthInfo);
      partnerBirth = {
        date: `${py}.${pad(pm)}.${pad(pd)}`,
        calendar: pCalendar === "lunar" ? "음력" : "양력",
        time: phasTime ? `${pad(phh)}:${pad(pmm2)}` : "시간 모름",
        gender: pg,
      };
    }

    const birth = {
      date: `${y}.${pad(m)}.${pad(d)}`,
      calendar: input.calendar === "lunar" ? "음력" : "양력",
      time: hasTime ? `${pad(hh)}:${pad(mm)}` : "시간 모름",
      gender: g,
    };

    const env = serverEnv();
    const llmMeta = { provider: env.LLM_PROVIDER, model: env.LLM_MODEL };

    const { data: result, error: resultErr } = await service.from("saju_results").insert({
      order_id: order.id,
      myeongsik: { view, name: input.name ?? "", birth, manseryeokText: myManseryeokText, partnerManseryeokText, gender: g, partnerView, partnerName: pName ?? "", partnerBirth, partnerGender: pg, "{고민}": userConcern } as never,
      interpretation_md: JSON.stringify({}),
      llm_provider: llmMeta.provider,
      llm_model: llmMeta.model,
    }).select("id").single();

    if (resultErr || !result) return NextResponse.json({ error: "결과 레코드 저장 실패", detail: resultErr?.message }, { status: 500 });

    const reportUrl = `https://www.hongyeondang.com/${REPORT_PATH}?id=${result.id}`;
    await Promise.all([
      sendOrderSms({ customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE }),
      order.guest_email ? sendOrderEmail({ customerEmail: order.guest_email, customerName: input.name ?? "고객", productName: PRODUCT_NAME, price: PRODUCT_PRICE, reportUrl }) : Promise.resolve(),
    ]);

    after(() => generateReportInBackground(result.id));

    return NextResponse.json({ resultId: result.id, name: input.name ?? "", gender: g, partnerName: pName ?? "", partnerGender: pg, isTest: !isLive });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
