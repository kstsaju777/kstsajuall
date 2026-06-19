// =====================================================
// 명식 모달 데이터 API
// =====================================================
// 결제자가 입력한 생년월일/시간/성별(funnel 쿼리 형식)을 받아
// 운세위키(luckyloveme) 풀 분석을 호출하고, 명식 뷰로 가공해 반환한다.
// 명식 모달을 "열 때" 만 호출 → 불필요한 API 과금 방지.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  isSajuApiConfigured,
  fetchSajuAnalysis,
  type AnalysisField,
  type BirthInfo,
} from "@/lib/saju/saju-api";
import { buildMyeongsikView } from "@/lib/saju/myeongsik-view";
import { parseDate, parseTimeVal, parseCalendar } from "@/lib/saju/local-manseryeok";

const bodySchema = z.object({
  date: z.string().min(1), // "1990.05.15" (점 구분)
  time: z.string().optional().default(""), // "오시 (11:00~13:00)" 또는 "시간 모름"
  calendar: z.string().optional().default("양력"),
  gender: z.string().optional().default(""), // "남자"/"여자"/"male"/"female"
});

const FIELDS: AnalysisField[] = ["ganji", "sipseong", "twelveFortune", "sibisinsals", "guiin", "hongyeom", "dohwa", "hwagae", "daeun", "seun", "weolun", "sinStrength"];

export async function POST(request: NextRequest) {
  if (!isSajuApiConfigured()) {
    return NextResponse.json({ error: "사주 API가 설정되지 않았습니다." }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { date, time, calendar, gender } = parsed.data;

  const ymd = parseDate(date);
  if (!ymd) {
    return NextResponse.json({ error: "생년월일 형식 오류" }, { status: 400 });
  }
  const cal = parseCalendar(calendar); // solar | lunar | leap
  const timeVal = parseTimeVal(time); // 'unknown' | 'HH:MM'
  const hasTime = timeVal !== "unknown";
  const [hh, mm] = hasTime ? timeVal.split(":") : ["", ""];
  const g: "male" | "female" = gender === "여자" || gender === "female" ? "female" : "male";

  const birthInfo: BirthInfo = {
    birthYear: String(ymd.year),
    birthMonth: String(ymd.month),
    birthDay: String(ymd.day),
    ...(hasTime ? { birthHour: String(Number(hh)), birthMinute: String(Number(mm)) } : {}),
    calendarType: cal === "solar" ? "양력" : "음력",
    gender: g,
    isLeapMonth: cal === "leap",
  };

  try {
    const analysis = await fetchSajuAnalysis(birthInfo, FIELDS, { source: "manual" });
    return NextResponse.json({ view: buildMyeongsikView(analysis) });
  } catch (err) {
    return NextResponse.json(
      { error: "명식 조회 실패", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
