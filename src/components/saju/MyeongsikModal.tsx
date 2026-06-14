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

const flow = (rows: [string, string][], cur: number): MsFlowItem[] =>
  rows.map(([label, gz], i) => ({ label, gz, active: i === cur }));

export const SAMPLE_VIEW: MyeongsikView = {
  ilgan: "乙 (을목)",
  pillars: [
    { pos: "시주", sipTop: "정관", gan: "庚", ganEl: "금", ji: "申", jiEl: "금", sipBot: "정관", jijang: "戊·壬·庚", unseong: "태", sinsal: "역마" },
    { pos: "일주", sipTop: "일원", gan: "乙", ganEl: "목", ji: "卯", jiEl: "목", sipBot: "비견", jijang: "甲·乙", unseong: "건록", sinsal: "도화" },
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
    <div className="flex items-center justify-center text-[10.5px] font-bold" style={{ color: MUTE, background: "#f4ece7" }}>
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
      <p className="text-[12.5px] font-black mb-2" style={{ color: INK }}>{title}</p>
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
function CellText({ children, color = INK_SOFT, size = 11 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <div className="py-1.5 text-center" style={{ background: WHITE }}>
      <span style={{ color, fontSize: size }}>{children}</span>
    </div>
  );
}
// 글자 이미지 셀 (이미지 없으면 텍스트로 폴백)
function CellImg({ src, alt, el }: { src: string; alt: string; el: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="py-1.5 flex items-center justify-center" style={{ background: WHITE }}>
      {err ? (
        <span className="font-black" style={{ color: EL_COLOR[el] ?? INK, fontSize: 20 }}>{alt}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: 75, height: 75, objectFit: "contain" }} />
      )}
    </div>
  );
}

// 지장간 작은 글자 이미지 (이미지 없으면 텍스트 폴백)
function SmallGan({ ch }: { ch: string }) {
  const [err, setErr] = useState(false);
  if (err) return <span style={{ fontSize: 10.5, color: INK_SOFT }}>{ch}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ganCharImage(ch)} alt={ch} onError={() => setErr(true)} style={{ width: 23, height: 23, objectFit: "contain" }} />;
}
function CellJijang({ text }: { text: string }) {
  const chars = text.split("·").map((c) => c.trim()).filter(Boolean);
  return (
    <div className="py-1.5 flex items-center justify-center flex-wrap gap-0.5" style={{ background: WHITE }}>
      {chars.length === 0 ? (
        <span style={{ fontSize: 10.5, color: INK_SOFT }}>—</span>
      ) : chars.length === 2 ? (
        // 지장간 2글자(여기·본기) → 가운데 hipeun 이미지로 3칸 정렬
        <>
          <SmallGan ch={chars[0]} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/saju/cheongan/hipeun.png" alt="" style={{ width: 23, height: 23, objectFit: "contain" }} />
          <SmallGan ch={chars[1]} />
        </>
      ) : (
        chars.map((c, i) => <SmallGan key={i} ch={c} />)
      )}
    </div>
  );
}

export function MyeongsikModalView({ open, onClose, view, loading }: { open: boolean; onClose: () => void; view: MyeongsikView | null; loading: boolean }) {
  const v = view ?? SAMPLE_VIEW;
  const ps: MsPillar[] = v.pillars;

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
        className="relative w-full overflow-y-auto rounded-3xl"
        style={{
          maxHeight: "100%",
          background: CREAM,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          scrollbarWidth: "none",
        }}
      >
        <div className="px-5 py-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[20px] font-black" style={{ color: INK }}>나의 명식</h2>
              <span className="text-[12px]" style={{ color: MUTE }}>일간 {v.ilgan}</span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full"
              style={{ width: 28, height: 28, background: `${INK}0d`, color: INK_SOFT, fontSize: 15, lineHeight: 1 }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] mb-4" style={{ color: MUTE }}>
            {loading ? "명식을 불러오는 중…" : "사주팔자 원국 · 십성 · 지장간 · 십이운성 · 신살"}
          </p>

          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${INK}14` }}>
            <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>
              <MsRowLabel>구분</MsRowLabel>
              {ps.map((p) => (
                <div key={p.pos} className="py-1.5 text-center text-[11px] font-bold" style={{ color: INK, background: "#efe3df" }}>
                  {p.pos}
                </div>
              ))}
            </div>
            <GridRow label="십성">{ps.map((p, i) => <CellText key={i}>{p.sipTop}</CellText>)}</GridRow>
            <GridRow label="천간">{ps.map((p, i) => <CellImg key={i} src={ganCharImage(p.gan)} alt={p.gan} el={p.ganEl} />)}</GridRow>
            <GridRow label="지지">{ps.map((p, i) => <CellImg key={i} src={jiCharImage(p.ji)} alt={p.ji} el={p.jiEl} />)}</GridRow>
            <GridRow label="십성">{ps.map((p, i) => <CellText key={i}>{p.sipBot}</CellText>)}</GridRow>
            <GridRow label="지장간">{ps.map((p, i) => <CellJijang key={i} text={p.jijang} />)}</GridRow>
            <GridRow label="운성">{ps.map((p, i) => <CellText key={i}>{p.unseong}</CellText>)}</GridRow>
            <GridRow label="신살">{ps.map((p, i) => <CellText key={i} color={MAROON}>{p.sinsal || "—"}</CellText>)}</GridRow>
          </div>

          <FlowRow title="대운 (10년 주기) · 눌러서 세운 보기" items={daeunItems} onSelect={pickDaeun} />
          <FlowRow title={`세운 (연운) · ${ys}~${ys + 9} · 눌러서 월운 보기`} items={seunItems} onSelect={(i) => setSelYear(ys + i)} />
          <FlowRow title={`월운 (월별) · ${selYear}년`} items={weolunItems} />

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
