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
export const metadata = { title: "재물사주 결과지" };

const CREAM = "#fdf8f4";
const WHITE = "#ffffff";
const RED = "#9b2335";
const GRAY1 = "#1a1a1a";
const GRAY3 = "#888888";

type SP = { name?: string; date?: string; time?: string; calendar?: string; gender?: string; concern?: string };

function toBirthInfo(sp: SP): {
  birthInfo: BirthInfo;
  computeInput: Parameters<typeof computeMyeongsik>[0];
} | null {
  const parsed = parseDate(sp.date ?? "");
  if (!parsed) return null;
  const cal = parseCalendar(sp.calendar ?? "양력");
  const timeVal = parseTimeVal(sp.time ?? "");
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
  const concern = sp.concern?.trim() || "";

  const converted = toBirthInfo(sp);

  if (!converted) {
    return (
      <div className="px-6 py-16 text-center" style={{ backgroundColor: CREAM, minHeight: "100%" }}>
        <p className="text-[15px]" style={{ color: GRAY1 }}>생년월일 정보를 읽을 수 없습니다.</p>
        <p className="mt-2 text-[13px]" style={{ color: GRAY3 }}>입력 화면에서 다시 진행해 주세요.</p>
      </div>
    );
  }

  const { birthInfo, computeInput } = converted;

  let myeongsik: Myeongsik;
  let manseryeokText: string | undefined;
  let myeongsikView: MyeongsikView | null = null;
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

  const { system, user } = buildSajuPrompt({
    productSlug: "premium-saju",
    productName: "재물사주 정밀 리포트",
    myeongsik,
    manseryeokText,
    birthDate: computeInput.birthDate,
    birthTime: computeInput.birthTime,
    timeUnknown: computeInput.timeUnknown,
    gender: birthInfo.gender,
    concerns: concern ? [concern] : [],
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
      <header className="px-6 pt-8 pb-5 text-center" style={{ background: WHITE, borderBottom: `1px solid ${RED}1a` }}>
        <p className="text-[12px] tracking-wide mb-2" style={{ color: RED }}>
          재물사주 · 정밀 리포트
        </p>
        <h1 className="text-[24px] font-black leading-snug" style={{ color: GRAY1 }}>
          {name}님의 재물운 풀이
        </h1>
        <p className="mt-2 text-[12px]" style={{ color: GRAY3 }}>
          {computeInput.birthDate}
          {computeInput.timeUnknown ? " · 시 미상" : ` · ${computeInput.birthTime}`} ·{" "}
          {birthInfo.gender === "male" ? "남성" : "여성"}
        </p>
      </header>

      <section className="px-6 pt-7">
        <h2 className="text-[14px] font-bold mb-3" style={{ color: GRAY1 }}>사주 명식 (四柱)</h2>
        <PillarTable m={myeongsik} />
        {myeongsikView && (
          <div className="mt-3">
            <MyeongsikModalButton view={myeongsikView} />
          </div>
        )}
      </section>

      <section className="px-6 pt-8 pb-12">
        <h2 className="text-[14px] font-bold mb-3" style={{ color: GRAY1 }}>상세 해석</h2>
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
