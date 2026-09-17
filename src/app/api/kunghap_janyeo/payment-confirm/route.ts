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
const API_ROUTE = "/api/kunghap_janyeo-report";
const TOTAL_CHAPTERS = 9;

// 결제 직후 서버가 알아서 전체 리포트를 만들어두는 백그라운드 작업 (saju_total과 동일 패턴).
// 장별로 개별 저장하면 여러 장이 거의 동시에 저장되며 경쟁 상태로 알림톡이 끝내
// 발송되지 않는 사고가 있어(자녀궁합 건), 전부 병렬 생성만 해두고 다 모인 뒤
// 딱 한 번만 합쳐서 저장한다. 클라이언트 쪽 자동 생성 로직은 안전망으로 유지.
async function generateReportInBackground(resultId: string) {
  try {
    // 이미지 생성은 챕터와 독립적으로 병렬 진행 (완료 여부는 알림톡 게이트에서 서버가 자체 확인)
    fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId }),
    }).catch((e) => console.error(`[bg-gen] ${resultId} 이미지 생성 실패:`, e));

    fetch(`${SITE_ORIGIN}${API_ROUTE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resultId, concernOnly: true }),
    }).catch((e) => console.error(`[bg-gen] ${resultId} 고민조언 생성 실패:`, e));

    // 장별로 생성될 때마다 개별 저장하면 여러 장이 거의 동시에 저장을 시도하면서
    // "지금 전부 완성됐나?" 체크가 서로 다른 스냅샷을 보게 되는 경쟁 상태가 생겨
    // 알림톡이 끝내 발송되지 않는 사고가 있었다(자녀궁합, 2026-09-17). 대신 전부
    // 병렬로 생성만 해두고, 다 모인 뒤 딱 한 번만 합쳐서 저장한다 — 저장이 정확히
    // 한 번만 일어나므로 경쟁 상태 자체가 생기지 않고, 완성 여부 판단도 그 한 번의
    // 저장 시점에 정확하게 이루어진다.
    const merged: Record<string, unknown> = {};
    await Promise.all(
      Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).map(async (chapter) => {
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
      }),
    );

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


const PRODUCT_NAME = "자녀궁합";
const PRODUCT_PRICE = 29900;
const REPORT_PATH = "saju/kunghap_janyeo/report-preview";

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

  const { data: order } = await service.from("orders").select("id, amount, status, guest_email, product_id").eq("order_id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "paid") {
    const { data: result } = await service.from("saju_results").select("id").eq("order_id", order.id).maybeSingle();
    if (result) {
      const { data: si } = await service.from("saju_inputs").select("name, gender").eq("order_id", order.id).maybeSingle();
      return NextResponse.json({ resultId: result.id, name: si?.name ?? "", gender: si?.gender ?? "male", alreadyPaid: true });
    }
  }
  if (order.amount !== amount) return NextResponse.json({ error: "금액이 일치하지 않습니다" }, { status: 400 });

  const isLive = !(await isCurrentUserAdmin());
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
    const userConcern = concernsArr.length >= 2 ? concernsArr[0] : "";
    const partnerData = JSON.parse(partnerDataRaw);
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

    const pg: "male" | "female" = pGenderRaw === "female" || pGenderRaw === "여아" || pGenderRaw === "여성" || pGenderRaw === "여자" ? "female" : "male";
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

    return NextResponse.json({ resultId: result.id, name: input.name ?? "", gender: g, partnerName: pName ?? "", partnerGender: pg });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
