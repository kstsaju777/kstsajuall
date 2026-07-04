"use client";

// =====================================================
// 나의 명식 모달 (공용)
// =====================================================
// report / report-preview 공용. MyeongsikView 를 받아 원국·십성·지장간·
// 십이운성·신살·대운·세운·월운 을 그린다.
//  • MyeongsikModalView : 순수 표시 (open/onClose/view/loading 제어)
//  • MyeongsikModalButton: 버튼 + 모달 (view 를 받아 자체 open 상태 관리)

import { useEffect, useState } from "react";
import type { MyeongsikView, MsFlowItem, MsPillar } from "@/lib/saju/myeongsik-view";
import { applyLocalSinsal } from "@/lib/saju/myeongsik-view";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { yearGanji, monthGanji } from "@/lib/saju/ganji-calc";
import { sipseongOfStem, sipseongOfBranch } from "@/lib/saju/sipseong-calc";

const CREAM = "#fdf8f4";
const WHITE = "#ffffff";
const INK = "#2a2320";
const INK_SOFT = "#5b504a";
const MUTE = "#9a8f88";
const MAROON = "#9b2335";
const EL_COLOR: Record<string, string> = { 목: "#2e7d32", 화: "#c62828", 토: "#a9791c", 금: "#6b7a82", 수: "#1565c0" };
const GRID_COLS = "44px repeat(4, 1fr)";
const GUIIN_COLOR: Record<string, string> = {
  천을귀인: "#9b2335",
  문창귀인: "#1565c0",
  천덕귀인: "#2e7d32",
  월덕귀인: "#2e7d32",
  태극귀인: "#a9791c",
  문곡귀인: "#6b3fa0",
  학당귀인: "#0288d1",
};
function guiinColor(s: string): string {
  for (const [k, v] of Object.entries(GUIIN_COLOR)) if (s.includes(k)) return v;
  return s.includes("귀인") ? MAROON : "#cccccc";
}

const flow = (rows: [string, string][], cur: number): MsFlowItem[] =>
  rows.map(([label, gz], i) => ({ label, gz, active: i === cur }));

export const SAMPLE_VIEW: MyeongsikView = {
  ilgan: "乙 (을목)",
  pillars: [
    { pos: "시주", sipTop: "정관", gan: "庚", ganEl: "금", ji: "申", jiEl: "금", sipBot: "정관", jijang: "戊·壬·庚", unseong: "태", sinsal: "역마" },
    { pos: "일주", sipTop: "일간(나)", gan: "乙", ganEl: "목", ji: "卯", jiEl: "목", sipBot: "비견", jijang: "甲·乙", unseong: "건록", sinsal: "도화" },
    { pos: "월주", sipTop: "편인", gan: "癸", ganEl: "수", ji: "子", jiEl: "수", sipBot: "편인", jijang: "壬·癸", unseong: "병", sinsal: "화개" },
    { pos: "년주", sipTop: "정재", gan: "戊", ganEl: "토", ji: "辰", jiEl: "토", sipBot: "정재", jijang: "乙·癸·戊", unseong: "관대", sinsal: "백호" },
  ],
  daeun: [
    { label: "3", gz: "甲子", active: false, yearStart: 1993 },
    { label: "13", gz: "乙丑", active: false, yearStart: 2003 },
    { label: "23", gz: "丙寅", active: false, yearStart: 2013 },
    { label: "33", gz: "丁卯", active: true, yearStart: 2023 },
    { label: "43", gz: "戊辰", active: false, yearStart: 2033 },
    { label: "53", gz: "己巳", active: false, yearStart: 2043 },
    { label: "63", gz: "庚午", active: false, yearStart: 2053 },
  ],
  seun: flow([["2023", "癸卯"], ["2024", "甲辰"], ["2025", "乙巳"], ["2026", "丙午"], ["2027", "丁未"], ["2028", "戊申"]], 2),
  weolun: flow([["1월", "丁丑"], ["2월", "戊寅"], ["3월", "己卯"], ["4월", "庚辰"], ["5월", "辛巳"], ["6월", "壬午"]], -1),
  currentYear: 2026,
  currentMonth: 6,
};

function MsRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center text-[12px] font-bold" style={{ color: MUTE, background: "#f4ece7" }}>
      {children}
    </div>
  );
}

// 대운/세운/월운 간지 한 글자 이미지 (이미지 없으면 텍스트 폴백)
function CharImgMini({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{alt}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: "contain" }} />;
}

function FlowRow({ title, items, onSelect }: { title: string; items: MsFlowItem[]; onSelect?: (i: number) => void }) {
  return (
    <div className="mt-5">
      <p className="text-[12.5px] mb-2">
        {title.split(" · ").map((part, i) => {
          if (i !== 0) return <span key={i} style={{ fontWeight: 400, color: MUTE }}> · {part}</span>;
          // 첫 번째 파트: 괄호 안을 파란색으로
          const m = part.match(/^(.*?)(\(.*\))(.*)$/);
          if (!m) return <span key={i} className="font-black" style={{ color: INK }}>{part}</span>;
          return (
            <span key={i} className="font-black" style={{ color: INK }}>
              {m[1]}<span style={{ color: "#1565c0" }}>{m[2]}</span>{m[3]}
            </span>
          );
        })}
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={onSelect ? () => onSelect(i) : undefined}
            className="flex-shrink-0 text-center rounded-lg px-2 py-1.5"
            style={{
              minWidth: 44,
              cursor: onSelect ? "pointer" : "default",
              background: it.active ? `${MAROON}10` : "#f6efea",
              border: it.active ? `1px solid ${MAROON}66` : `1px solid ${INK}0d`,
            }}
          >
            <div className="text-[10px] font-bold" style={{ color: INK }}>{it.label}</div>
            {it.gz.length >= 2 ? (
              <div className="mt-1 flex flex-col items-center gap-0.5">
                {it.sipTop && <span style={{ fontSize: 12, lineHeight: 1.3, color: it.active ? MAROON : MUTE }}>{it.sipTop}</span>}
                <CharImgMini src={ganCharImage(it.gz[0])} alt={it.gz[0]} />
                <CharImgMini src={jiCharImage(it.gz[1])} alt={it.gz[1]} />
                {it.sipBot && <span style={{ fontSize: 12, lineHeight: 1.3, color: it.active ? MAROON : MUTE }}>{it.sipBot}</span>}
              </div>
            ) : (
              <div className="text-[14px] font-bold mt-0.5" style={{ color: INK }}>{it.gz}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function GridRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-stretch" style={{ gridTemplateColumns: GRID_COLS, borderTop: `1px solid ${INK}0d` }}>
      <MsRowLabel>{label}</MsRowLabel>
      {children}
    </div>
  );
}
function CellText({ children, color = INK_SOFT, size = 13 }: { children: React.ReactNode; color?: string; size?: number }) {
  const text = children === "일원" ? "일간(나)" : children;
  return (
    <div className="py-0.5 text-center" style={{ background: WHITE }}>
      <span style={{ color, fontSize: size }}>{text}</span>
    </div>
  );
}
// 글자 이미지 셀 (이미지 없으면 텍스트로 폴백)
function CellImg({ src, alt, el }: { src: string; alt: string; el: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="flex items-center justify-center" style={{ background: WHITE, padding: "0px 4px" }}>
      {err ? (
        <span className="font-black" style={{ color: EL_COLOR[el] ?? INK, fontSize: 18 }}>{alt}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: 64, height: 64, objectFit: "contain" }} />
      )}
    </div>
  );
}

// 지장간 작은 글자 이미지 (이미지 없으면 텍스트 폴백)
function SmallGan({ ch }: { ch: string }) {
  const [err, setErr] = useState(false);
  if (err) return <span style={{ fontSize: 10.5, color: INK_SOFT }}>{ch}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ganCharImage(ch)} alt={ch} onError={() => setErr(true)} style={{ width: 18, height: 18, objectFit: "contain" }} />;
}
function CellJijang({ text, ilgan }: { text: string; ilgan: string }) {
  const chars = text.split("·").map((c) => c.trim()).filter(Boolean);
  if (chars.length === 0) return (
    <div className="py-1.5 flex items-center justify-center" style={{ background: WHITE }}>
      <span style={{ fontSize: 10.5, color: INK_SOFT }}>—</span>
    </div>
  );
  const rows: { ch: string | null; sip: string }[] = [];
  chars.forEach((c, i) => {
    rows.push({ ch: c, sip: sipseongOfStem(ilgan, c) });
    if (chars.length === 2 && i === 0) rows.push({ ch: null, sip: "-" });
  });
  return (
    <div className="py-1 flex flex-col items-center justify-center gap-1" style={{ background: WHITE }}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-center" style={{ gap: 4, width: "100%" }}>
          <div style={{ width: 18, height: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {r.ch === null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/media/saju/cheongan/hipeun.png" alt="-" style={{ width: 18, height: 18, objectFit: "contain" }} />
            ) : (
              <SmallGan ch={r.ch} />
            )}
          </div>
          <span style={{ fontSize: 12, color: MUTE, whiteSpace: "nowrap", minWidth: 24 }}>{r.ch === null ? "-" : r.sip}</span>
        </div>
      ))}
    </div>
  );
}

type MyeongsikMeta = { name: string; gender: string; date: string; calendar: string; time: string };

// "HH:MM" → "자시", "신시" 등 (야자시 기준: 23:30 이후 = 자시)
function timeToSi(hhmm: string): string {
  const SI = ["자시","축시","인시","묘시","진시","사시","오시","미시","신시","유시","술시","해시"];
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr), m = Number(mStr || 0);
  const total = h * 60 + m;
  // 야자시 포함: 23:30 이상이면 자시(0), 이후 2시간 단위
  const adj = total >= 23 * 60 + 30 ? total - 23 * 60 - 30 : total + 30;
  return SI[Math.floor(adj / 120) % 12] ?? "";
}

const GAN_KR: Record<string, string> = { 甲:"갑", 乙:"을", 丙:"병", 丁:"정", 戊:"무", 己:"기", 庚:"경", 辛:"신", 壬:"임", 癸:"계" };
const JI_KR: Record<string, string> = { 子:"자", 丑:"축", 寅:"인", 卯:"묘", 辰:"진", 巳:"사", 午:"오", 未:"미", 申:"신", 酉:"유", 戌:"술", 亥:"해" };

export function MyeongsikModalView({ open, onClose, view, loading, meta, titleOverride, genderOverride }: { open: boolean; onClose: () => void; view: MyeongsikView | null; loading: boolean; meta?: MyeongsikMeta; titleOverride?: string; genderOverride?: (gender: string) => string }) {
  const v = view ?? SAMPLE_VIEW;
  const ps: MsPillar[] = applyLocalSinsal(v.pillars);

  // 대운 → 세운 → 월운 드릴다운
  const [selDaeun, setSelDaeun] = useState(() => Math.max(0, v.daeun.findIndex((d) => d.active)));
  const [selYear, setSelYear] = useState(v.currentYear);

  // view 가 바뀌면(샘플 → 실제) 선택 초기화
  useEffect(() => {
    const di = Math.max(0, v.daeun.findIndex((d) => d.active));
    setSelDaeun(di);
    const y0 = v.daeun[di]?.yearStart || v.currentYear;
    setSelYear(v.currentYear >= y0 && v.currentYear <= y0 + 9 ? v.currentYear : y0);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const ys = v.daeun[selDaeun]?.yearStart || v.currentYear;
  const ilgan = v.pillars[1]?.gan ?? ""; // 일주 천간
  const sip = (gz: string): { sipTop?: string; sipBot?: string } =>
    gz.length >= 2 ? { sipTop: sipseongOfStem(ilgan, gz[0]), sipBot: sipseongOfBranch(ilgan, gz[1]) } : {};
  const daeunItems: MsFlowItem[] = v.daeun.map((d, i) => ({ label: d.label, gz: d.gz, active: i === selDaeun, ...sip(d.gz) }));
  const seunItems: MsFlowItem[] = Array.from({ length: 10 }, (_, i) => {
    const y = ys + i;
    const g = yearGanji(y);
    return { label: String(y), gz: g, active: y === selYear, ...sip(g) };
  });
  const weolunItems: MsFlowItem[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const g = monthGanji(selYear, m);
    return { label: `${m}월`, gz: g, active: selYear === v.currentYear && m === v.currentMonth, ...sip(g) };
  });

  const pickDaeun = (i: number) => {
    setSelDaeun(i);
    const y0 = v.daeun[i]?.yearStart || v.currentYear;
    setSelYear(v.currentYear >= y0 && v.currentYear <= y0 + 9 ? v.currentYear : y0);
  };

  return (
    <div
      className="fixed inset-y-0 z-50 flex items-start justify-center"
      style={{
        width: "min(100%, 480px)",
        left: "max(0px, calc(50vw - 240px))",
        pointerEvents: open ? "auto" : "none",
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 76,
        paddingBottom: 20,
      }}
    >
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0, transition: "opacity 0.25s ease" }}
      />
      <div
        className="relative w-full flex flex-col rounded-3xl"
        style={{
          maxHeight: "100%",
          background: CREAM,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
      >
        {/* 고정 헤더 */}
        <div
          className="px-5 pt-5 pb-3 rounded-t-3xl flex-shrink-0"
          style={{ background: CREAM, borderBottom: `1px solid ${INK}10` }}
        >
          {/* 1행: 제목 + 닫기 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[18px] font-black" style={{ color: INK }}>{titleOverride ?? (meta?.name ? `${meta.name}님 명식` : "나의 명식")}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full"
              style={{ width: 30, height: 30, background: `${INK}0d`, color: INK_SOFT, fontSize: 15, lineHeight: 1, flexShrink: 0 }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          {/* 2행: 정보 태그 */}
          {meta && (() => {
            const iljuP = v.pillars[1];
            const iljuStr = iljuP ? `${GAN_KR[iljuP.gan] ?? iljuP.gan}${JI_KR[iljuP.ji] ?? iljuP.ji}일주` : "";
            const rawGender = meta.gender === "female" || meta.gender === "여자" ? "여성" : meta.gender === "male" || meta.gender === "남자" ? "남성" : meta.gender;
            const genderLabel = genderOverride ? genderOverride(rawGender) : rawGender;
            const siStr = meta.time && meta.time !== "시간 모름" ? timeToSi(meta.time) : "시간 모름";
            const tags = [
              `${meta.name} (${genderLabel})`,
              `${meta.date} (${meta.calendar})`,
              siStr,
              iljuStr,
            ].filter(Boolean);
            return (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[13px] px-2.5 py-1 rounded-full"
                    style={{ background: `${INK}0d`, color: INK_SOFT }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>

        {/* 스크롤 영역 */}
        <div
          className="overflow-y-auto px-5 pb-6 pt-3"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${INK}14` }}>
            <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>
              <MsRowLabel>구분</MsRowLabel>
              {ps.map((p) => (
                <div key={p.pos} className="py-1.5 text-center text-[13px] font-bold" style={{ color: INK, background: "#efe3df" }}>
                  {p.pos}
                </div>
              ))}
            </div>
            <GridRow label="십성">{ps.map((p, i) => <CellText key={i}>{p.sipTop}</CellText>)}</GridRow>
            <GridRow label="천간">{ps.map((p, i) => <CellImg key={i} src={ganCharImage(p.gan)} alt={p.gan} el={p.ganEl} />)}</GridRow>
            <GridRow label="지지">{ps.map((p, i) => <CellImg key={i} src={jiCharImage(p.ji)} alt={p.ji} el={p.jiEl} />)}</GridRow>
            <GridRow label="십성">{ps.map((p, i) => <CellText key={i}>{p.sipBot}</CellText>)}</GridRow>
            <GridRow label="지장간">{ps.map((p, i) => <CellJijang key={i} text={p.jijang} ilgan={ilgan} />)}</GridRow>
            <GridRow label="운성">{ps.map((p, i) => <CellText key={i}>{p.unseong}</CellText>)}</GridRow>
            <GridRow label="신살">{ps.map((p, i) => (
              <div key={i} className="py-1.5 text-center" style={{ background: WHITE }}>
                {p.sinsal ? p.sinsal.split(/[,\s·]+/).filter(Boolean).map((s, j) => (
                  <div key={j} style={{ color: MAROON, fontSize: 13 }}>{s}</div>
                )) : <span style={{ color: MAROON, fontSize: 13 }}>—</span>}
              </div>
            ))}</GridRow>
          </div>

          <FlowRow title={`대운 (대운수 : ${v.daeun[0]?.label ?? "?"}) · 눌러서 세운 보기`} items={daeunItems} onSelect={pickDaeun} />
          <FlowRow title={`세운 (${ys}~${ys + 9}) · 눌러서 월운 보기`} items={seunItems} onSelect={(i) => setSelYear(ys + i)} />
          <FlowRow title={`월운 (${selYear}년)`} items={weolunItems} />

          {!view && (
            <p className="text-[10.5px] mt-5 text-center" style={{ color: MUTE }}>
              ※ 현재는 샘플 명식입니다. 생년월일·시간·성별이 전달되면 실제 명식이 표시됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 한자 일주 → 일주 캐릭터 이미지 파일명
const ILJU_IMG: Record<string, string> = {
  "甲子":"01.갑자","乙丑":"02.을축","丙寅":"03.병인","丁卯":"04.정묘","戊辰":"05.무진",
  "己巳":"06.기사","庚午":"07.경오","辛未":"08.신미","壬申":"09.임신","癸酉":"10.계유",
  "甲戌":"11.갑술","乙亥":"12.을해","丙子":"13.병자","丁丑":"14.정축","戊寅":"15.무인",
  "己卯":"16.기묘","庚辰":"17.경진","辛巳":"18.신사","壬午":"19.임오","癸未":"20.계미",
  "甲申":"21.갑신","乙酉":"22.을유","丙戌":"23.병술","丁亥":"24.정해","戊子":"25.무자",
  "己丑":"26.기축","庚寅":"27.경인","辛卯":"28.신묘","壬辰":"29.임진","癸巳":"30.계사",
  "甲午":"31.갑오","乙未":"32.을미","丙申":"33.병신","丁酉":"34.정유","戊戌":"35.무술",
  "己亥":"36.기해","庚子":"37.경자","辛丑":"38.신축","壬寅":"39.임인","癸卯":"40.계묘",
  "甲辰":"41.갑진","乙巳":"42.을사","丙午":"43.병오","丁未":"44.정미","戊申":"45.무신",
  "己酉":"46.기유","庚戌":"47.경술","辛亥":"48.신해","壬子":"49.임자","癸丑":"50.계축",
  "甲寅":"51.갑인","乙卯":"52.을묘","丙辰":"53.병진","丁巳":"54.정사","戊午":"55.무오",
  "己未":"56.기미","庚申":"57.경신","辛酉":"58.신유","壬戌":"59.임술","癸亥":"60.계해",
};

// 명식 테이블만 인라인 표시 (모달 없이 페이지에 직접 삽입용)
export function MyeongsikTable({ view, name, birth, rows, hideLabel, header }: {
  view: MyeongsikView | null;
  name: string;
  birth: { date: string; calendar: string; time: string } | null;
  rows?: ("sipTop" | "gan" | "ji" | "sipBot" | "jijang" | "unseong" | "sinsal")[];
  hideLabel?: boolean;
  header?: React.ReactNode;
}) {
  const v = view ?? SAMPLE_VIEW;
  const ps = applyLocalSinsal(v.pillars);
  const ilgan = v.pillars[1]?.gan ?? "";
  const show = rows ? new Set(rows) : new Set(["sipTop","gan","ji","sipBot","jijang","unseong","sinsal"]);
  const gc = hideLabel ? "repeat(4, 1fr)" : GRID_COLS;
  return (
    <div className="mx-5 my-2 rounded-2xl p-5" style={{ background: "linear-gradient(#faf3e4, #f1e3cc)", border: "1px solid #d8c4a0", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
      {header && <div className="mb-3">{header}</div>}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${INK}14` }}>
        <div className="grid" style={{ gridTemplateColumns: gc }}>
          {!hideLabel && <MsRowLabel>구분</MsRowLabel>}
          {ps.map((p) => (
            <div key={p.pos} className="py-1.5 text-center text-[13px] font-bold" style={{ color: INK, background: "#efe3df" }}>
              {p.pos}
            </div>
          ))}
        </div>
        {show.has("sipTop") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>십성</MsRowLabel>}{ps.map((p, i) => <CellText key={i}>{p.sipTop}</CellText>)}</div>}
        {show.has("gan") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>천간</MsRowLabel>}{ps.map((p, i) => <CellImg key={i} src={ganCharImage(p.gan)} alt={p.gan} el={p.ganEl} />)}</div>}
        {show.has("ji") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc }}>{!hideLabel && <MsRowLabel>지지</MsRowLabel>}{ps.map((p, i) => <CellImg key={i} src={jiCharImage(p.ji)} alt={p.ji} el={p.jiEl} />)}</div>}
        {show.has("sipBot") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>십성</MsRowLabel>}{ps.map((p, i) => <CellText key={i}>{p.sipBot}</CellText>)}</div>}
        {show.has("jijang") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>지장간</MsRowLabel>}{ps.map((p, i) => <CellJijang key={i} text={p.jijang} ilgan={ilgan} />)}</div>}
        {show.has("unseong") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>운성</MsRowLabel>}{ps.map((p, i) => <CellText key={i}>{p.unseong}</CellText>)}</div>}
        {show.has("sinsal") && <div className="grid items-stretch" style={{ gridTemplateColumns: gc, borderTop: `1px solid ${INK}0d` }}>{!hideLabel && <MsRowLabel>신살</MsRowLabel>}{ps.map((p, i) => (
          <div key={i} className="py-1.5 text-center" style={{ background: WHITE }}>
            {p.sinsal ? p.sinsal.split(/[,\s·]+/).filter(Boolean).map((s, j) => (
              <div key={j} style={{ color: guiinColor(s), fontSize: 13, fontWeight: s.includes("귀인") ? 700 : 400 }}>{s}</div>
            )) : <span style={{ color: INK, fontSize: 13 }}>—</span>}
          </div>
        ))}</div>}
      </div>
    </div>
  );
}

// 버튼 + 모달 일체형 (서버에서 view 를 받아 쓰는 페이지용)
export function MyeongsikModalButton({ view, label = "나의 명식 전체 보기" }: { view: MyeongsikView; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5"
        style={{ color: MAROON, border: `1px solid ${MAROON}55`, background: `${MAROON}0a` }}
      >
        🔮 {label}
      </button>
      <MyeongsikModalView open={open} onClose={() => setOpen(false)} view={view} loading={false} />
    </>
  );
}
