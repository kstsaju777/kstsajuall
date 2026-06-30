// =====================================================
// 정통사주 결과지 (report)
// =====================================================
// checkout 결제 후 이동 / 이메일 링크 클릭 시 도착하는 고객용 결과지.
// 쿼리값(name/date/time/calendar/gender)만으로 서버에서 명식 + LLM 해석을 생성한다.
// 생성 파이프라인은 /api/orders/confirm 과 동일 (luckyloveme → Claude).
//
// ⚠️ 현재는 접속할 때마다 luckyloveme + LLM 을 호출한다(쿼리 기반, DB 저장 없음).
//    이메일 링크/재방문에서 매번 재생성·과금되므로, 다음 단계에서 saju_results 에
//    저장하고 resultId 로 조회하는 구조로 전환 권장.

import { ResultBody } from "@/components/saju/ResultBody";
import { buildSajuPrompt } from "@/lib/saju/prompt";
import { generateInterpretation } from "@/lib/saju/llm";
import { computeMyeongsik, type Myeongsik } from "@/lib/saju/manseryeok";
import {
  isSajuApiConfigured,
  fetchSajuAnalysis,
  formatSajuToManseryeok,
  ganjiToMyeongsik,
  type BirthInfo,
} from "@/lib/saju/saju-api";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";
import { buildMyeongsikView, type MyeongsikView } from "@/lib/saju/myeongsik-view";
import { MyeongsikModalButton } from "@/components/saju/MyeongsikModal";

export const dynamic = "force-dynamic";
export const metadata = { title: "정통사주 결과지" };

// ─── 디자인 토큰 (saju_jeongtong 흐름과 동일) ───────────────────────────
const CREAM = "#fdf8f4";
const WHITE = "#ffffff";
const RED = "#9b2335";
const GRAY1 = "#1a1a1a";
const GRAY3 = "#888888";

type SP = { name?: string; date?: string; time?: string; calendar?: string; gender?: string };

// 쿼리값 → luckyloveme/LLM 입력으로 변환
function toBirthInfo(sp: SP): {
  birthInfo: BirthInfo;
  computeInput: Parameters<typeof computeMyeongsik>[0];
} | null {
  const parsed = parseDate(sp.date ?? "");
  if (!parsed) return null;
  const cal = parseCalendar(sp.calendar ?? "양력"); // solar | lunar | leap
  const timeVal = parseTimeVal(sp.time ?? ""); // 'unknown' | 'HH:MM'
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const gender: "male" | "female" = sp.gender === "여자" || sp.gender === "female" ? "female" : "male";

  const birthInfo: BirthInfo = {
    birthYear: String(parsed.year),
    birthMonth: String(parsed.month),
    birthDay: String(parsed.day),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType: cal === "solar" ? "양력" : "음력",
    gender,
    isLeapMonth: cal === "leap",
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const computeInput = {
    birthDate: `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`,
    birthTime: hasTime ? `${pad(Number(hh))}:${pad(Number(mm))}` : null,
    timeUnknown: !hasTime,
    calendar: (cal === "solar" ? "solar" : "lunar") as "solar" | "lunar",
    gender,
  };

  return { birthInfo, computeInput };
}

// 4기둥 명식표 (모바일 결과지용 — 크림/레드 톤)
function PillarTable({ m }: { m: Myeongsik }) {
  const cols = [
    { label: "시주", p: m.hour },
    { label: "일주", p: m.day },
    { label: "월주", p: m.month },
    { label: "년주", p: m.year },
  ];
  return (
    <div className="grid grid-cols-4 rounded-2xl overflow-hidden" style={{ border: `1px solid ${RED}22` }}>
      {cols.map((c) => (
        <div key={c.label} className="text-center" style={{ background: WHITE }}>
          <div className="py-2 text-[11px] font-bold" style={{ background: `${RED}0d`, color: RED }}>
            {c.label}
          </div>
          <div className="py-3 text-[22px] font-black" style={{ color: GRAY1 }}>
            {c.p ? c.p.cheongan : "—"}
          </div>
          <div className="pb-3 text-[22px] font-black" style={{ color: GRAY1 }}>
            {c.p ? c.p.jiji : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const name = sp.name?.trim() || "고객";

  const converted = toBirthInfo(sp);

  if (!converted) {
    return (
      <div className="px-6 py-16 text-center" style={{ backgroundColor: CREAM, minHeight: "100%" }}>
        <p className="text-[15px]" style={{ color: GRAY1 }}>
          생년월일 정보를 읽을 수 없습니다.
        </p>
        <p className="mt-2 text-[13px]" style={{ color: GRAY3 }}>
          입력 화면에서 다시 진행해 주세요.
        </p>
      </div>
    );
  }

  const { birthInfo, computeInput } = converted;

  // 명식: luckyloveme 우선, 실패 시 mock 폴백 (confirm 라우트와 동일)
  let myeongsik: Myeongsik;
  let manseryeokText: string | undefined;
  let myeongsikView: MyeongsikView | null = null; // 같은 응답으로 명식 모달용 뷰도 생성 (추가 호출 없음)
  if (isSajuApiConfigured()) {
    try {
      const analysis = await fetchSajuAnalysis(birthInfo, [], { source: "manual" });
      const ganji = ganjiToMyeongsik(analysis);
      if (ganji) {
        myeongsik = ganji;
        manseryeokText = formatSajuToManseryeok(analysis, birthInfo);
        myeongsikView = buildMyeongsikView(analysis);
      } else {
        myeongsik = await computeMyeongsik(computeInput);
      }
    } catch {
      myeongsik = await computeMyeongsik(computeInput);
    }
  } else {
    myeongsik = await computeMyeongsik(computeInput);
  }

  // LLM 해석 (정통사주 = premium 분량)
  const { system, user } = buildSajuPrompt({
    productSlug: "premium-saju",
    productName: "정통사주 정밀 리포트",
    myeongsik,
    manseryeokText,
    birthDate: computeInput.birthDate,
    birthTime: computeInput.birthTime,
    timeUnknown: computeInput.timeUnknown,
    gender: birthInfo.gender,
    concerns: [],
  });

  let interpretation = "";
  let llmFailed = false;
  try {
    const llm = await generateInterpretation({ system, user });
    interpretation = llm.text;
  } catch {
    llmFailed = true;
  }

  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100%" }}>
      {/* 헤더 */}
      <header className="px-6 pt-8 pb-5 text-center" style={{ background: WHITE, borderBottom: `1px solid ${RED}1a` }}>
        <p className="text-[12px] tracking-wide mb-2" style={{ color: RED }}>
          정통사주 · 정밀 리포트
        </p>
        <h1 className="text-[24px] font-black leading-snug" style={{ color: GRAY1 }}>
          {name}님의 사주 풀이
        </h1>
        <p className="mt-2 text-[12px]" style={{ color: GRAY3 }}>
          {computeInput.birthDate}
          {computeInput.timeUnknown ? " · 시 미상" : ` · ${computeInput.birthTime}`} ·{" "}
          {birthInfo.gender === "male" ? "남성" : "여성"}
        </p>
      </header>

      {/* 명식표 */}
      <section className="px-6 pt-7">
        <h2 className="text-[14px] font-bold mb-3" style={{ color: GRAY1 }}>
          사주 명식 (四柱)
        </h2>
        <PillarTable m={myeongsik} />
        {myeongsikView && (
          <div className="mt-3">
            <MyeongsikModalButton view={myeongsikView} />
          </div>
        )}
      </section>

      {/* 해석 */}
      <section className="px-6 pt-8 pb-12">
        <h2 className="text-[14px] font-bold mb-3" style={{ color: GRAY1 }}>
          상세 해석
        </h2>
        {llmFailed ? (
          <p className="text-[14px] leading-relaxed" style={{ color: GRAY1 }}>
            해석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <div style={{ color: GRAY1 }}>
            <ResultBody markdown={interpretation} />
          </div>
        )}
      </section>
    </div>
  );
}
