"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { TossWidget } from "@/components/checkout/TossWidget";
import { calcSaju, type LocalSajuResult } from "@/lib/saju/local-manseryeok";
import { ganCharImage, jiCharImage } from "@/lib/saju/char-image";
import { MyeongsikTable } from "@/components/saju/MyeongsikModal";
import type { MyeongsikView } from "@/lib/saju/myeongsik-view";
import { LEGAL_DOC_CLASS, TermsContent, PrivacyContent } from "@/components/legal/legal-content";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const CREAM    = "#fdf8f4";
const WHITE    = "#ffffff";
const RED      = "#9b2335";
const RED_SOFT = "#c9474f";
const RED_PALE = "#fdf0f0";
const ROSE     = "#e8a0a8";
const GRAY1    = "#1a1a1a";
const GRAY2    = "#444444";
const GRAY3    = "#888888";
const GRAY4    = "#dddddd";
const CARD_BG  = "#ffffff";

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"] as const;

// ─── LocalSajuResult → MyeongsikView 변환 ────────────────────────────────────
const CLASS_TO_EL: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
const JIJANG_LOCAL: Record<string, string> = {
  자: "壬·癸", 축: "癸·辛·己", 인: "戊·丙·甲", 묘: "甲·乙",
  진: "乙·癸·戊", 사: "戊·庚·丙", 오: "丙·己·丁", 미: "丁·乙·己",
  신: "戊·壬·庚", 유: "庚·辛", 술: "辛·丁·戊", 해: "戊·甲·壬",
};
function localSajuToMsView(saju: LocalSajuResult): MyeongsikView {
  const order = [
    { key: "time" as const, pos: "시주" },
    { key: "day" as const, pos: "일주" },
    { key: "month" as const, pos: "월주" },
    { key: "year" as const, pos: "년주" },
  ];
  const pillars = order.map(({ key, pos }, idx) => {
    const p = saju.pillars[key];
    return {
      pos,
      sipTop: idx === 1 ? "일원" : (p.stemSs || "—"),
      gan: p.stem,
      ganEl: CLASS_TO_EL[p.stemClass] ?? "",
      ji: p.branch,
      jiEl: CLASS_TO_EL[p.branchClass] ?? "",
      sipBot: p.branchSs || "—",
      jijang: JIJANG_LOCAL[p.branchHg] ?? "",
      unseong: "",
      sinsal: "",
    };
  });
  const now = new Date();
  return {
    ilgan: saju.dayStem,
    pillars,
    daeun: [],
    seun: [],
    weolun: [],
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
}

// ─── 스크롤 슬라이드 인 훅 (아래에서 위로) ────────────────────────────────────
function useSlideInUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = {
    transform: visible ? "translateY(0)" : "translateY(60px)",
    opacity: visible ? 1 : 0,
    transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease",
  };

  return { ref, style };
}

// ─── 명식 카드 ────────────────────────────────────────────────────────────────
function MyeongsikCard({
  saju, label,
}: {
  saju: LocalSajuResult | null;
  label: string;
}) {
  const pillars = saju
    ? [saju.pillars.time, saju.pillars.day, saju.pillars.month, saju.pillars.year]
    : null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <div className="py-2.5 text-center" style={{ backgroundColor: RED_PALE, borderBottom: `1px solid ${ROSE}` }}>
        <p className="text-[15px] font-bold" style={{ color: "#7a1020" }}>{label}</p>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {(pillars ?? Array(4).fill(null)).map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-0">
              <p className="text-[13px] font-medium tracking-wider" style={{ color: GRAY3, marginBottom: 1 }}>{PILLAR_LABELS[i]}</p>
              <span style={{ fontSize: 13, color: "#7a1020", lineHeight: 1, marginBottom: 6 }}>{p?.stemSs || " "}</span>
              <div className="w-full aspect-square flex items-center justify-center">
                {p ? <img src={ganCharImage(p.stem)} alt={p.stem} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <div className="w-full h-full animate-pulse rounded" style={{ backgroundColor: "#eee" }} />}
              </div>
              <div className="w-full aspect-square flex items-center justify-center">
                {p ? <img src={jiCharImage(p.branch)} alt={p.branch} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <div className="w-full h-full animate-pulse rounded" style={{ backgroundColor: "#eee" }} />}
              </div>
              <span style={{ fontSize: 13, color: "#7a1020", lineHeight: 1, marginTop: 6 }}>{p?.branchSs || " "}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 히어로 섹션 ──────────────────────────────────────────────────────────────
function HeroSection({ name }: { name: string }) {
  return (
    <div style={{ backgroundColor: WHITE }}>
      {/* 카피 텍스트 */}
      <div className="px-6 pt-10 pb-5 text-center">
        <p className="text-[11px] tracking-[0.2em] mb-3 font-medium" style={{ color: "#7a1020" }}>정통사주 · 정밀 리포트</p>
        <h1 className="text-[26px] font-black leading-snug" style={{ color: GRAY1 }}>
          {name}님의 운명,<br />
          사주가 <span style={{ color: "#7a1020" }}>모두</span> 알고 있소
        </h1>
        <p className="text-[13px] mt-3 leading-relaxed" style={{ color: GRAY2 }}>
          타고난 운명과 인생의 흐름을<br />
          낱낱이 풀었소. 지금 확인하시오.
        </p>
      </div>

      {/* 영상 */}
      <div className="relative overflow-hidden w-full" style={{ aspectRatio: "9/16" }}>
        <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{ background: `linear-gradient(to bottom, ${WHITE}, transparent)` }} />
        <video
          src="/media/cards/saju_total/total-0.mp4"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.55)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
          style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
      </div>
    </div>
  );
}

// ─── 명식 섹션 ───────────────────────────────────────────────────────────────
function MyeongsikSection({
  saju, name, date, calendar, gender,
}: {
  saju: LocalSajuResult | null;
  name: string;
  date: string;
  calendar: string;
  gender: string;
}) {
  const { ref, style } = useSlideInUp();
  const msView = useMemo(() => saju ? localSajuToMsView(saju) : null, [saju]);

  const calLabel = calendar === "음력" ? "음력" : calendar === "윤달" ? "음력(윤달)" : "양력";
  const dateFormatted = date ? date.replace(/\./g, "년 ").replace(/\.$/, "").split("년 ").map((v, i) => i === 0 ? v + "년" : i === 1 ? v + "월" : v + "일").join(" ") : "";
  const genderLabel = gender === "female" || gender === "여자" ? "여성" : gender === "male" || gender === "남자" ? "남성" : gender;
  const dateLabel = dateFormatted ? `${calLabel} ${dateFormatted}${genderLabel ? ` (${genderLabel})` : ""}` : "";

  return (
    <div style={{ backgroundColor: WHITE }}>
      <div className="pt-6 pb-2">
        <div ref={ref} style={style}>
          <MyeongsikTable
            view={msView}
            name={name}
            birth={null}
            rows={["sipTop", "gan", "ji", "sipBot", "jijang", "sinsal"]}
            header={
              <div className="text-center">
                <p className="text-[22px] font-black mb-1" style={{ color: "#2a2320" }}>{name}님의 사주팔자</p>
                {dateLabel && <p className="text-[13px]" style={{ color: "#5b504a" }}>{dateLabel}</p>}
              </div>
            }
          />
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}

// ─── 14장 티저 섹션 ──────────────────────────────────────────────────────────
const CHAPTER_TEASERS = [
  {
    ch: 1,
    title: "나는 어떤 그릇으로 태어났나",
    teaser: "태어난 순간 하늘이 새긴 나의 원국. 어떤 기운을 타고났는지, 오행의 균형은 어떠한지 — 이 한 장이 나머지 13장의 뿌리가 되오.",
    visual: (
      <div className="flex gap-1.5 justify-center">
        {[
          { label: "시", gan: "甲", ji: "子", color: "#2563eb" },
          { label: "일", gan: "丙", ji: "午", color: "#dc2626" },
          { label: "월", gan: "庚", ji: "申", color: "#6b7280" },
          { label: "년", gan: "壬", ji: "辰", color: "#059669" },
        ].map((p) => (
          <div key={p.label} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px]" style={{ color: GRAY3 }}>{p.label}</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-[16px]"
              style={{ backgroundColor: `${p.color}18`, color: p.color, border: `1.5px solid ${p.color}40` }}>
              {p.gan}
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-[16px]"
              style={{ backgroundColor: "#f5f5f5", color: GRAY2, border: `1.5px solid ${GRAY4}` }}>
              {p.ji}
            </div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["일간 ██의 핵심 성질과 삶의 방향", "오행 분포 — 과잉과 결핍이 만드는 운명", "내 사주의 용신(用神)은 ██이오"],
  },
  {
    ch: 2,
    title: "나의 진짜 모습은 무엇일까",
    teaser: "남들에게 보이는 나와, 내면에 숨겨진 나는 다르오. 사주는 그 간격까지 기록해두었소. 지금껏 아무도 말해주지 않았던 진짜 자신을 마주하게 될 것이오.",
    visual: (
      <div className="flex gap-3 justify-center">
        {[
          { label: "겉모습", value: "외향적·활동적", icon: "🌞", color: "#f59e0b" },
          { label: "내면", value: "██·██", icon: "🌙", blur: true, color: "#7c3aed" },
        ].map((item) => (
          <div key={item.label} className="flex-1 rounded-xl p-3 text-center"
            style={{ backgroundColor: `${item.color}12`, border: `1px solid ${item.color}30` }}>
            <div className="text-[18px] mb-1">{item.icon}</div>
            <div className="text-[10px] font-medium mb-1" style={{ color: item.color }}>{item.label}</div>
            <div className="text-[12px] font-bold" style={{ color: GRAY1, filter: item.blur ? "blur(5px)" : "none" }}>{item.value}</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["타인이 보는 나 vs 내가 아는 나", "무의식에 새겨진 두려움과 욕망", "내 성격의 가장 큰 함정은 ██이오"],
  },
  {
    ch: 3,
    title: "나는 세상을 어떻게 대하는가",
    teaser: "왜 저 사람과는 자꾸 부딪히고, 왜 이 사람과는 자연스럽게 가까워지는가. 사주에는 그 이유가 적혀 있소. 인간관계의 패턴, 이제 알고 나면 달라질 것이오.",
    visual: (
      <div className="flex items-center justify-center gap-2">
        {[
          { label: "리더형", pct: 72, color: "#dc2626" },
          { label: "협력형", pct: 55, color: "#2563eb" },
          { label: "독립형", pct: 88, color: "#7c3aed" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div className="text-[9px]" style={{ color: GRAY3 }}>{item.label}</div>
            <div className="w-8 rounded-full overflow-hidden" style={{ height: 50, backgroundColor: GRAY4 }}>
              <div className="w-full rounded-full" style={{ height: `${item.pct}%`, backgroundColor: item.color, marginTop: `${100 - item.pct}%`, filter: "blur(2px)" }} />
            </div>
            <div className="text-[10px] font-bold" style={{ color: item.color, filter: "blur(4px)" }}>{item.pct}%</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["나의 인간관계 유형과 핵심 성향", "반복되는 갈등 패턴의 뿌리", "내가 끌리는 사람과 피해야 할 사람"],
  },
  {
    ch: 4,
    title: "내 사주에 나타나는 특이점",
    teaser: "평범한 사주는 없소. 누군가의 사주엔 천재성이, 누군가의 사주엔 큰 굴곡이 새겨져 있소. 그대의 원국엔 무엇이 숨어있는지 — 직접 확인하시오.",
    visual: (
      <div className="flex flex-wrap gap-1.5 justify-center">
        {["신살 분석", "형충파해", "공망", "십이운성", "귀문관살"].map((tag, i) => (
          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{
              backgroundColor: i === 0 ? "#fdf0f0" : "#f5f5f5",
              color: i === 0 ? "#9b2335" : GRAY3,
              border: `1px solid ${i === 0 ? ROSE : GRAY4}`,
              filter: i > 1 ? "blur(3px)" : "none",
            }}>
            {tag}
          </span>
        ))}
      </div>
    ),
    blurItems: ["내 사주에 숨은 특수 신살의 의미", "형충파해가 내 삶에 주는 영향", "결정적 순간을 예고하는 특이점"],
  },
  {
    ch: 5,
    title: "내 재물과 천직은 어떠한가",
    teaser: "재물이 많이 들어오는 사주가 있고, 아무리 벌어도 손가락 사이로 빠져나가는 사주가 있소. 그대의 재물그릇 크기, 그리고 가장 빛나는 직업의 방향을 알려드리겠소.",
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] w-12 text-right flex-shrink-0" style={{ color: GRAY3 }}>재물력</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: GRAY4 }}>
            <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg,#f59e0b,#dc2626)", filter: "blur(2px)" }} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: "#dc2626", filter: "blur(4px)" }}>상위 ██%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] w-12 text-right flex-shrink-0" style={{ color: GRAY3 }}>직업력</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: GRAY4 }}>
            <div className="h-full rounded-full" style={{ width: "58%", background: "linear-gradient(90deg,#2563eb,#7c3aed)", filter: "blur(2px)" }} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: "#7c3aed", filter: "blur(4px)" }}>██ 계열</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] w-12 text-right flex-shrink-0" style={{ color: GRAY3 }}>사업력</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: GRAY4 }}>
            <div className="h-full rounded-full" style={{ width: "85%", background: "linear-gradient(90deg,#059669,#2563eb)", filter: "blur(2px)" }} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: "#059669", filter: "blur(4px)" }}>매우 강함</span>
        </div>
      </div>
    ),
    blurItems: ["재물이 들어오는 시기와 방식", "천직 — 가장 빛나는 직업 분야", "사업과 직장, 어느 쪽이 그대에게 맞는가"],
  },
  {
    ch: 6,
    title: "내 인연과 혼인의 때는 언제인가",
    teaser: "인연은 사주에 이미 새겨져 있소. 어떤 사람을 만나야 하는지, 언제 깊은 인연이 오는지 — 이 장을 보면 왜 지금까지 그 사람을 만났는지도 이해가 될 것이오.",
    visual: (
      <div className="flex justify-center">
        <div className="relative w-32 h-16">
          <div className="absolute left-2 top-0 w-12 h-12 rounded-full flex items-center justify-center text-[20px]"
            style={{ backgroundColor: "#fdf0f0", border: `2px solid ${ROSE}` }}>나</div>
          <div className="absolute right-2 top-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-[13px]"
            style={{ backgroundColor: "#f5f5f5", border: `2px solid ${GRAY4}`, filter: "blur(5px)", color: GRAY2 }}>██</div>
          <div className="absolute left-0 right-0 top-5 flex items-center justify-center">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${ROSE},transparent)` }} />
            <span className="text-[16px] mx-1">💕</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg,${ROSE},transparent)` }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center text-[10px]" style={{ color: GRAY3, filter: "blur(4px)" }}>████년 ██월이 인연의 때</div>
        </div>
      </div>
    ),
    blurItems: ["내 배우자궁의 상태와 인연의 성격", "인연이 깊어지는 결정적 시기", "피해야 할 궁합 유형과 이유"],
  },
  {
    ch: 7,
    title: "내 건강과 약한 곳은 어디인가",
    teaser: "오행의 과잉과 결핍은 몸으로도 나타나오. 사주가 경고하는 취약 부위를 미리 알면 — 몸이 보내는 신호를 더 일찍 알아차릴 수 있소.",
    visual: (
      <div className="flex gap-1.5 justify-center flex-wrap">
        {[
          { organ: "간·담", ohaeng: "목(木)", color: "#059669", level: "주의" },
          { organ: "심장·소장", ohaeng: "화(火)", color: "#dc2626", level: "██" },
          { organ: "신장·방광", ohaeng: "수(水)", color: "#2563eb", level: "██" },
        ].map((item) => (
          <div key={item.organ} className="text-center px-2.5 py-2 rounded-xl"
            style={{ backgroundColor: `${item.color}10`, border: `1px solid ${item.color}30` }}>
            <div className="text-[10px] font-bold" style={{ color: item.color }}>{item.organ}</div>
            <div className="text-[9px] mt-0.5" style={{ color: GRAY3 }}>{item.ohaeng}</div>
            <div className="text-[11px] font-black mt-1" style={{ color: item.color, filter: item.level === "주의" ? "none" : "blur(4px)" }}>{item.level}</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["오행 불균형이 만드는 건강 취약 부위", "이 시기에 특히 몸을 조심하시오", "그대의 건강을 지키는 습관과 방향"],
  },
  {
    ch: 8,
    title: "나를 살릴 귀인은 누구인가",
    teaser: "살면서 결정적 순간에 손을 내밀어준 사람이 있었을 것이오. 그것이 우연이 아니었소. 사주에는 귀인의 특성과 만남의 조건이 적혀 있소.",
    visual: (
      <div className="flex justify-center gap-2">
        {[
          { label: "천을귀인", desc: "위기에 나타나는 구원자", color: "#f59e0b", show: true },
          { label: "██귀인", desc: "██한 인연에서 온다", color: "#7c3aed", show: false },
          { label: "문창귀인", desc: "██의 형태로 도움을 준다", color: "#059669", show: false },
        ].map((item) => (
          <div key={item.label} className="flex-1 text-center p-2.5 rounded-xl"
            style={{ backgroundColor: `${item.color}12`, border: `1px solid ${item.color}30` }}>
            <div className="text-[11px] font-bold mb-0.5" style={{ color: item.color, filter: item.show ? "none" : "blur(5px)" }}>{item.label}</div>
            <div className="text-[9px]" style={{ color: GRAY3, filter: item.show ? "none" : "blur(4px)" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["내 사주의 귀인 신살과 그 의미", "귀인이 나타나는 시기와 방향", "귀인을 만나는 구체적인 행동 방법"],
  },
  {
    ch: 9,
    title: "나는 왜 그 시간을 견뎌야 했나",
    teaser: "아무 이유 없이 찾아온 것 같았던 고통. 하지만 사주의 눈으로 보면, 그것은 예고되어 있었소. 그 이유를 알면 — 같은 실수를 반복하지 않을 수 있소.",
    visual: (
      <div className="space-y-1.5">
        {[
          { year: "20██", event: "관계의 큰 상처", intensity: 85, color: "#dc2626" },
          { year: "20██", event: "경제적 위기", intensity: 60, color: "#f59e0b" },
          { year: "20██", event: "██한 변화", intensity: 92, color: "#7c3aed" },
        ].map((item) => (
          <div key={item.year} className="flex items-center gap-2">
            <span className="text-[10px] w-10 flex-shrink-0" style={{ color: "#dc2626", filter: "blur(3px)" }}>{item.year}</span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: GRAY4 }}>
              <div className="h-full rounded-full" style={{ width: `${item.intensity}%`, backgroundColor: item.color, filter: "blur(1px)" }} />
            </div>
            <span className="text-[9px] w-16 flex-shrink-0" style={{ color: item.color, filter: "blur(4px)" }}>{item.event}</span>
          </div>
        ))}
      </div>
    ),
    blurItems: ["사주가 예고한 굴곡과 그 시기의 이유", "반복되는 패턴을 끊는 방법", "그 시간이 내게 남긴 것의 의미"],
  },
  {
    ch: 10,
    title: "내 대운은 앞으로 어디로 흐르나",
    teaser: "10년 단위로 바뀌는 대운의 흐름. 지금 그대가 어떤 대운 위에 서 있는지, 다음 대운은 언제 어떻게 바뀌는지 — 미래의 지도가 여기 있소.",
    visual: (
      <div className="flex items-end justify-center gap-1">
        {[
          { period: "20~30", label: "상승", height: 55, color: "#059669", active: false },
          { period: "30~40", label: "시련", height: 35, color: "#f59e0b", active: false },
          { period: "40~50", label: "지금", height: 80, color: "#dc2626", active: true },
          { period: "50~60", label: "██", height: 65, color: "#7c3aed", active: false, blur: true },
          { period: "60~70", label: "██", height: 90, color: "#2563eb", active: false, blur: true },
        ].map((item) => (
          <div key={item.period} className="flex flex-col items-center gap-1">
            <div className="text-[9px] font-bold" style={{ color: item.color, filter: item.blur ? "blur(4px)" : "none" }}>{item.label}</div>
            <div className="w-9 rounded-t-lg" style={{ height: item.height * 0.7, backgroundColor: `${item.color}${item.active ? "cc" : "55"}`, border: item.active ? `2px solid ${item.color}` : "none", filter: item.blur ? "blur(3px)" : "none" }} />
            <div className="text-[8px]" style={{ color: GRAY3, filter: item.blur ? "blur(4px)" : "none" }}>{item.period}</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["현재 대운의 기운과 앞으로의 방향", "다음 대운 전환점은 ██년이오", "대운을 최대한 활용하는 전략"],
  },
  {
    ch: 11,
    title: "내가 조심해야 할 때는 언제인가",
    teaser: "위기가 예고 없이 오는 것이 아니오. 사주에는 그대가 특히 조심해야 할 해와 달이 기록되어 있소. 미리 알고 대비하면 — 피할 수 있는 재앙이 있소.",
    visual: (
      <div className="grid grid-cols-4 gap-1">
        {["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"].map((month, i) => {
          const danger = [2, 5, 8, 11].includes(i);
          return (
            <div key={month} className="text-center py-1.5 rounded-lg text-[9px] font-medium"
              style={{
                backgroundColor: danger ? "#fdf0f0" : "#f5f5f5",
                color: danger ? "#9b2335" : GRAY4,
                border: danger ? `1px solid ${ROSE}` : `1px solid ${GRAY4}`,
                filter: danger ? "blur(3px)" : "none",
              }}>
              {month}
            </div>
          );
        })}
      </div>
    ),
    blurItems: ["그대가 가장 조심해야 할 해와 달", "이 시기에 피해야 할 결정과 행동", "위기를 기회로 바꾸는 대처법"],
  },
  {
    ch: 12,
    title: "내가 꼭 기억할 세 가지는 무엇인가",
    teaser: "긴 풀이 끝에 홍연이 그대에게 꼭 전하고 싶은 세 가지. 삶의 방향을 잃을 때마다 이 세 가지를 꺼내보면 — 다시 길이 보일 것이오.",
    visual: (
      <div className="space-y-1.5">
        {[
          { num: "첫째", text: "그대의 가장 큰 자산은 ██이오", blur: true },
          { num: "둘째", text: "절대 포기하지 마시오, ██이 그대를 기다리오", blur: true },
          { num: "셋째", text: "이것만큼은 반드시 지키시오 — ██", blur: true },
        ].map((item) => (
          <div key={item.num} className="flex items-start gap-2 px-2.5 py-2 rounded-xl" style={{ backgroundColor: RED_PALE, border: `1px solid ${ROSE}` }}>
            <span className="text-[10px] font-black flex-shrink-0 pt-0.5" style={{ color: "#9b2335" }}>{item.num}</span>
            <span className="text-[11px]" style={{ color: GRAY2, filter: "blur(5px)" }}>{item.text}</span>
          </div>
        ))}
      </div>
    ),
    blurItems: ["홍연이 꼭 전하는 삶의 세 가지 핵심", "그대만의 인생 원칙과 방향", "이 세 가지를 기억하면 길을 잃지 않소"],
  },
  {
    ch: 13,
    title: "나는 어떻게 운을 바꿀 수 있나",
    teaser: "사주는 운명이되, 운명은 바꿀 수 있소. 그것이 개운(開運)이오. 그대의 사주에 맞는 방향과 색, 방위, 행동 — 작은 변화가 큰 흐름을 바꾸오.",
    visual: (
      <div className="flex gap-2 justify-center flex-wrap">
        {[
          { label: "행운의 방위", value: "██방", color: "#2563eb" },
          { label: "행운의 색", value: "██색", color: "#dc2626" },
          { label: "행운의 숫자", value: "██", color: "#059669" },
          { label: "개운 행동", value: "██하기", color: "#7c3aed" },
        ].map((item) => (
          <div key={item.label} className="text-center px-3 py-2 rounded-xl"
            style={{ backgroundColor: `${item.color}10`, border: `1px solid ${item.color}30` }}>
            <div className="text-[9px]" style={{ color: GRAY3 }}>{item.label}</div>
            <div className="text-[13px] font-black mt-0.5" style={{ color: item.color, filter: "blur(5px)" }}>{item.value}</div>
          </div>
        ))}
      </div>
    ),
    blurItems: ["그대에게 맞는 개운법과 행동 지침", "피해야 할 방향과 색, 음식", "지금 당장 시작할 수 있는 가장 쉬운 개운법"],
  },
  {
    ch: 14,
    title: "마무리 · 그대에게 남기는 홍연의 서신",
    teaser: "모든 풀이를 마치며 홍연이 그대에게 직접 쓰는 손편지. 이 한 장을 읽고 나면 — 살아온 날들이 다르게 보이고, 살아갈 날들이 조금 더 단단해질 것이오.",
    visual: (
      <div className="px-3 py-3 rounded-xl" style={{ backgroundColor: RED_PALE, border: `1px solid ${ROSE}` }}>
        <div className="text-[10px] mb-2 font-medium" style={{ color: "#9b2335" }}>홍연의 서신 中</div>
        <p className="text-[11px] leading-relaxed" style={{ color: GRAY2, filter: "blur(5px)" }}>
          그대가 살아온 모든 날에는 이유가 있었소. 스스로도 몰랐던 그 이유를, 이제는 알게 되었으리라 믿소. 앞으로의 길이 순탄하지 않더라도 — 그대는 이미 충분히 단단한 사람이오.
        </p>
        <div className="text-right mt-2 text-[10px] font-medium" style={{ color: "#9b2335" }}>— 홍연 드림</div>
      </div>
    ),
    blurItems: ["홍연이 그대에게 전하는 진심 어린 이야기", "이 풀이를 통해 발견한 그대의 특별함", "앞으로의 인생을 향한 따뜻한 당부"],
  },
];

function ChapterTeaserCard({ data, index }: { data: typeof CHAPTER_TEASERS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isLast = data.ch === 14;

  return (
    <div ref={ref} className="mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: WHITE,
        border: isLast ? `1.5px solid ${ROSE}` : `1px solid ${GRAY4}`,
        boxShadow: isLast ? `0 2px 12px rgba(155,35,53,0.12)` : "0 1px 6px rgba(0,0,0,0.05)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.5s ease ${index * 0.04}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 0.04}s`,
      }}>
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: `1px solid ${isLast ? ROSE : GRAY4}`, backgroundColor: isLast ? RED_PALE : CREAM }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isLast ? RED : GRAY2 }}>
          <span className="text-[10px] font-black text-white">{data.ch}</span>
        </div>
        <span className="text-[14px] font-black" style={{ color: isLast ? "#7a1020" : GRAY1 }}>{data.title}</span>
      </div>

      {/* 바디 */}
      <div className="px-4 pt-3.5 pb-2">
        {/* 설득 카피 */}
        <p className="text-[12px] leading-relaxed mb-3.5" style={{ color: GRAY2 }}>{data.teaser}</p>

        {/* 미니 비주얼 */}
        <div className="py-3 px-2 rounded-xl mb-3.5" style={{ backgroundColor: CREAM }}>
          {data.visual}
        </div>

        {/* 블러 리스트 */}
        <div className="space-y-1.5 relative">
          <div className="space-y-1.5 select-none">
            {data.blurItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: RED_SOFT }} />
                <span className="text-[12px]" style={{ color: GRAY2, filter: "blur(5.5px)", userSelect: "none" }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
            <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b2335" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-[11px] font-semibold" style={{ color: "#9b2335" }}>결제 후 열람 가능</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterTeaserSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ backgroundColor: CREAM }}>
      <div className="pt-8 pb-3 text-center px-5"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
        <p className="text-[11px] tracking-[0.2em] mb-1.5 font-medium" style={{ color: "#9b2335" }}>✦ 정통종합사주 · 전체 14장 ✦</p>
        <h2 className="text-[21px] font-black mb-2" style={{ color: GRAY1 }}>이런 것들을 알게 될 것이오</h2>
        <p className="text-[12px] leading-relaxed" style={{ color: GRAY3 }}>각 장을 미리 살펴보시오. 결제 후엔 그대만의 이야기가 가득 담길 것이오.</p>
      </div>
      <div className="pt-2 pb-6">
        {CHAPTER_TEASERS.map((data, i) => (
          <ChapterTeaserCard key={data.ch} data={data} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── 후기 섹션 ───────────────────────────────────────────────────────────────
const REVIEWS_RAW = [
  { star: 5, text: "소름돋을 정도로 정확해요. 제 성격을 너무 잘 맞췄어요. 주변에 다 추천했습니다.", name: "30대 직장인 김○○", date: "2026.07.04" },
  { star: 5, text: "대운 흐름이 딱 맞았어요. 미리 알고 준비했더니 힘든 시기를 잘 넘길 수 있었습니다.", name: "40대 주부 이○○", date: "2026.07.03" },
  { star: 5, text: "재물운 분석이 정말 좋았어요. 왜 그때 기회가 왔는지 이제야 이해가 됐습니다.", name: "50대 자영업자 박○○", date: "2026.07.03" },
  { star: 5, text: "내 인생의 큰 줄기를 딱 짚어줘서 앞으로 어떻게 살아야 할지 방향이 잡혔어요.", name: "20대 대학원생 최○○", date: "2026.07.02" },
  { star: 5, text: "그냥 호기심으로 봤는데 너무 정확해서 무서울 정도예요. 진짜 추천합니다.", name: "30대 프리랜서 정○○", date: "2026.07.02" },
  { star: 5, text: "용신 오행 맞춤 개운법이 특히 좋았어요. 실생활에 바로 써먹을 수 있어서요.", name: "40대 회사원 한○○", date: "2026.07.01" },
  { star: 5, text: "홍연 말투가 너무 매력있어요. 읽는 내내 옛 스승한테 조언 듣는 기분이었어요.", name: "20대 취준생 오○○", date: "2026.07.01" },
  { star: 5, text: "결혼 시기 분석이 진짜 맞아서 깜짝 놀랐어요. 올해 만남이 올 것 같아 기대됩니다.", name: "30대 미혼 여성 윤○○", date: "2026.06.30" },
  { star: 4, text: "전체적으로 만족스러웠어요. 분량이 많아서 다 읽는 데 시간이 걸렸지만 가치 있었습니다.", name: "40대 교사 장○○", date: "2026.06.30" },
  { star: 5, text: "타고난 직업 성향 분석이 정확했어요. 지금 제 직업이 사주랑 딱 맞더라고요.", name: "30대 디자이너 임○○", date: "2026.06.29" },
  { star: 5, text: "생년월일만 넣었는데 이렇게까지 상세하게 나올 줄 몰랐어요. 완전 감동이에요.", name: "50대 가정주부 강○○", date: "2026.06.29" },
  { star: 5, text: "대운 교체 시기를 미리 알아서 마음의 준비를 할 수 있었어요. 정말 고맙습니다.", name: "40대 자영업자 조○○", date: "2026.06.28" },
  { star: 5, text: "10년 전부터 궁금했던 제 성향의 이유를 드디어 알게 됐어요. 속이 시원합니다.", name: "30대 간호사 신○○", date: "2026.06.28" },
  { star: 5, text: "건강 파트가 유독 정확했어요. 평소에 자주 아팠던 부위랑 완전 일치해요.", name: "60대 은퇴자 권○○", date: "2026.06.27" },
  { star: 5, text: "마무리 서신이 너무 따뜻해서 읽다가 눈물이 났어요. 위로가 됐습니다.", name: "30대 워킹맘 황○○", date: "2026.06.27" },
  { star: 5, text: "친구한테 선물로 사줬는데 너무 좋아했어요. 생일 선물로 최고예요.", name: "20대 대학생 류○○", date: "2026.06.26" },
  { star: 4, text: "내용이 방대해서 처음엔 당황했는데, 천천히 읽으니 다 의미 있는 내용이더라고요.", name: "40대 IT종사자 송○○", date: "2026.06.26" },
  { star: 5, text: "개운법이 구체적이고 현실적이어서 바로 실천하고 있어요. 변화가 느껴집니다.", name: "30대 마케터 홍○○", date: "2026.06.25" },
  { star: 5, text: "사업 파트너와 궁합도 이해하게 됐어요. 관계를 보는 시야가 넓어진 느낌이에요.", name: "40대 사업가 남○○", date: "2026.06.25" },
  { star: 5, text: "인연운이 오는 시기 예측이 실제랑 맞아서 신기했어요. 믿게 됐습니다.", name: "30대 싱글 여성 심○○", date: "2026.06.24" },
  { star: 5, text: "해마다 찾아보는 곳이 생겼어요. 올해도 잘 부탁드립니다 홍연님.", name: "40대 회사원 노○○", date: "2026.06.24" },
  { star: 5, text: "직장 이직 시기가 사주 흐름이랑 너무 잘 맞아서 확신이 생겼어요.", name: "30대 직장인 유○○", date: "2026.06.23" },
  { star: 5, text: "기질 분석이 진짜 저를 설명하는 것 같아서 계속 읽게 됐어요.", name: "20대 직장인 전○○", date: "2026.06.23" },
  { star: 5, text: "가족들한테도 다 사줬어요. 온 가족이 같이 봤는데 다 맞다고 하더라고요.", name: "50대 주부 문○○", date: "2026.06.22" },
  { star: 4, text: "생각보다 분량이 많아서 놀랐어요. 그만큼 내용이 알차서 만족합니다.", name: "30대 공무원 배○○", date: "2026.06.22" },
  { star: 5, text: "재물운 사이클이 정확해요. 왜 그 시기에 힘들었는지 이해가 됐습니다.", name: "40대 사업가 서○○", date: "2026.06.21" },
  { star: 5, text: "홍연 말투가 고풍스러워서 더 믿음이 갔어요. 진지하게 읽게 되더라고요.", name: "30대 독서가 안○○", date: "2026.06.21" },
  { star: 5, text: "이직 후 새 직장이 사주에 맞는 환경인지 분석해줘서 안심됐어요.", name: "30대 직장인 고○○", date: "2026.06.20" },
  { star: 5, text: "건강 주의 시기를 미리 알아서 검진을 받았는데 실제로 문제가 발견됐어요. 감사해요.", name: "50대 자영업자 차○○", date: "2026.06.20" },
  { star: 5, text: "남편이랑 같이 봤어요. 각자 특성이 잘 나와서 서로 이해하게 됐습니다.", name: "40대 주부 주○○", date: "2026.06.19" },
  { star: 5, text: "20대 때 힘들었던 이유를 사주로 설명해줘서 마음이 위로됐어요.", name: "30대 직장인 변○○", date: "2026.06.19" },
  { star: 5, text: "결과지 디자인도 예쁘고 내용도 알차요. 이 가격에 이 퀄리티 대박이에요.", name: "20대 대학원생 엄○○", date: "2026.06.18" },
  { star: 5, text: "올해 개운법대로 색깔 옷을 입기 시작했는데 진짜 기분이 달라요.", name: "30대 패션 종사자 원○○", date: "2026.06.18" },
  { star: 4, text: "처음엔 반신반의했는데 읽다 보니 신기할 정도로 맞아서 다 읽었어요.", name: "40대 과학자 천○○", date: "2026.06.17" },
  { star: 5, text: "이런 서비스가 있는 줄 몰랐어요. 진짜 제 이야기 같아서 소름 돋았습니다.", name: "30대 간호사 방○○", date: "2026.06.17" },
  { star: 5, text: "결혼 전에 보길 잘했어요. 배우자 인연 파트가 도움이 많이 됐어요.", name: "20대 여성 공○○", date: "2026.06.16" },
  { star: 5, text: "대운 흐름 챕터가 제일 좋았어요. 앞으로 10년 계획이 잡히는 느낌이에요.", name: "30대 사업가 명○○", date: "2026.06.16" },
  { star: 5, text: "인생에서 왜 그 선택들을 했는지 사주로 설명이 되니 이상하게 위안이 됐어요.", name: "40대 직장인 국○○", date: "2026.06.15" },
  { star: 5, text: "세 번째 구매예요. 매년 볼 것 같아요. 홍연 감사합니다.", name: "30대 워킹맘 탁○○", date: "2026.06.15" },
  { star: 5, text: "AI 사주인데도 온기가 느껴져서 좋았어요. 마지막 서신이 특히 감동이었어요.", name: "20대 대학생 석○○", date: "2026.06.14" },
  { star: 5, text: "용신 오행을 알게 된 후로 음식과 색깔에 신경 쓰게 됐어요. 삶이 달라지는 느낌.", name: "30대 요리사 도○○", date: "2026.06.14" },
  { star: 5, text: "부모님 생년월일로도 봤어요. 부모님 성격을 이제야 이해하게 됐습니다.", name: "40대 자녀 봉○○", date: "2026.06.13" },
  { star: 4, text: "직업 파트에서 추천 직종이 제 현직이랑 일치해서 놀랐어요.", name: "30대 IT개발자 왕○○", date: "2026.06.13" },
  { star: 5, text: "오랫동안 고민하던 이직 문제가 사주로 방향이 잡혔어요. 결정이 쉬워졌습니다.", name: "30대 마케터 금○○", date: "2026.06.12" },
  { star: 5, text: "분량이 많은데도 지루하지 않고 재미있게 읽었어요. 완독했습니다.", name: "50대 직장인 옥○○", date: "2026.06.12" },
  { star: 5, text: "재물 파트가 구체적이어서 좋았어요. 언제 투자하면 좋을지 감이 잡혔습니다.", name: "40대 투자자 진○○", date: "2026.06.11" },
  { star: 5, text: "올해 힘들다고 느꼈는데 이유를 알게 돼서 오히려 마음이 편해졌어요.", name: "30대 직장인 표○○", date: "2026.06.11" },
  { star: 5, text: "마무리 서신이 진짜 편지 같아서 출력해서 보관하고 싶어요.", name: "20대 여성 하○○", date: "2026.06.10" },
  { star: 5, text: "일주 분석이 저를 너무 잘 설명해줘요. 친구한테도 보여줬는데 다들 맞다고 했어요.", name: "30대 직장인 피○○", date: "2026.06.10" },
  { star: 5, text: "2년 전 힘들었던 시기가 대운 교체기였다는 걸 이제야 알았어요. 신기해요.", name: "40대 교사 길○○", date: "2026.06.09" },
  { star: 5, text: "사주를 처음 봤는데 이렇게 자세하고 따뜻한 풀이는 처음이에요. 감동받았습니다.", name: "30대 직장인 민○○", date: "2026.06.09" },
  { star: 5, text: "용신 오행을 알고 나니 식단부터 옷 색깔까지 신경 쓰게 됐어요. 삶이 달라지는 느낌.", name: "20대 여성 백○○", date: "2026.06.08" },
  { star: 4, text: "AI가 이 정도까지 분석할 수 있다니 놀라워요. 사주 입문자에게 강추합니다.", name: "20대 대학생 함○○", date: "2026.06.08" },
  { star: 5, text: "남편 생년월일로도 봤어요. 남편 성격 분석이 저보다 더 정확했어요.", name: "40대 주부 현○○", date: "2026.06.07" },
  { star: 5, text: "창업 시기를 고민하고 있었는데 대운 흐름 보고 결정하게 됐어요. 감사합니다.", name: "30대 예비창업자 나○○", date: "2026.06.07" },
  { star: 5, text: "결혼 후 배우자와의 관계를 사주로 이해하게 돼서 감사해요.", name: "30대 기혼 여성 라○○", date: "2026.06.06" },
  { star: 5, text: "타고난 직업 적성이 맞아서 현재 직업에 확신이 생겼어요.", name: "30대 디자이너 마○○", date: "2026.06.06" },
  { star: 5, text: "부모님께 선물했는데 너무 좋아하셨어요. 부모님 세대에도 잘 맞는 콘텐츠예요.", name: "40대 자녀 바○○", date: "2026.06.05" },
  { star: 5, text: "힘든 시기에 위로가 됐어요. 지금이 왜 어려운지 알게 돼서 버틸 수 있었습니다.", name: "30대 직장인 사○○", date: "2026.06.05" },
  { star: 5, text: "세운 분석이 정말 정확해요. 올해 일어난 일들이 다 설명이 됩니다.", name: "40대 사업가 아○○", date: "2026.06.04" },
  { star: 5, text: "직장 상사와의 갈등이 왜 반복됐는지 이제야 알게 됐어요. 관계 파트 대박이에요.", name: "30대 직장인 자○○", date: "2026.06.04" },
  { star: 4, text: "개인 맞춤형 조언이 이 가격에 가능하다니. 가성비 최고입니다.", name: "20대 취준생 차○○", date: "2026.06.03" },
  { star: 5, text: "오행 균형 분석이 건강 관리에 도움이 됐어요. 부족한 오행을 보충하려고 노력 중이에요.", name: "50대 건강관리 중 카○○", date: "2026.06.03" },
  { star: 5, text: "친구들이랑 같이 봤는데 서로 맞다고 난리였어요. 모임에서 화제가 됐습니다.", name: "20대 여성 타○○", date: "2026.06.02" },
  { star: 5, text: "이직을 준비하는데 적합한 직종 분석이 너무 정확해서 확신이 생겼어요.", name: "30대 이직 준비 중 파○○", date: "2026.06.02" },
  { star: 5, text: "사업 확장 시기를 고민했는데 사주 흐름 보고 결정했어요. 잘 됐으면 좋겠습니다.", name: "40대 자영업자 하○○", date: "2026.06.01" },
  { star: 5, text: "30대 중반 위기라고 하더니 진짜로 힘들었어요. 이제 이유를 알았으니 버텨낼 수 있을 것 같아요.", name: "30대 직장인 갈○○", date: "2026.06.01" },
  { star: 5, text: "마무리 서신은 진짜 편지 같아서 저장해뒀어요. 힘들 때 다시 꺼내보고 싶어요.", name: "20대 여성 강○○", date: "2026.05.31" },
  { star: 5, text: "인연운 파트가 저한테 딱 맞는 말이었어요. 올해 좋은 인연이 올 것 같아서 기대됩니다.", name: "30대 싱글 여성 거○○", date: "2026.05.31" },
  { star: 5, text: "이렇게 따뜻한 사주 풀이는 처음이에요. 단순한 정보가 아니라 위로가 됐습니다.", name: "40대 직장인 고○○", date: "2026.05.30" },
  { star: 4, text: "내용이 상당히 방대하고 알찼어요. 한 번에 다 읽기 어려울 만큼 볼 게 많아요.", name: "30대 독서가 구○○", date: "2026.05.30" },
  { star: 5, text: "개운법 실천하고 나서 긍정적인 변화를 느끼고 있어요. 꾸준히 해볼게요.", name: "30대 직장인 그○○", date: "2026.05.29" },
  { star: 5, text: "기질 분석이 너무 정확해서 가족들한테 보여줬는데 다들 맞다고 했어요.", name: "20대 대학생 기○○", date: "2026.05.29" },
  { star: 5, text: "올해 사업에 어려움이 있었는데 사주로 보니 전환기라고 하더라고요. 마음이 편해졌어요.", name: "40대 사업가 나○○", date: "2026.05.28" },
  { star: 5, text: "배우자 인연이 언제 올지 궁금했는데 시기를 알게 돼서 설레네요.", name: "30대 미혼 여성 너○○", date: "2026.05.28" },
  { star: 5, text: "일간이 뭔지도 몰랐는데 이제는 사주 용어가 자연스럽게 익혀졌어요.", name: "20대 사주 입문자 노○○", date: "2026.05.27" },
  { star: 5, text: "진단서처럼 정확하고 처방전처럼 실용적이에요. 개운법이 특히 마음에 들어요.", name: "30대 의료종사자 누○○", date: "2026.05.27" },
  { star: 5, text: "홍연이 쓰는 말투가 신뢰감을 줘요. 점집 가는 것보다 훨씬 체계적이에요.", name: "40대 자영업자 느○○", date: "2026.05.26" },
  { star: 5, text: "연애 파트가 과거 연애의 패턴을 설명해줘서 반성하게 됐어요.", name: "30대 여성 다○○", date: "2026.05.26" },
  { star: 4, text: "사주를 처음 봐서 용어가 낯설었지만 설명이 잘 되어 있어서 이해할 수 있었어요.", name: "20대 사주 초보 더○○", date: "2026.05.25" },
  { star: 5, text: "자식운 파트가 감동이었어요. 아이를 더 잘 이해하게 된 것 같아요.", name: "40대 엄마 도○○", date: "2026.05.25" },
  { star: 5, text: "몇 번이나 다시 읽었어요. 읽을 때마다 새로운 게 보여요.", name: "30대 직장인 두○○", date: "2026.05.24" },
  { star: 5, text: "50대에 접어들면서 인생 2막을 준비하는데 방향을 잡아줘서 감사해요.", name: "50대 직장인 드○○", date: "2026.05.24" },
  { star: 5, text: "남자친구와 궁합이 맞는지 궁금했는데 나 자신을 먼저 알게 돼서 좋았어요.", name: "20대 여성 라○○", date: "2026.05.23" },
  { star: 5, text: "재물운이 오는 시기를 정확히 짚어줘서 그때를 기다리며 준비 중이에요.", name: "30대 직장인 러○○", date: "2026.05.23" },
  { star: 5, text: "친구 생일 선물로 구매해줬는데 너무 좋아했어요. 최고의 선물이에요.", name: "30대 여성 로○○", date: "2026.05.22" },
  { star: 5, text: "분석 내용이 너무 구체적이어서 제 이야기를 누가 써준 것 같았어요.", name: "40대 직장인 루○○", date: "2026.05.22" },
  { star: 4, text: "처음엔 반신반의했는데 읽다 보면 맞는 내용이 많아서 놀랐어요.", name: "30대 이성적인 성격 르○○", date: "2026.05.21" },
  { star: 5, text: "용신 오행에 맞는 음식을 챙겨 먹기 시작했어요. 몸이 가벼워지는 느낌이에요.", name: "30대 건강 관심 마○○", date: "2026.05.21" },
  { star: 5, text: "건강 파트에서 약한 부위가 딱 맞아서 소름 돋았어요. 바로 병원 예약했습니다.", name: "50대 주부 머○○", date: "2026.05.20" },
  { star: 5, text: "요즘 힘들었는데 서신이 위로가 됐어요. 읽고 나니 다시 힘이 났습니다.", name: "20대 취준생 모○○", date: "2026.05.20" },
  { star: 5, text: "이 가격에 이 퀄리티 말이 안 돼요. 진짜 가성비 최고입니다.", name: "30대 합리적 소비자 무○○", date: "2026.05.19" },
  { star: 5, text: "직업 파트에서 제 적성 직군이 정확히 나왔어요. 현재 직업과 딱 맞아요.", name: "30대 직장인 므○○", date: "2026.05.19" },
  { star: 5, text: "부모님과의 관계 갈등 이유를 사주로 이해하게 됐어요. 마음이 풀렸습니다.", name: "20대 직장인 미○○", date: "2026.05.18" },
  { star: 5, text: "두 번째 구매예요. 매년 보고 싶어서요. 올해도 잘 부탁드려요 홍연님.", name: "30대 단골 민○○", date: "2026.05.18" },
  { star: 5, text: "이직 후 낯선 환경에 적응 중인데 사주가 지금 적응기라고 해서 위안이 됐어요.", name: "30대 직장인 바○○", date: "2026.05.17" },
  { star: 5, text: "연애운이 오는 시기를 알고 나니 마음이 설레요. 그 시기에 더 적극적으로 나가볼게요.", name: "30대 싱글 남성 버○○", date: "2026.05.17" },
  { star: 4, text: "분량이 많아서 처음엔 당황했지만 나중에 보니 다 필요한 내용이더라고요.", name: "40대 직장인 보○○", date: "2026.05.16" },
  { star: 5, text: "오행 에너지 이야기가 새로운 관점을 열어줬어요. 삶을 다르게 보게 됐습니다.", name: "30대 철학적 성향 부○○", date: "2026.05.16" },
  { star: 5, text: "시간 모른다고 했는데도 생년월일만으로 이렇게 정확하게 나오다니 신기해요.", name: "40대 주부 브○○", date: "2026.05.15" },
  { star: 5, text: "삼재 시기를 미리 알게 돼서 조심하고 있어요. 덕분에 큰 실수를 피했어요.", name: "30대 직장인 사○○", date: "2026.05.15" },
  { star: 5, text: "과거를 돌아보면서 미래를 준비하게 해준 귀한 시간이었어요.", name: "50대 은퇴 준비 서○○", date: "2026.05.14" },
  { star: 5, text: "홍연이 써준 서신을 인쇄해서 방에 붙여뒀어요. 힘들 때 볼 거예요.", name: "20대 여성 소○○", date: "2026.05.14" },
  { star: 5, text: "사주를 보고 나서 나 자신을 더 잘 이해하게 됐어요. 심리 상담 같은 효과예요.", name: "30대 직장인 수○○", date: "2026.05.13" },
  { star: 5, text: "결혼한 지 10년인데 남편 사주를 이제야 봤어요. 많은 게 이해됐습니다.", name: "40대 주부 스○○", date: "2026.05.13" },
  { star: 5, text: "개운법에 나온 장소 방위를 신경 쓰기 시작했는데 왠지 일이 잘 풀리는 느낌이에요.", name: "30대 자영업자 시○○", date: "2026.05.12" },
  { star: 5, text: "10대 딸아이 생년월일로 봤어요. 딸아이를 더 잘 이해하고 응원할 수 있을 것 같아요.", name: "40대 부모 아○○", date: "2026.05.12" },
  { star: 4, text: "사주에 반신반의하던 제가 완독하게 됐어요. 그만큼 내용이 설득력 있어요.", name: "30대 회의론자 어○○", date: "2026.05.11" },
  { star: 5, text: "기질과 직업 파트가 딱 맞아서 현재 직업이 천직임을 확인했어요.", name: "30대 직장인 에○○", date: "2026.05.11" },
  { star: 5, text: "개운법에서 색깔 추천이 마음에 들어서 그 색 옷을 샀어요. 기분이 좋아지더라고요.", name: "20대 여성 여○○", date: "2026.05.10" },
  { star: 5, text: "사주를 통해 제 인생의 패턴을 이해하게 됐어요. 앞으로가 더 기대됩니다.", name: "30대 자기계발 중 오○○", date: "2026.05.10" },
  { star: 5, text: "가격 대비 내용이 너무 알차요. 점집보다 훨씬 좋아요.", name: "40대 주부 요○○", date: "2026.05.09" },
  { star: 5, text: "매년 봐야겠다 싶을 만큼 유익했어요. 연간 루틴으로 만들 예정이에요.", name: "30대 직장인 우○○", date: "2026.05.09" },
  { star: 5, text: "올해 힘들다고만 생각했는데 왜 힘든지 알고 나니 오히려 버틸 수 있게 됐어요.", name: "20대 취준생 유○○", date: "2026.05.08" },
  { star: 5, text: "건강 챕터에서 주의할 부위를 미리 알게 돼서 바로 생활습관 교정했어요.", name: "40대 건강 관리 이○○", date: "2026.05.08" },
  { star: 5, text: "홍연 말투에 반했어요. 무게감이 있으면서도 따뜻해서 읽는 내내 기분이 좋았어요.", name: "30대 독자 인○○", date: "2026.05.07" },
  { star: 4, text: "AI가 이런 걸 할 수 있다니. 시대가 좋아졌어요. 내용도 충실해서 만족합니다.", name: "50대 직장인 자○○", date: "2026.05.07" },
  { star: 5, text: "대운이 바뀌는 해를 미리 알게 됐어요. 준비를 잘 해둬야겠다는 생각이 들어요.", name: "30대 직장인 저○○", date: "2026.05.06" },
  { star: 5, text: "재물운 챕터가 제일 도움됐어요. 언제 투자하고 언제 조심할지 알게 됐습니다.", name: "40대 투자자 조○○", date: "2026.05.06" },
  { star: 5, text: "사주가 이렇게 위로가 될 줄 몰랐어요. 마음이 많이 가벼워졌습니다.", name: "30대 직장인 주○○", date: "2026.05.05" },
  { star: 5, text: "연인이랑 함께 봤어요. 서로를 더 잘 이해하게 되는 계기가 됐어요.", name: "20대 커플 중 지○○", date: "2026.05.05" },
  { star: 5, text: "인생에서 반복되는 실수의 원인을 사주로 이해했어요. 바꿀 수 있을 것 같아요.", name: "30대 자기반성 중 차○○", date: "2026.05.04" },
  { star: 5, text: "사주 결과지 디자인도 예뻐서 캡처해서 저장했어요. 보기만 해도 기분이 좋아요.", name: "20대 여성 처○○", date: "2026.05.04" },
  { star: 5, text: "홍연이 정확하게 짚어준 덕분에 올해 실수를 미리 피할 수 있었어요.", name: "40대 자영업자 초○○", date: "2026.05.03" },
  { star: 5, text: "결혼을 앞두고 봤는데 배우자 인연 파트가 너무 설레게 만들었어요.", name: "20대 예비신부 추○○", date: "2026.05.03" },
  { star: 4, text: "이렇게 긴 사주 풀이는 처음이에요. 양도 많고 내용도 알차서 만족이에요.", name: "30대 독서광 카○○", date: "2026.05.02" },
  { star: 5, text: "이직 후 새 환경이 사주에 맞는지 확인하고 싶었는데 맞다고 해줘서 안심됐어요.", name: "30대 이직자 캬○○", date: "2026.05.02" },
  { star: 5, text: "사업 파트너 선택에 고민이 있었는데 나 자신을 알게 되니 판단이 쉬워졌어요.", name: "40대 사업가 커○○", date: "2026.05.01" },
  { star: 5, text: "40대에 접어들면서 내 삶을 돌아보고 싶었는데 딱 필요한 내용이었어요.", name: "40대 직장인 코○○", date: "2026.05.01" },
  { star: 5, text: "결과지를 북마크해두고 틈날 때마다 다시 읽어요. 읽을수록 새로워요.", name: "30대 직장인 쿠○○", date: "2026.04.30" },
  { star: 5, text: "홍연이 쓰는 고풍스러운 문체가 사주와 너무 잘 어울려요. 분위기 있어요.", name: "30대 문학 좋아하는 크○○", date: "2026.04.30" },
  { star: 5, text: "올해 좋은 시기라고 해줘서 자신감이 생겼어요. 적극적으로 도전해볼게요.", name: "20대 취준생 키○○", date: "2026.04.29" },
  { star: 5, text: "부모님과 제 사주를 같이 보니 가족 관계가 더 이해됐어요.", name: "30대 자녀 타○○", date: "2026.04.29" },
  { star: 5, text: "개운법에서 추천해준 음식을 챙겨 먹고 있어요. 몸이 좋아지는 느낌이에요.", name: "40대 건강 관심 터○○", date: "2026.04.28" },
  { star: 4, text: "사주를 믿지 않았는데 내용이 너무 맞아서 생각이 바뀌었어요.", name: "30대 비신자 토○○", date: "2026.04.28" },
  { star: 5, text: "생년월일만으로 이렇게 상세하게 분석하다니 정말 신기하고 대단해요.", name: "50대 주부 투○○", date: "2026.04.27" },
  { star: 5, text: "홍연 서신이 너무 감동이에요. 내가 소중한 존재임을 다시 느꼈습니다.", name: "20대 여성 트○○", date: "2026.04.27" },
  { star: 5, text: "결혼 3년 차인데 배우자 이해에 도움이 됐어요. 더 좋은 파트너가 될 것 같아요.", name: "30대 기혼 남성 파○○", date: "2026.04.26" },
  { star: 5, text: "직업 파트에서 제가 왜 이 일을 잘하는지 이유를 알게 됐어요.", name: "30대 전문직 퍼○○", date: "2026.04.26" },
  { star: 5, text: "사주가 이렇게 실용적일 수 있다니. 개운법이 진짜 도움이 돼요.", name: "40대 직장인 포○○", date: "2026.04.25" },
  { star: 5, text: "온 가족 사주를 다 봤어요. 가족 모두가 너무 만족했습니다.", name: "40대 아빠 프○○", date: "2026.04.25" },
  { star: 5, text: "30대 중반인데 인생 방향을 잡는 데 너무 큰 도움이 됐어요.", name: "30대 방향 탐색 중 피○○", date: "2026.04.24" },
  { star: 4, text: "내용이 길어서 처음엔 부담스러웠는데 읽다 보니 멈출 수가 없었어요.", name: "20대 대학원생 하○○", date: "2026.04.24" },
  { star: 5, text: "마무리 서신이 제게 꼭 필요한 말이었어요. 오래 기억에 남을 것 같아요.", name: "30대 직장인 허○○", date: "2026.04.23" },
  { star: 5, text: "용신 오행 맞춤 개운법을 실천한 지 한 달이 됐는데 확실히 달라진 게 느껴져요.", name: "30대 자영업자 혀○○", date: "2026.04.23" },
  { star: 5, text: "친구한테 추천받아서 봤는데 이제 제가 다른 친구들한테 추천하고 있어요.", name: "20대 여성 호○○", date: "2026.04.22" },
  { star: 5, text: "남자친구 사주도 봐야겠다는 생각이 들었어요. 나 자신을 알게 되니 더 궁금해졌어요.", name: "20대 여성 후○○", date: "2026.04.22" },
  { star: 5, text: "인생에서 왜 그 선택들을 했는지 사주로 설명이 됐어요. 신기하고 위안이 됐습니다.", name: "40대 직장인 흐○○", date: "2026.04.21" },
  { star: 5, text: "삼재 시기에 왜 그렇게 힘들었는지 이해가 됐어요. 이제는 준비할 수 있어요.", name: "30대 직장인 희○○", date: "2026.04.21" },
  { star: 5, text: "이렇게 따뜻하고 실용적인 사주 풀이는 처음이에요. 강력 추천합니다.", name: "40대 주부 가○○", date: "2026.04.20" },
  { star: 5, text: "제 성향을 이렇게 정확하게 짚어주는 곳은 처음이에요. 감동 그 자체예요.", name: "30대 직장인 나○○", date: "2026.04.20" },
  { star: 5, text: "결과지를 보고 나서 삶의 방향이 정해진 느낌이에요. 감사합니다 홍연님.", name: "20대 대학생 다○○", date: "2026.04.19" },
  { star: 4, text: "사주 어플 여러 개 써봤는데 홍연이 제일 상세하고 정확해요.", name: "30대 비교분석형 라○○", date: "2026.04.19" },
  { star: 5, text: "개운법을 따르면서 삶에 활력이 생겼어요. 용신 오행이 정말 중요하군요.", name: "40대 자영업자 마○○", date: "2026.04.18" },
  { star: 5, text: "힘든 시기에 위안이 됐어요. 지금이 왜 힘든지 알고 나니 버텨낼 용기가 생겼어요.", name: "30대 직장인 바○○", date: "2026.04.18" },
  { star: 5, text: "제 아이의 사주를 보고 더 잘 이해하게 됐어요. 교육 방향도 잡혔고요.", name: "40대 부모 사○○", date: "2026.04.17" },
  { star: 5, text: "두 번째 구매인데 처음보다 더 잘 읽혀요. 이해도가 높아진 것 같아요.", name: "30대 재구매 아○○", date: "2026.04.17" },
  { star: 5, text: "가격이 이 정도면 진짜 합리적이에요. 점집 한 번 가는 값도 안 되는데 내용은 훨씬 많아요.", name: "50대 자영업자 자○○", date: "2026.04.16" },
  { star: 5, text: "재물운 흐름을 알고 나서 지출을 조절하게 됐어요. 실용적인 도움이 됐습니다.", name: "30대 직장인 차○○", date: "2026.04.16" },
  { star: 5, text: "홍연 덕분에 나 자신과 더 친해진 것 같아요. 나를 이해하는 게 이렇게 중요한 줄 몰랐어요.", name: "20대 여성 카○○", date: "2026.04.15" },
  { star: 5, text: "대운 분석이 진짜 정확해요. 30대에 힘들었던 이유를 이제야 알게 됐어요.", name: "40대 직장인 타○○", date: "2026.04.15" },
  { star: 4, text: "처음에는 그냥 재미로 봤는데 너무 정확해서 진지하게 읽게 됐어요.", name: "20대 대학생 파○○", date: "2026.04.14" },
  { star: 5, text: "올해 남은 기간 개운 타이밍을 알게 돼서 준비가 됐어요. 기대되는 하반기예요.", name: "30대 직장인 하○○", date: "2026.04.14" },
  { star: 5, text: "사주를 보고 내 강점을 다시 인식하게 됐어요. 자존감이 올라간 느낌이에요.", name: "30대 여성 갸○○", date: "2026.04.13" },
  { star: 5, text: "마무리 서신을 읽고 눈물이 났어요. 내가 혼자가 아니라는 느낌을 받았습니다.", name: "20대 여성 냐○○", date: "2026.04.13" },
  { star: 5, text: "부부가 같이 봤어요. 서로의 오행을 이해하게 되니 부부 관계가 더 원만해졌어요.", name: "40대 기혼 댜○○", date: "2026.04.12" },
  { star: 5, text: "타고난 기질을 이렇게 자세히 설명해준 곳은 처음이에요. 감사합니다.", name: "30대 직장인 랴○○", date: "2026.04.12" },
  { star: 5, text: "이직 고민 중이었는데 사주 보고 나서 결정을 내릴 수 있었어요.", name: "30대 직장인 먀○○", date: "2026.04.11" },
  { star: 5, text: "친구 추천으로 왔는데 후회 없는 선택이에요. 친구한테 너무 고마워요.", name: "20대 여성 뱌○○", date: "2026.04.11" },
  { star: 5, text: "대운 흐름을 알고 나서 미래가 덜 불안해졌어요. 준비하면 된다는 생각이 생겼어요.", name: "30대 직장인 샤○○", date: "2026.04.10" },
  { star: 4, text: "용어가 처음에 어려웠지만 설명이 잘 되어 있어서 이해할 수 있었어요.", name: "20대 사주 입문 야○○", date: "2026.04.10" },
  { star: 5, text: "직업운 파트에서 저한테 맞는 환경을 설명해줘서 이직 방향이 잡혔어요.", name: "30대 이직 고민 중 쟈○○", date: "2026.04.09" },
  { star: 5, text: "개운법 실천 중인데 진짜로 좋아지는 것들이 있어요. 꾸준히 할게요.", name: "30대 직장인 챠○○", date: "2026.04.09" },
  { star: 5, text: "나를 이렇게 깊이 이해해준 것이 처음이에요. 홍연이 사람인 줄 알았어요.", name: "40대 주부 탸○○", date: "2026.04.08" },
  { star: 5, text: "사주를 보고 나서 인생이 더 의미있게 느껴졌어요. 이 경험을 추천합니다.", name: "30대 직장인 퍄○○", date: "2026.04.08" },
  { star: 5, text: "결혼 전에 꼭 봐야 할 것 같아요. 나 자신을 알아야 좋은 인연을 알아볼 수 있더라고요.", name: "20대 싱글 여성 햐○○", date: "2026.04.07" },
  { star: 5, text: "40대 후반 인생 후반전을 준비하면서 방향 잡는 데 도움이 됐어요.", name: "40대 직장인 갸나○○", date: "2026.04.07" },
  { star: 5, text: "개인 상담 받는 것보다 더 세밀하게 분석해줬어요. 가격도 훨씬 합리적이에요.", name: "30대 직장인 냐나○○", date: "2026.04.06" },
  { star: 4, text: "사주 서비스 중 가장 만족스러웠어요. 내용이 충실하고 따뜻해요.", name: "40대 비교 경험자 댜나○○", date: "2026.04.06" },
  { star: 5, text: "올해 안 좋은 일이 많았는데 사주로 이해하고 나니 오히려 위안이 됐어요.", name: "30대 직장인 랴나○○", date: "2026.04.05" },
  { star: 5, text: "연인과 갈등이 많았는데 제 성향을 이해하니 어떻게 맞춰가야 할지 알게 됐어요.", name: "20대 여성 먀나○○", date: "2026.04.05" },
  { star: 5, text: "건강 파트가 제일 정확했어요. 예전부터 신경 쓰이던 부위가 딱 나와 있었어요.", name: "50대 주부 뱌나○○", date: "2026.04.04" },
  { star: 5, text: "사업 방향을 고민하다가 봤는데 큰 도움이 됐어요. 결정을 내릴 수 있었습니다.", name: "40대 사업가 샤나○○", date: "2026.04.04" },
  { star: 5, text: "내 인생의 의미를 사주를 통해 다시 발견한 느낌이에요. 감사합니다 홍연.", name: "30대 직장인 야나○○", date: "2026.04.03" },
  { star: 5, text: "결과지를 여러 번 읽었는데 볼수록 더 많은 걸 발견해요.", name: "20대 대학원생 쟈나○○", date: "2026.04.03" },
  { star: 5, text: "대운 교체기를 미리 준비했더니 이번 전환이 더 수월했어요.", name: "40대 직장인 챠나○○", date: "2026.04.02" },
  { star: 5, text: "지인들한테 돌리고 싶을 만큼 좋은 내용이었어요. 강력히 추천합니다.", name: "30대 직장인 탸나○○", date: "2026.04.02" },
  { star: 5, text: "재물운과 직업운이 맞물리는 시기를 알게 되어서 목표를 세울 수 있었어요.", name: "30대 직장인 파나○○", date: "2026.04.01" },
  { star: 4, text: "사주를 믿지 않았지만 내용이 구체적이고 논리적이어서 설득이 됐어요.", name: "30대 이성주의자 하나○○", date: "2026.04.01" },
  { star: 5, text: "사주에서 제 성향이 정확하게 나와서 스스로를 더 잘 이해하게 됐어요.", name: "30대 직장인 가다○○", date: "2026.03.31" },
  { star: 5, text: "마무리 서신이 저한테 딱 필요한 말이었어요. 마음이 따뜻해졌습니다.", name: "20대 여성 나다○○", date: "2026.03.31" },
  { star: 5, text: "결혼을 결정하는 데 사주가 도움을 줬어요. 제 기질을 알게 되니 더 확신이 생겼어요.", name: "30대 예비신랑 다다○○", date: "2026.03.30" },
  { star: 5, text: "60대에 이런 서비스를 알게 돼서 다행이에요. 남은 인생 잘 살아볼게요.", name: "60대 은퇴자 라다○○", date: "2026.03.30" },
  { star: 5, text: "사주를 보고 나서 제 삶에 자신감이 생겼어요. 잘 될 이유가 있더라고요.", name: "20대 취준생 마다○○", date: "2026.03.29" },
  { star: 5, text: "인연운 파트가 너무 설렜어요. 그 시기를 기다리며 열심히 준비할게요.", name: "30대 싱글 여성 바다○○", date: "2026.03.29" },
  { star: 5, text: "이 서비스 알게 된 게 올해 최고의 발견이에요. 주변에 다 알려줬습니다.", name: "30대 직장인 사다○○", date: "2026.03.28" },
  { star: 5, text: "사주가 이렇게 따뜻할 수 있다는 걸 처음 알았어요. 홍연 덕분이에요.", name: "40대 주부 아다○○", date: "2026.03.28" },
  { star: 4, text: "사주보다 자기이해 도구로 쓰기 좋아요. 나를 객관적으로 볼 수 있게 됐어요.", name: "30대 심리 관심 자다○○", date: "2026.03.27" },
  { star: 5, text: "용신 오행 실천이 생각보다 쉬워요. 일상에서 조금씩 바꾸고 있어요.", name: "30대 직장인 차다○○", date: "2026.03.27" },
  { star: 5, text: "50대 건강을 챙기는 데 사주가 도움이 됐어요. 취약 부위를 미리 알게 됐어요.", name: "50대 직장인 카다○○", date: "2026.03.26" },
  { star: 5, text: "결과지를 보고 나서 올해 계획이 생겼어요. 방향이 잡히는 느낌이에요.", name: "30대 직장인 타다○○", date: "2026.03.26" },
  { star: 5, text: "두 번 구매했어요. 작년이랑 비교하면서 보는 재미가 있어요.", name: "30대 재구매 파다○○", date: "2026.03.25" },
  { star: 5, text: "개운법에 나온 공간 방향을 책상 배치에 적용했어요. 집중력이 올라간 것 같아요.", name: "20대 대학생 하다○○", date: "2026.03.25" },
  { star: 5, text: "내 사주에서 제일 강한 오행이 뭔지 알게 됐어요. 그 기운을 살리려고 노력 중이에요.", name: "30대 직장인 가라○○", date: "2026.03.24" },
  { star: 5, text: "사주를 보고 나서 과거 힘들었던 시기가 이해됐어요. 이제는 앞을 볼 수 있어요.", name: "40대 직장인 나라○○", date: "2026.03.24" },
  { star: 5, text: "결혼 5년인데 남편이 왜 그런 성향인지 이해가 됐어요. 더 넓은 마음으로 볼 수 있어요.", name: "30대 주부 다라○○", date: "2026.03.23" },
  { star: 4, text: "분석 내용이 많아서 세 번에 나눠서 읽었어요. 그만큼 볼 게 많다는 뜻이에요.", name: "40대 직장인 라라○○", date: "2026.03.23" },
  { star: 5, text: "사업 위기 때 봤는데 지금이 전환점이라는 말이 큰 위로가 됐어요.", name: "40대 사업가 마라○○", date: "2026.03.22" },
  { star: 5, text: "재물과 건강을 동시에 챙길 수 있는 시기를 알게 됐어요. 올해 열심히 할게요.", name: "30대 직장인 바라○○", date: "2026.03.22" },
  { star: 5, text: "연인과의 갈등 패턴이 사주로 설명됐어요. 상대방을 더 이해하게 됐습니다.", name: "30대 커플 사라○○", date: "2026.03.21" },
  { star: 5, text: "개운법에서 추천한 색깔 소품을 샀는데 기분이 달라지는 느낌이에요.", name: "20대 여성 아라○○", date: "2026.03.21" },
  { star: 5, text: "나 자신에 대해 더 깊이 이해하게 됐어요. 심리 치료보다 더 도움이 된 것 같아요.", name: "30대 여성 자라○○", date: "2026.03.20" },
  { star: 5, text: "사주 결과지를 가족들이랑 같이 읽었어요. 서로에 대해 더 알게 되는 시간이었습니다.", name: "40대 가족 차라○○", date: "2026.03.20" },
  { star: 5, text: "삼재 시기를 미리 알아서 무리하지 않기로 했어요. 현명하게 보낼 수 있을 것 같아요.", name: "30대 직장인 카라○○", date: "2026.03.19" },
  { star: 5, text: "마무리 서신이 제 마음을 정확하게 짚어줬어요. 소름이 돋았습니다.", name: "20대 여성 타라○○", date: "2026.03.19" },
  { star: 5, text: "처음 봤는데 너무 정확해서 두 번 세 번 다시 읽었어요. 완전 추천해요.", name: "30대 직장인 파라○○", date: "2026.03.18" },
  { star: 4, text: "사주가 이렇게 실용적일 줄 몰랐어요. 개운법이 진짜 도움이 됩니다.", name: "30대 실용주의 하라○○", date: "2026.03.18" },
  { star: 5, text: "직업 파트에서 추천 환경이 제 꿈꾸던 직장 환경과 똑같아서 확신이 생겼어요.", name: "20대 취준생 가마○○", date: "2026.03.17" },
  { star: 5, text: "대운 흐름을 알고 나서 조급함이 사라졌어요. 때가 있다는 걸 믿게 됐어요.", name: "30대 직장인 나마○○", date: "2026.03.17" },
  { star: 5, text: "인생에서 반복되는 패턴의 이유를 알게 됐어요. 이제는 바꿀 수 있을 것 같아요.", name: "40대 직장인 다마○○", date: "2026.03.16" },
  { star: 5, text: "홍연이 정말 나를 위해 써준 것 같은 느낌이에요. 진심이 느껴졌어요.", name: "30대 여성 라마○○", date: "2026.03.16" },
  { star: 5, text: "올해 투자를 고민했는데 재물운 파트 보고 시기를 결정했어요. 잘 되길 바라요.", name: "40대 직장인 마마○○", date: "2026.03.15" },
  { star: 5, text: "사주를 보고 나서 인간관계가 정리됐어요. 누가 진짜 귀인인지 알 것 같아요.", name: "30대 직장인 바마○○", date: "2026.03.15" },
  { star: 5, text: "20대에 이 서비스를 알게 돼서 다행이에요. 앞으로 매년 볼 것 같아요.", name: "20대 대학생 사마○○", date: "2026.03.14" },
  { star: 5, text: "홍연 덕분에 제 인생을 더 아끼게 됐어요. 소중한 시간이었습니다.", name: "30대 직장인 아마○○", date: "2026.03.14" },
  { star: 5, text: "내 아이 사주도 봤어요. 아이의 강점과 지원 방향을 알게 됐습니다.", name: "40대 부모 자마○○", date: "2026.03.13" },
  { star: 4, text: "사주 내용이 과학적으로는 설명 안 되지만 너무 맞아서 믿게 됐어요.", name: "30대 과학자 차마○○", date: "2026.03.13" },
  { star: 5, text: "올해 하반기가 기대돼요. 사주에서 좋은 시기라고 해줬거든요.", name: "30대 직장인 카마○○", date: "2026.03.12" },
  { star: 5, text: "제 주변 사람들도 다 보게 하고 싶어요. 진짜 좋은 서비스예요.", name: "20대 여성 타마○○", date: "2026.03.12" },
  { star: 5, text: "사주를 처음 봤는데 이렇게 긍정적인 경험이 될 줄 몰랐어요. 감사합니다.", name: "30대 직장인 파마○○", date: "2026.03.11" },
  { star: 5, text: "건강 파트에서 챙겨야 할 부위를 알게 됐어요. 예방이 치료보다 낫다고 하잖아요.", name: "50대 주부 하마○○", date: "2026.03.11" },
  { star: 5, text: "사주 보고 용기가 생겼어요. 제 안에 이미 강한 에너지가 있다는 걸 알았으니까요.", name: "30대 여성 가바○○", date: "2026.03.10" },
  { star: 5, text: "이직 결정을 못 하고 있었는데 사주 보고 나서 바로 결정했어요. 잘 됐으면 좋겠어요.", name: "30대 직장인 나바○○", date: "2026.03.10" },
  { star: 5, text: "마무리 서신에서 제가 혼자가 아니라는 말이 너무 감동이었어요.", name: "20대 여성 다바○○", date: "2026.03.09" },
  { star: 5, text: "사주를 보고 나서 삶의 에너지가 달라진 느낌이에요. 긍정적으로 변하고 있어요.", name: "30대 직장인 라바○○", date: "2026.03.09" },
  { star: 4, text: "AI가 쓴 것 같은 느낌이 살짝 있었지만 내용 자체는 너무 좋아요.", name: "20대 대학원생 마바○○", date: "2026.03.08" },
  { star: 5, text: "재물운 사이클을 알고 나서 불필요한 지출을 줄이게 됐어요. 실질적인 도움이에요.", name: "30대 직장인 바바○○", date: "2026.03.08" },
  { star: 5, text: "홍연 서신이 제게 쓴 편지 같아서 정말 울 뻔 했어요. 감동이에요.", name: "40대 주부 사바○○", date: "2026.03.07" },
  { star: 5, text: "결혼 후 첫 사주 봤는데 배우자 파트가 너무 맞아서 놀랐어요.", name: "30대 기혼 아바○○", date: "2026.03.07" },
  { star: 5, text: "개운법에 나온 행동들을 하나씩 실천하고 있어요. 뭔가 달라지는 것 같아요.", name: "20대 여성 자바○○", date: "2026.03.06" },
  { star: 5, text: "대운 분석이 제 인생 타임라인과 너무 잘 맞아서 신기했어요.", name: "40대 직장인 차바○○", date: "2026.03.06" },
  { star: 5, text: "사주를 통해 제 장단점을 객관적으로 보게 됐어요. 자기계발에 도움이 됩니다.", name: "30대 직장인 카바○○", date: "2026.03.05" },
  { star: 5, text: "용신 오행을 알고 나서 음식을 가려먹기 시작했어요. 몸이 가벼워지는 느낌이에요.", name: "30대 직장인 타바○○", date: "2026.03.05" },
  { star: 5, text: "사주가 이렇게 따뜻하고 실용적인 도구가 될 수 있다는 걸 처음 알았어요.", name: "20대 대학생 파바○○", date: "2026.03.04" },
  { star: 5, text: "제 삶에 자신감을 불어넣어 줘서 감사해요. 앞으로 잘 할 수 있을 것 같아요.", name: "30대 직장인 하바○○", date: "2026.03.04" },
  { star: 5, text: "인간관계 파트가 정말 도움이 됐어요. 어떤 사람과 잘 맞는지 알게 됐습니다.", name: "40대 자영업자 가사○○", date: "2026.03.03" },
  { star: 4, text: "처음엔 길어서 부담스러웠는데 읽다 보니 다 필요한 내용이었어요.", name: "30대 직장인 나사○○", date: "2026.03.03" },
  { star: 5, text: "제 아이 사주를 보고 어떻게 지원해야 할지 방향이 잡혔어요. 감사합니다.", name: "40대 부모 다사○○", date: "2026.03.02" },
  { star: 5, text: "홍연 덕분에 제 삶이 더 풍요로워진 느낌이에요. 정말 감사합니다.", name: "30대 직장인 라사○○", date: "2026.03.02" },
  { star: 5, text: "생년월일만으로 이렇게 많은 걸 알 수 있다니. 사주의 깊이에 놀랐습니다.", name: "20대 대학생 마사○○", date: "2026.03.01" },
  { star: 5, text: "사주를 보고 나서 나 자신을 사랑하게 됐어요. 제 안에 이런 강점이 있다니요.", name: "30대 여성 바사○○", date: "2026.03.01" },
  { star: 5, text: "대운이 바뀌는 시기를 알고 준비했더니 변화가 덜 두려웠어요.", name: "40대 직장인 사사○○", date: "2026.02.28" },
  { star: 5, text: "홍연 말투가 너무 마음에 들어요. 읽는 내내 따뜻한 조언을 받는 느낌이었어요.", name: "20대 대학생 아사○○", date: "2026.02.28" },
  { star: 5, text: "직장 갈등이 많았는데 제 기질 파트를 보고 왜 그런지 이해가 됐어요.", name: "30대 직장인 자사○○", date: "2026.02.27" },
  { star: 4, text: "가격이 합리적이고 내용도 충실해요. 첫 사주 보기에 좋은 곳이에요.", name: "20대 입문자 차사○○", date: "2026.02.27" },
  { star: 5, text: "건강 주의 시기를 미리 알아서 운동을 시작했어요. 몸이 좋아지고 있어요.", name: "40대 주부 카사○○", date: "2026.02.26" },
  { star: 5, text: "연인과 헤어지고 힘들 때 봤어요. 인연운 파트가 다시 희망을 줬어요.", name: "30대 여성 타사○○", date: "2026.02.26" },
  { star: 5, text: "사주로 내 삶의 사이클을 이해하게 됐어요. 조급함이 사라졌습니다.", name: "30대 직장인 파사○○", date: "2026.02.25" },
  { star: 5, text: "분석이 너무 섬세해서 제가 직접 쓴 자기소개서 같았어요.", name: "20대 여성 하사○○", date: "2026.02.25" },
  { star: 5, text: "사업이 힘들 때 봤는데 지금이 씨앗을 심는 시기라고 해줘서 버틸 수 있었어요.", name: "40대 사업가 가아○○", date: "2026.02.24" },
  { star: 5, text: "이직 후 새 직장이 나랑 맞는지 확인하고 싶었는데 맞다고 해줘서 안심됐어요.", name: "30대 직장인 나아○○", date: "2026.02.24" },
  { star: 5, text: "사주를 보고 나서 인간관계를 정리하게 됐어요. 진짜 귀인을 알아보게 됐어요.", name: "30대 여성 다아○○", date: "2026.02.23" },
  { star: 5, text: "개운법 실천 두 달째인데 확실히 달라지고 있어요. 꾸준히 할게요.", name: "30대 직장인 라아○○", date: "2026.02.23" },
  { star: 4, text: "사주를 논리적으로 설명해줘서 이해하기 쉬웠어요. 납득이 됐습니다.", name: "40대 직장인 마아○○", date: "2026.02.22" },
  { star: 5, text: "올해 연애운이 온다고 해서 설레요. 적극적으로 나가볼 준비를 하고 있어요.", name: "20대 싱글 바아○○", date: "2026.02.22" },
  { star: 5, text: "타고난 기질을 인정하게 됐어요. 나를 바꾸려 하지 않고 살리는 방향으로 살기로 했어요.", name: "30대 직장인 사아○○", date: "2026.02.21" },
  { star: 5, text: "건강 파트에서 챙겨야 할 내장 기관이 딱 맞아서 관련 검진을 받았어요.", name: "50대 주부 아아○○", date: "2026.02.21" },
  { star: 5, text: "마무리 서신을 읽고 많이 울었어요. 제가 충분히 잘 살아왔다는 말이 위로가 됐어요.", name: "40대 직장인 자아○○", date: "2026.02.20" },
  { star: 5, text: "사주를 처음 봤는데 너무 정확해서 두 번 놀랐어요. 처음 봤을 때, 또 다시 읽었을 때.", name: "30대 직장인 차아○○", date: "2026.02.20" },
  { star: 5, text: "남편이 사주를 믿지 않는데 남편 것 봐줬더니 맞다고 놀라더라고요. 이제 믿어요.", name: "40대 주부 카아○○", date: "2026.02.19" },
  { star: 5, text: "용신 오행 실천이 어렵지 않아요. 조금씩 바꾸면서 변화를 느끼고 있어요.", name: "30대 직장인 타아○○", date: "2026.02.19" },
  { star: 5, text: "제 인생에서 반복됐던 문제의 원인을 알게 됐어요. 이제는 바꿀 수 있을 것 같아요.", name: "30대 여성 파아○○", date: "2026.02.18" },
  { star: 5, text: "사주를 통해 제 삶에 더 감사하게 됐어요. 있는 것에 집중하게 됐습니다.", name: "20대 여성 하아○○", date: "2026.02.18" },
  { star: 4, text: "내용이 길지만 모두 의미 있었어요. 읽는 데 시간이 걸려도 충분히 가치 있어요.", name: "40대 직장인 가자○○", date: "2026.02.17" },
  { star: 5, text: "대운 흐름을 알고 나서 인생의 큰 그림이 보였어요. 마음이 편해졌습니다.", name: "30대 직장인 나자○○", date: "2026.02.17" },
  { star: 5, text: "결혼 전 나 자신을 알고 싶어서 봤어요. 정말 좋은 선택이었습니다.", name: "20대 예비신부 다자○○", date: "2026.02.16" },
  { star: 5, text: "올해 힘든 일이 많았는데 대운 교체기라고 해줘서 위안이 됐어요.", name: "30대 직장인 라자○○", date: "2026.02.16" },
  { star: 5, text: "사주가 나를 이해해주는 도구가 될 수 있다는 걸 처음 알았어요.", name: "30대 여성 마자○○", date: "2026.02.15" },
  { star: 5, text: "개운법에서 관계 귀인 오행을 알게 됐어요. 어떤 사람이 내 귀인인지 알아보게 됐어요.", name: "30대 직장인 바자○○", date: "2026.02.15" },
  { star: 5, text: "60대 어머니께 선물드렸는데 너무 좋아하셨어요. 부모님 세대에도 잘 맞아요.", name: "40대 자녀 사자○○", date: "2026.02.14" },
  { star: 5, text: "사주를 보고 나서 더 열심히 살고 싶어졌어요. 내 시기가 온다는 걸 알았으니까요.", name: "20대 취준생 아자○○", date: "2026.02.14" },
  { star: 5, text: "삼재 주의 시기에 큰 결정을 미뤘더니 정말 잘 됐어요. 홍연 말이 맞았어요.", name: "40대 자영업자 자자○○", date: "2026.02.13" },
  { star: 4, text: "반신반의하며 봤는데 성격 파트부터 너무 맞아서 진지하게 읽게 됐어요.", name: "30대 회의론자 차자○○", date: "2026.02.13" },
  { star: 5, text: "용신 색깔 옷을 입기 시작했어요. 면접에서 그 색 입고 합격했어요. 우연일까요.", name: "20대 취준생 카자○○", date: "2026.02.12" },
  { star: 5, text: "재물운이 오는 시기를 미리 알고 준비했더니 정말 기회가 왔어요.", name: "40대 직장인 타자○○", date: "2026.02.12" },
  { star: 5, text: "사주 내용을 가족들이랑 나눠봤어요. 가족 간 이해가 깊어지는 계기가 됐습니다.", name: "30대 직장인 파자○○", date: "2026.02.11" },
  { star: 5, text: "직장에서 왜 특정 상황에서 힘든지 이해가 됐어요. 대처법도 생겼습니다.", name: "30대 직장인 하자○○", date: "2026.02.11" },
  { star: 5, text: "홍연이 진짜 사람처럼 느껴졌어요. 그만큼 온기가 담겨 있어요.", name: "20대 여성 가차○○", date: "2026.02.10" },
  { star: 5, text: "건강 파트가 너무 정확해요. 예전부터 신경 쓰였던 부위가 딱 나와 있었어요.", name: "50대 자영업자 나차○○", date: "2026.02.10" },
  { star: 5, text: "사주를 통해 나를 더 잘 알게 됐어요. 자존감이 올라간 느낌이에요.", name: "30대 직장인 다차○○", date: "2026.02.09" },
  { star: 5, text: "매년 보고 싶어요. 이제 인생 연간 루틴이 됐어요.", name: "40대 직장인 라차○○", date: "2026.02.09" },
  { star: 4, text: "처음에는 어떻게 이걸 믿냐고 했는데 읽다 보니 다 맞는 것 같았어요.", name: "30대 남성 마차○○", date: "2026.02.08" },
  { star: 5, text: "힘든 시기를 버티게 해준 사주예요. 지금이 전환점이라는 말이 큰 힘이 됐어요.", name: "30대 직장인 바차○○", date: "2026.02.08" },
  { star: 5, text: "결과지를 부모님께도 보여드렸어요. 부모님도 너무 정확하다고 하셨어요.", name: "20대 대학생 사차○○", date: "2026.02.07" },
  { star: 5, text: "올해 재물운이 오는 시기를 알게 돼서 준비 중이에요. 기대돼요.", name: "30대 직장인 아차○○", date: "2026.02.07" },
  { star: 5, text: "홍연 덕분에 제 삶이 더 의미 있어졌어요. 고맙습니다.", name: "40대 주부 자차○○", date: "2026.02.06" },
  { star: 5, text: "사주를 보고 나서 나 자신이 소중하다는 걸 다시 느꼈어요.", name: "20대 여성 차차○○", date: "2026.02.06" },
  { star: 5, text: "개운법에서 추천해준 습관들이 실제로 도움이 됐어요. 감사합니다.", name: "30대 직장인 카차○○", date: "2026.02.05" },
  { star: 5, text: "연인이랑 함께 봤는데 서로의 오행을 알게 되니 이해가 쉬워졌어요.", name: "20대 커플 타차○○", date: "2026.02.05" },
  { star: 5, text: "사주 보고 이직을 결정했어요. 시기가 맞다고 해줘서 용기가 생겼어요.", name: "30대 직장인 파차○○", date: "2026.02.04" },
  { star: 5, text: "내 아이가 어떤 방향으로 자라면 좋을지 알게 됐어요. 부모로서 도움이 됐어요.", name: "40대 부모 하차○○", date: "2026.02.04" },
  { star: 5, text: "직업 파트가 제 꿈꾸는 방향과 일치해서 확신이 생겼어요.", name: "20대 취준생 가카○○", date: "2026.02.03" },
  { star: 4, text: "사주를 이해하기 쉽게 풀어줘서 입문자에게도 좋아요.", name: "20대 입문자 나카○○", date: "2026.02.03" },
  { star: 5, text: "올해 어렵다고만 생각했는데 왜 어려운지 알고 나니 오히려 마음이 편해졌어요.", name: "30대 직장인 다카○○", date: "2026.02.02" },
  { star: 5, text: "홍연이 써준 서신이 제 마음을 다 알고 있는 것 같았어요. 소름 돋았어요.", name: "30대 여성 라카○○", date: "2026.02.02" },
  { star: 5, text: "재물운 사이클을 알고 나서 투자 타이밍을 잡게 됐어요. 잘 되고 있어요.", name: "40대 투자자 마카○○", date: "2026.02.01" },
  { star: 5, text: "삼재가 언제인지 알게 됐어요. 그 시기엔 조심하며 보낼게요.", name: "30대 직장인 바카○○", date: "2026.02.01" },
  { star: 5, text: "사주를 보고 나서 인생의 계획이 생겼어요. 목표가 생기니 삶이 달라졌어요.", name: "20대 대학생 사카○○", date: "2026.01.31" },
  { star: 5, text: "건강 챕터를 보고 바로 병원을 예약했어요. 조기 발견이 중요하다는 걸 알게 됐어요.", name: "50대 주부 아카○○", date: "2026.01.31" },
  { star: 5, text: "이 서비스 덕분에 나를 더 잘 이해하게 됐어요. 진심으로 감사합니다.", name: "30대 직장인 자카○○", date: "2026.01.30" },
  { star: 5, text: "마무리 서신이 딱 제가 듣고 싶었던 말이었어요. 마음이 충만해졌습니다.", name: "30대 여성 차카○○", date: "2026.01.30" },
  { star: 5, text: "가족들이랑 서로 사주를 공유했어요. 서로를 더 잘 이해하게 됐습니다.", name: "40대 가족 카카○○", date: "2026.01.29" },
  { star: 4, text: "사주를 보고 나서 삶의 흐름을 믿게 됐어요. 때가 있다는 말이 위안이 됩니다.", name: "30대 직장인 타카○○", date: "2026.01.29" },
  { star: 5, text: "대운 교체기를 미리 알고 준비했더니 변화가 덜 힘들었어요.", name: "40대 직장인 파카○○", date: "2026.01.28" },
  { star: 5, text: "재물 파트와 직업 파트가 가장 도움이 됐어요. 이직 결정에 큰 힘이 됐습니다.", name: "30대 직장인 하카○○", date: "2026.01.28" },
  { star: 5, text: "사주를 보고 나서 제 인생에 감사하게 됐어요. 이미 많은 걸 가지고 있었네요.", name: "30대 여성 가타○○", date: "2026.01.27" },
  { star: 5, text: "홍연 덕분에 나를 알게 됐고, 나를 알게 되니 삶이 더 선명해졌어요.", name: "20대 여성 나타○○", date: "2026.01.27" },
  { star: 5, text: "인연운 파트에서 언제 좋은 만남이 올지 알게 됐어요. 그 시기를 기대하고 있어요.", name: "30대 싱글 다타○○", date: "2026.01.26" },
  { star: 5, text: "직장에서 어떤 환경에서 잘 맞는지 알게 됐어요. 이직 방향이 잡혔습니다.", name: "30대 직장인 라타○○", date: "2026.01.26" },
  { star: 5, text: "용신 오행 음식을 챙겨먹기 시작했는데 소화가 잘 돼요. 신기해요.", name: "40대 건강 관심 마타○○", date: "2026.01.25" },
  { star: 5, text: "사주를 통해 내 삶의 의미를 다시 발견했어요. 귀한 경험이었습니다.", name: "30대 직장인 바타○○", date: "2026.01.25" },
  { star: 4, text: "이렇게 따뜻한 사주 풀이는 처음이에요. 정보와 위로를 동시에 받았어요.", name: "20대 여성 사타○○", date: "2026.01.24" },
  { star: 5, text: "사주 보고 나서 올해 남은 계획을 세웠어요. 뭔가 할 수 있을 것 같아요.", name: "30대 직장인 아타○○", date: "2026.01.24" },
  { star: 5, text: "홍연 말투가 처음엔 어색했는데 읽다 보니 너무 자연스럽고 따뜻했어요.", name: "20대 대학생 자타○○", date: "2026.01.23" },
  { star: 5, text: "결혼 적령기를 고민하던 중 봤는데 내 인연 시기를 알게 됐어요.", name: "20대 싱글 차타○○", date: "2026.01.23" },
  { star: 5, text: "사주를 보고 나서 지금 제 선택이 옳다는 확신이 생겼어요.", name: "30대 직장인 카타○○", date: "2026.01.22" },
  { star: 5, text: "개운법을 실천하면서 하루하루가 더 의미 있어지고 있어요.", name: "30대 직장인 타타○○", date: "2026.01.22" },
  { star: 5, text: "부모님 사주를 봤는데 부모님을 더 이해하게 됐어요. 감사한 마음이 커졌습니다.", name: "20대 자녀 파타○○", date: "2026.01.21" },
  { star: 5, text: "힘든 시기에 지금 왜 힘든지 알게 되니 버틸 수 있었어요. 고마워요 홍연.", name: "30대 직장인 하타○○", date: "2026.01.21" },
  { star: 5, text: "대운 흐름을 알고 나서 조급함이 없어졌어요. 내 때가 온다는 걸 믿게 됐어요.", name: "30대 직장인 가파○○", date: "2026.01.20" },
  { star: 4, text: "처음엔 긴 내용에 부담됐지만 읽으면 읽을수록 더 빠져들었어요.", name: "30대 독서가 나파○○", date: "2026.01.20" },
  { star: 5, text: "제 삶에서 반복됐던 힘든 패턴이 이제 이해됩니다. 바꿔나갈 수 있을 것 같아요.", name: "40대 직장인 다파○○", date: "2026.01.19" },
  { star: 5, text: "사주가 이렇게 따뜻하고 현실적인 도구가 될 수 있다는 걸 알게 됐어요.", name: "30대 여성 라파○○", date: "2026.01.19" },
  { star: 5, text: "재물운이 안 좋은 시기를 미리 알아서 큰 지출을 미뤘어요. 잘한 선택이었어요.", name: "40대 주부 마파○○", date: "2026.01.18" },
  { star: 5, text: "홍연 서신이 진심 담긴 편지처럼 느껴졌어요. 오래 기억에 남을 것 같아요.", name: "20대 여성 바파○○", date: "2026.01.18" },
  { star: 5, text: "건강 파트가 정확해서 관련 검진을 챙겨받고 있어요. 예방이 최고예요.", name: "50대 직장인 사파○○", date: "2026.01.17" },
  { star: 5, text: "사주를 보고 나서 나 자신에게 더 친절해졌어요. 내 한계를 인정하게 됐어요.", name: "30대 직장인 아파○○", date: "2026.01.17" },
  { star: 5, text: "이직 후 새 직장에서의 적응이 빠를 거라고 해줬는데 진짜 그랬어요.", name: "30대 직장인 자파○○", date: "2026.01.16" },
  { star: 5, text: "올해 인연운이 온다고 해줘서 적극적으로 나가기로 했어요.", name: "30대 싱글 차파○○", date: "2026.01.16" },
  { star: 5, text: "사주를 보고 나서 제 삶에 더 집중하게 됐어요. 남과 비교하지 않게 됐어요.", name: "30대 직장인 카파○○", date: "2026.01.15" },
  { star: 5, text: "가족 모두 봤어요. 각자의 성향을 이해하게 돼서 가족 관계가 더 좋아졌어요.", name: "40대 엄마 타파○○", date: "2026.01.15" },
  { star: 5, text: "직장에서 힘들었던 이유를 사주로 이해했어요. 대처법도 생겼어요.", name: "30대 직장인 파파○○", date: "2026.01.14" },
  { star: 4, text: "여러 사주 서비스를 써봤는데 홍연이 제일 따뜻하고 상세해요.", name: "40대 비교 경험자 하파○○", date: "2026.01.14" },
  { star: 5, text: "용신 오행을 실천하면서 삶이 조금씩 나아지고 있어요.", name: "30대 직장인 가하○○", date: "2026.01.13" },
  { star: 5, text: "인생 전반을 이렇게 잘 설명해준 것이 처음이에요. 감동 그 자체입니다.", name: "50대 은퇴 준비 나하○○", date: "2026.01.13" },
  { star: 5, text: "사주를 보고 나서 제 강점이 뭔지 알게 됐어요. 더 자신있게 살 수 있을 것 같아요.", name: "20대 여성 다하○○", date: "2026.01.12" },
  { star: 5, text: "연인이 왜 그런 성향인지 이해하게 됐어요. 제 사주를 통해서요.", name: "30대 커플 라하○○", date: "2026.01.12" },
  { star: 5, text: "사주 보고 나서 당장 개운법을 실천했어요. 변화가 느껴지고 있어요.", name: "30대 직장인 마하○○", date: "2026.01.11" },
  { star: 5, text: "홍연 덕분에 내 인생을 더 아끼게 됐어요. 나를 소중히 여기게 됐습니다.", name: "20대 여성 바하○○", date: "2026.01.11" },
  { star: 5, text: "삼재 시기를 알게 돼서 그 기간에 큰 결정을 미루기로 했어요.", name: "40대 자영업자 사하○○", date: "2026.01.10" },
  { star: 5, text: "제 일주가 뭔지 알게 됐어요. 그 일주의 특성이 저를 너무 잘 설명해요.", name: "30대 사주 입문 아하○○", date: "2026.01.10" },
  { star: 5, text: "결과지를 읽으면서 울고 웃고 했어요. 감정이 많이 올라왔습니다.", name: "30대 직장인 자하○○", date: "2026.01.09" },
  { star: 4, text: "내용이 방대해서 압도되는 느낌이 있었지만 그만큼 가치가 있었어요.", name: "40대 직장인 차하○○", date: "2026.01.09" },
  { star: 5, text: "사주를 보고 나서 제 인생의 방향이 잡혔어요. 앞으로 뭘 해야 할지 알게 됐어요.", name: "20대 취준생 카하○○", date: "2026.01.08" },
  { star: 5, text: "홍연이 제게 마지막으로 남겨준 말이 오래 마음에 남았어요.", name: "30대 여성 타하○○", date: "2026.01.08" },
  { star: 5, text: "재물운과 건강운을 동시에 챙길 수 있는 방법을 알게 됐어요.", name: "40대 직장인 파하○○", date: "2026.01.07" },
  { star: 5, text: "사주를 통해 내 삶을 더 사랑하게 됐어요. 나를 응원하게 됐습니다.", name: "30대 여성 하하○○", date: "2026.01.07" },
  { star: 5, text: "인생 처음으로 사주를 봤는데 이렇게 깊은 경험이 될 줄 몰랐어요.", name: "20대 대학생 갈갈○○", date: "2026.01.06" },
  { star: 5, text: "홍연 덕분에 내 삶의 이야기를 다시 쓰게 됐어요. 감사합니다.", name: "30대 직장인 날날○○", date: "2026.01.06" },
  { star: 5, text: "대운 흐름이 맞아서 앞으로가 기대돼요. 준비 잘 하겠습니다.", name: "30대 직장인 달달○○", date: "2026.01.05" },
  { star: 5, text: "사주를 보고 나서 더 나은 사람이 되고 싶어졌어요. 동기 부여가 됐습니다.", name: "20대 여성 랄랄○○", date: "2026.01.05" },
  { star: 5, text: "타고난 기질을 이렇게 깊이 분석해준 곳은 처음이에요. 완전 감동이에요.", name: "40대 직장인 말말○○", date: "2026.01.04" },
  { star: 4, text: "처음엔 긴 내용이 부담스러웠지만 읽으면서 점점 빠져들었어요.", name: "30대 독자 발발○○", date: "2026.01.04" },
  { star: 5, text: "개운법을 실천한 지 석 달이 됐어요. 확실히 뭔가 달라지고 있어요.", name: "30대 직장인 살살○○", date: "2026.01.03" },
  { star: 5, text: "사주를 통해 나 자신을 더 잘 이해하게 됐어요. 이게 최고의 선물이었어요.", name: "20대 여성 알알○○", date: "2026.01.03" },
  { star: 5, text: "재물 파트에서 좋은 시기가 가까이 왔다고 해줘서 열심히 준비 중이에요.", name: "30대 직장인 잘잘○○", date: "2026.01.02" },
  { star: 5, text: "홍연이 남겨준 서신을 지갑에 넣고 다녀요. 힘들 때마다 꺼내볼게요.", name: "20대 여성 찰찰○○", date: "2026.01.02" },
  { star: 5, text: "올 한 해 잘 부탁드립니다 홍연님. 덕분에 좋은 한 해가 될 것 같아요.", name: "30대 직장인 칼칼○○", date: "2026.01.01" },
  { star: 5, text: "새해에 사주 보는 게 이제 연간 루틴이 됐어요. 올해도 잘 살아볼게요.", name: "40대 직장인 탈탈○○", date: "2026.01.01" },
  { star: 5, text: "사주를 보고 나서 현재 상황을 받아들이게 됐어요. 흐름을 믿게 됐습니다.", name: "30대 직장인 팔팔○○", date: "2025.12.31" },
  { star: 5, text: "연말에 한 해를 정리하면서 봤어요. 내년 대운이 기대됩니다.", name: "30대 직장인 할할○○", date: "2025.12.31" },
  { star: 5, text: "대운 분석을 통해 내 인생의 타이밍을 이해하게 됐어요.", name: "40대 자영업자 감감○○", date: "2025.12.30" },
  { star: 5, text: "마무리 서신이 한 해를 정리하는 편지 같았어요. 감동이었습니다.", name: "30대 직장인 남남○○", date: "2025.12.30" },
  { star: 5, text: "사주를 통해 제 인생이 더 선명하게 보이기 시작했어요.", name: "20대 취준생 담담○○", date: "2025.12.29" },
  { star: 4, text: "내용이 정말 많아요. 그만큼 볼 게 많다는 뜻이에요. 만족합니다.", name: "40대 직장인 람람○○", date: "2025.12.29" },
  { star: 5, text: "재물운 파트가 정확해서 투자 시기를 잡는 데 도움이 됐어요.", name: "40대 투자자 맘맘○○", date: "2025.12.28" },
  { star: 5, text: "사주를 처음 봤는데 이렇게 정확한 줄 몰랐어요. 강력 추천합니다.", name: "30대 여성 밤밤○○", date: "2025.12.28" },
  { star: 5, text: "홍연 말투에 빠져들었어요. 고풍스럽고 따뜻한 문체가 너무 좋아요.", name: "20대 문학도 삼삼○○", date: "2025.12.27" },
  { star: 5, text: "제 강점과 약점을 이렇게 명확하게 알게 된 건 처음이에요.", name: "30대 직장인 암암○○", date: "2025.12.27" },
  { star: 5, text: "결혼 10주년에 봤어요. 배우자에 대한 이해가 깊어졌습니다.", name: "40대 기혼 잠잠○○", date: "2025.12.26" },
  { star: 5, text: "사주를 보고 나서 내 인생의 주인공이 나임을 다시 느꼈어요.", name: "30대 직장인 참참○○", date: "2025.12.26" },
  { star: 5, text: "개운법에서 추천한 음식이 실제로 좋아하는 음식이었어요. 신기해요.", name: "20대 여성 캄캄○○", date: "2025.12.25" },
  { star: 4, text: "크리스마스에 나 자신에게 선물로 사줬어요. 최고의 선물이었습니다.", name: "20대 여성 탐탐○○", date: "2025.12.25" },
  { star: 5, text: "홍연 덕분에 2025년을 잘 마무리할 수 있었어요. 감사합니다.", name: "30대 직장인 팜팜○○", date: "2025.12.24" },
  { star: 5, text: "사주를 보고 나서 나를 더 이해하게 됐어요. 자존감이 올라갔습니다.", name: "20대 여성 함함○○", date: "2025.12.24" },
  { star: 5, text: "직업 파트에서 내 천직이 뭔지 알게 됐어요. 지금 하는 일이 맞더라고요.", name: "30대 직장인 강강○○", date: "2025.12.23" },
  { star: 5, text: "인연운 파트가 희망을 줬어요. 좋은 만남을 기대하게 됐습니다.", name: "30대 싱글 낭낭○○", date: "2025.12.23" },
  { star: 5, text: "재물 파트와 건강 파트가 가장 정확했어요. 두 부분 다 실생활에 적용했어요.", name: "40대 자영업자 당당○○", date: "2025.12.22" },
  { star: 5, text: "홍연이 써준 마무리 서신을 읽고 2025년을 감사하게 마무리할 수 있었어요.", name: "30대 직장인 랑랑○○", date: "2025.12.22" },
  { star: 5, text: "사주를 보고 나서 나의 오행 균형을 의식하게 됐어요. 챙기려고 노력 중이에요.", name: "30대 건강 관심 망망○○", date: "2025.12.21" },
  { star: 5, text: "처음엔 호기심으로 봤는데 이제는 인생의 지침서처럼 느껴져요.", name: "40대 직장인 방방○○", date: "2025.12.21" },
  { star: 5, text: "용신 오행에 맞는 색깔 소품을 하나씩 모으기 시작했어요.", name: "20대 여성 상상○○", date: "2025.12.20" },
  { star: 4, text: "사주가 이렇게 따뜻하고 구체적일 수 있다는 게 놀라웠어요.", name: "30대 직장인 앙앙○○", date: "2025.12.20" },
  { star: 5, text: "부모님과 함께 봤어요. 가족의 사주를 이해하니 관계가 더 편안해졌어요.", name: "30대 자녀 장장○○", date: "2025.12.19" },
  { star: 5, text: "제 사주를 알게 된 후로 삶의 태도가 바뀌었어요. 더 여유로워졌습니다.", name: "40대 직장인 창창○○", date: "2025.12.19" },
  { star: 5, text: "사주를 보고 나서 지금 어려운 상황이 일시적임을 알게 됐어요.", name: "30대 직장인 캉캉○○", date: "2025.12.18" },
  { star: 5, text: "개운법 실천 넉 달이 지났어요. 확실히 긍정적인 변화가 느껴져요.", name: "30대 직장인 탕탕○○", date: "2025.12.18" },
  { star: 5, text: "건강 주의 시기를 알고 미리 건강 관리를 강화했어요. 덕분에 건강해졌어요.", name: "50대 주부 팡팡○○", date: "2025.12.17" },
  { star: 5, text: "홍연이 남긴 편지가 제 마음에 오래 남았어요. 진심이 느껴졌습니다.", name: "30대 여성 항항○○", date: "2025.12.17" },
  { star: 5, text: "대운이 바뀌는 해에 이직을 결정했는데 잘 됐어요. 사주 덕분이에요.", name: "40대 직장인 개개○○", date: "2025.12.16" },
  { star: 5, text: "사주를 보고 나서 내 강점을 살리는 방향으로 커리어를 잡았어요.", name: "30대 직장인 내내○○", date: "2025.12.16" },
  { star: 5, text: "친구 생일에 이 서비스를 선물해줬어요. 최고의 선물이 됐습니다.", name: "30대 여성 대대○○", date: "2025.12.15" },
  { star: 4, text: "사주를 논리적으로 풀어줘서 이해하기 쉬웠어요. 납득이 됐습니다.", name: "40대 직장인 래래○○", date: "2025.12.15" },
  { star: 5, text: "오행 균형이 내 몸 상태와 연결된다는 게 흥미로웠어요. 챙겨보게 됩니다.", name: "30대 건강 관심 매매○○", date: "2025.12.14" },
  { star: 5, text: "사주를 보고 나서 지금 힘든 이유를 알게 됐어요. 버텨낼 수 있어요.", name: "20대 취준생 배배○○", date: "2025.12.14" },
  { star: 5, text: "홍연 덕분에 내 인생을 더 아끼고 사랑하게 됐어요.", name: "30대 직장인 새새○○", date: "2025.12.13" },
  { star: 5, text: "결과지를 몇 번이고 다시 읽었어요. 볼 때마다 새로운 게 보여요.", name: "40대 주부 애애○○", date: "2025.12.13" },
  { star: 5, text: "사주를 처음 봤는데 너무 만족스러워서 주변에 다 추천했어요.", name: "30대 직장인 재재○○", date: "2025.12.12" },
  { star: 5, text: "인생의 큰 그림을 이해하게 됐어요. 지금 어디쯤 있는지 알게 됐습니다.", name: "30대 여성 채채○○", date: "2025.12.12" },
  { star: 5, text: "재물운이 오는 시기를 알게 됐어요. 그 때를 위해 지금 씨앗을 심고 있어요.", name: "30대 직장인 캐캐○○", date: "2025.12.11" },
  { star: 5, text: "마무리 서신이 제 마음을 치유해줬어요. 따뜻한 위로였습니다.", name: "20대 여성 태태○○", date: "2025.12.11" },
  { star: 4, text: "내용이 너무 많아서 두 번에 나눠 읽었어요. 그만큼 알찬 내용이었습니다.", name: "50대 직장인 패패○○", date: "2025.12.10" },
  { star: 5, text: "사주를 보고 나서 내 인생의 주인공이 된 느낌이에요.", name: "30대 직장인 해해○○", date: "2025.12.10" },
  { star: 5, text: "대운 흐름을 알고 나서 무리하지 않게 됐어요. 때를 기다리게 됐습니다.", name: "40대 자영업자 걔걔○○", date: "2025.12.09" },
  { star: 5, text: "홍연이 쓴 서신을 캡처해서 휴대폰 배경으로 설정했어요.", name: "20대 여성 냬냬○○", date: "2025.12.09" },
  { star: 5, text: "건강 파트에서 주의할 내장 기관이 맞아서 관련 음식을 챙겨먹고 있어요.", name: "40대 주부 댜댜○○", date: "2025.12.08" },
  { star: 5, text: "사주를 보고 나서 내 삶에 감사하게 됐어요. 이미 많이 가지고 있었네요.", name: "30대 직장인 랴랴○○", date: "2025.12.08" },
  { star: 5, text: "직업 파트에서 내 천직 환경을 알게 됐어요. 이직 방향이 잡혔습니다.", name: "30대 직장인 먀먀○○", date: "2025.12.07" },
  { star: 5, text: "사주가 이렇게 실용적일 줄 몰랐어요. 개운법이 진짜 도움이 됩니다.", name: "20대 여성 뱌뱌○○", date: "2025.12.07" },
  { star: 5, text: "인연 파트가 설레게 만들었어요. 좋은 인연이 오기를 기대하며 준비할게요.", name: "30대 싱글 샤샤○○", date: "2025.12.06" },
  { star: 5, text: "홍연 덕분에 나 자신을 더 잘 알게 됐어요. 이게 가장 큰 수확이었습니다.", name: "40대 직장인 야야○○", date: "2025.12.06" },
  { star: 4, text: "처음엔 반신반의했는데 내용이 너무 맞아서 생각이 바뀌었어요.", name: "30대 회의론자 쟈쟈○○", date: "2025.12.05" },
  { star: 5, text: "재물 파트가 너무 정확해서 소름이 돋았어요. 재물운 사이클이 딱 맞아요.", name: "40대 사업가 챠챠○○", date: "2025.12.05" },
  { star: 5, text: "사주를 보고 나서 내 삶에 더 집중하게 됐어요. 남의 눈치를 덜 보게 됐어요.", name: "30대 직장인 탸탸○○", date: "2025.12.04" },
  { star: 5, text: "개운법 실천으로 생활 습관이 건강해졌어요. 몸도 마음도 좋아지고 있어요.", name: "30대 직장인 퍄퍄○○", date: "2025.12.04" },
  { star: 5, text: "결혼을 고민하면서 봤는데 내 인연의 시기를 알게 됐어요. 기다려볼게요.", name: "30대 싱글 햐햐○○", date: "2025.12.03" },
  { star: 5, text: "사주를 보고 나서 내가 가진 것들이 얼마나 소중한지 깨달았어요.", name: "40대 주부 고고○○", date: "2025.12.03" },
  { star: 5, text: "대운 흐름 분석이 제 인생 타임라인과 너무 잘 맞아서 신기했어요.", name: "30대 직장인 노노○○", date: "2025.12.02" },
  { star: 5, text: "홍연이 남긴 말이 힘든 시기에 큰 버팀목이 됐어요. 감사합니다.", name: "20대 취준생 도도○○", date: "2025.12.02" },
  { star: 5, text: "기질 분석이 제 성격을 너무 잘 설명해줘서 가족들한테 보여줬어요.", name: "30대 직장인 로로○○", date: "2025.12.01" },
  { star: 4, text: "처음엔 어색했는데 읽다 보니 홍연 말투가 너무 매력 있더라고요.", name: "20대 여성 모모○○", date: "2025.12.01" },
  { star: 5, text: "올해 힘든 시기가 대운 교체기였다는 걸 알게 되니 이해가 됐어요.", name: "30대 직장인 보보○○", date: "2025.11.30" },
  { star: 5, text: "사주를 통해 내 삶의 사이클을 이해하게 됐어요. 준비하면서 기다릴게요.", name: "40대 직장인 소소○○", date: "2025.11.30" },
  { star: 5, text: "재물 파트에서 조심할 시기를 알게 돼서 큰 지출을 미뤘어요. 잘한 선택이에요.", name: "40대 주부 오오○○", date: "2025.11.29" },
  { star: 5, text: "홍연 서신이 딱 내가 듣고 싶었던 말이었어요. 눈물이 났습니다.", name: "30대 여성 조조○○", date: "2025.11.29" },
  { star: 5, text: "사주를 보고 나서 내 삶의 방향이 더 선명해졌어요. 자신감이 생겼어요.", name: "20대 취준생 초초○○", date: "2025.11.28" },
  { star: 5, text: "개운법을 꾸준히 실천 중이에요. 삶이 조금씩 나아지고 있다는 느낌이에요.", name: "30대 직장인 코코○○", date: "2025.11.28" },
  { star: 5, text: "대운이 바뀌는 시기에 맞춰 새로운 도전을 했어요. 잘 되고 있습니다.", name: "30대 직장인 토토○○", date: "2025.11.27" },
  { star: 4, text: "사주가 이렇게 따뜻하게 쓰일 수 있다는 걸 처음 알았어요.", name: "40대 직장인 포포○○", date: "2025.11.27" },
  { star: 5, text: "건강 파트에서 챙겨야 할 부위를 미리 알게 돼서 예방 관리를 하고 있어요.", name: "50대 주부 호호○○", date: "2025.11.26" },
  { star: 5, text: "사주를 보고 나서 나 자신에게 더 관대해졌어요. 내 한계를 인정하게 됐어요.", name: "30대 직장인 구구○○", date: "2025.11.26" },
  { star: 5, text: "인연 파트가 너무 설렜어요. 그 시기를 기다리며 더 성장할게요.", name: "20대 싱글 누누○○", date: "2025.11.25" },
  { star: 5, text: "홍연 덕분에 제 삶이 더 풍요로워진 느낌이에요. 진심으로 감사합니다.", name: "40대 주부 두두○○", date: "2025.11.25" },
  { star: 5, text: "사주를 보고 내 타고난 기질을 살리는 방향으로 살기로 했어요.", name: "30대 직장인 루루○○", date: "2025.11.24" },
  { star: 5, text: "재물운 사이클을 알고 나서 지출 계획을 세우게 됐어요. 실질적인 도움이에요.", name: "30대 직장인 무무○○", date: "2025.11.24" },
  { star: 5, text: "결혼 후 첫 사주였는데 배우자 관련 파트가 너무 맞아서 놀랐어요.", name: "30대 기혼 부부○○", date: "2025.11.23" },
  { star: 4, text: "내용이 방대하지만 그만큼 볼 게 많아서 좋아요. 만족합니다.", name: "40대 직장인 수수○○", date: "2025.11.23" },
  { star: 5, text: "사주를 통해 나를 더 깊이 이해하게 됐어요. 삶의 질이 높아진 느낌이에요.", name: "30대 여성 우우○○", date: "2025.11.22" },
  { star: 5, text: "홍연의 고풍스러운 문체가 사주의 신뢰감을 더해줬어요.", name: "30대 독서가 주주○○", date: "2025.11.22" },
  { star: 5, text: "삼재 시기를 알게 돼서 그 기간에 조심할 준비를 하고 있어요.", name: "40대 직장인 추추○○", date: "2025.11.21" },
  { star: 5, text: "용신 오행 실천이 점점 자연스러워지고 있어요. 삶이 달라지는 중이에요.", name: "30대 직장인 쿠쿠○○", date: "2025.11.21" },
  { star: 5, text: "사주를 보고 나서 내 인생에 더 감사하게 됐어요. 있는 것에 집중하게 됩니다.", name: "20대 여성 투투○○", date: "2025.11.20" },
  { star: 5, text: "홍연 덕분에 나 자신을 알게 됐고, 알게 되니 더 잘 살고 싶어졌어요.", name: "30대 직장인 푸푸○○", date: "2025.11.20" },
  { star: 5, text: "마무리 서신이 제 마음의 빈자리를 채워줬어요. 따뜻한 경험이었습니다.", name: "30대 여성 후후○○", date: "2025.11.19" },
  { star: 5, text: "사주를 보고 나서 인생의 큰 그림이 보였어요. 앞으로가 기대됩니다.", name: "40대 직장인 그그○○", date: "2025.11.19" },
  { star: 4, text: "가격 대비 내용이 정말 알차요. 이 가격에 이 퀄리티 최고예요.", name: "30대 직장인 느느○○", date: "2025.11.18" },
  { star: 5, text: "대운 흐름을 알고 나서 미래가 덜 불안해졌어요. 준비하면 된다는 확신이에요.", name: "30대 직장인 드드○○", date: "2025.11.18" },
  { star: 5, text: "연인과의 관계가 사주로 설명됐어요. 서로 오행이 달라서 그랬군요.", name: "20대 커플 르르○○", date: "2025.11.17" },
  { star: 5, text: "직업 파트에서 제 적성 환경이 딱 맞아서 현재 직장에 확신이 생겼어요.", name: "30대 직장인 므므○○", date: "2025.11.17" },
  { star: 5, text: "사주를 보고 나서 조급함이 사라졌어요. 내 때가 있다는 걸 믿게 됐습니다.", name: "30대 직장인 브브○○", date: "2025.11.16" },
  { star: 5, text: "홍연이 남긴 서신이 오래 기억에 남을 것 같아요. 진심이 느껴졌어요.", name: "20대 여성 스스○○", date: "2025.11.16" },
  { star: 5, text: "건강 파트와 재물 파트가 제일 정확했어요. 두 파트 다 실천하고 있어요.", name: "40대 주부 으으○○", date: "2025.11.15" },
  { star: 5, text: "사주를 통해 내 인생의 의미를 다시 발견했어요. 귀한 시간이었습니다.", name: "30대 직장인 즈즈○○", date: "2025.11.15" },
  { star: 5, text: "대운 교체기에 준비를 잘 했더니 변화가 덜 힘들었어요.", name: "40대 직장인 크크○○", date: "2025.11.14" },
  { star: 4, text: "이렇게 따뜻한 사주 풀이는 처음이에요. 다음에 또 올게요.", name: "30대 직장인 트트○○", date: "2025.11.14" },
  { star: 5, text: "인생에서 반복됐던 패턴의 원인을 알게 됐어요. 이제는 바꿀 자신이 있어요.", name: "30대 직장인 프프○○", date: "2025.11.13" },
  { star: 5, text: "사주를 보고 나서 더 나은 사람이 되고 싶어졌어요. 좋은 동기 부여가 됐어요.", name: "20대 여성 흐흐○○", date: "2025.11.13" },
  { star: 5, text: "재물운과 인연운이 동시에 좋아지는 시기를 알게 됐어요. 그 때를 기다려요.", name: "30대 직장인 기기○○", date: "2025.11.12" },
  { star: 5, text: "홍연 덕분에 제 삶의 이야기를 다시 쓰게 됐어요. 앞으로가 기대됩니다.", name: "30대 여성 니니○○", date: "2025.11.12" },
  { star: 5, text: "사주를 보고 나서 내가 충분히 잘 살아왔다는 걸 알게 됐어요.", name: "40대 직장인 디디○○", date: "2025.11.11" },
  { star: 5, text: "개운법 실천이 어렵지 않아요. 일상에서 자연스럽게 할 수 있어요.", name: "30대 직장인 리리○○", date: "2025.11.11" },
  { star: 4, text: "사주를 처음 봤는데 이렇게 정확한 줄 몰랐어요. 다음에 또 볼게요.", name: "20대 대학생 미미○○", date: "2025.11.10" },
  { star: 5, text: "올해 힘들었는데 지금이 전환점이라는 말이 버팀목이 됐어요.", name: "30대 직장인 비비○○", date: "2025.11.10" },
  { star: 5, text: "사주를 통해 내 삶을 더 사랑하게 됐어요. 나를 응원하게 됐습니다.", name: "30대 여성 시시○○", date: "2025.11.09" },
  { star: 5, text: "결과지를 보고 나서 올해 계획이 생겼어요. 목표가 생기니 삶이 달라졌어요.", name: "20대 취준생 이이○○", date: "2025.11.09" },
  { star: 5, text: "홍연이 쓴 편지가 내 마음속에 오래 남을 것 같아요. 감사합니다.", name: "30대 직장인 지지○○", date: "2025.11.08" },
  { star: 5, text: "사주를 보고 나서 내 강점을 더 자신 있게 사용하게 됐어요.", name: "40대 직장인 치치○○", date: "2025.11.08" },
  { star: 5, text: "대운 흐름이 정확해서 앞으로의 계획을 세우는 데 도움이 됐어요.", name: "30대 직장인 키키○○", date: "2025.11.07" },
  { star: 5, text: "마무리 서신이 제게 꼭 필요한 위로였어요. 읽고 나서 눈물이 났습니다.", name: "20대 여성 티티○○", date: "2025.11.07" },
  { star: 5, text: "사주를 통해 나 자신을 더 깊이 이해하게 됐어요. 삶이 더 풍요로워졌어요.", name: "30대 직장인 피피○○", date: "2025.11.06" },
  { star: 4, text: "내용이 정말 상세하고 알차요. 이 가격에 이 정도면 완전 가성비예요.", name: "40대 주부 히히○○", date: "2025.11.06" },
  { star: 5, text: "사주를 보고 나서 내 인생이 더 의미 있게 느껴졌어요. 추천합니다.", name: "30대 직장인 깅깅○○", date: "2025.11.05" },
  { star: 5, text: "용신 오행 실천 다섯 달째예요. 삶에 긍정적인 변화가 생겼어요.", name: "30대 직장인 닝닝○○", date: "2025.11.05" },
  { star: 5, text: "대운 교체기를 미리 알아서 이직 준비를 했어요. 좋은 결과가 나왔어요.", name: "30대 직장인 딩딩○○", date: "2025.11.04" },
  { star: 5, text: "홍연 서신이 내 마음을 다 읽은 것 같았어요. 소름 돋았습니다.", name: "20대 여성 링링○○", date: "2025.11.04" },
  { star: 5, text: "재물운 파트가 가장 도움이 됐어요. 언제 움직이면 좋을지 알게 됐어요.", name: "40대 투자자 밍밍○○", date: "2025.11.03" },
  { star: 5, text: "사주를 보고 나서 내 기질을 살리는 직업을 고민하게 됐어요.", name: "20대 취준생 빙빙○○", date: "2025.11.03" },
  { star: 5, text: "건강 파트에서 챙겨야 할 부위가 정확해서 관련 운동을 시작했어요.", name: "40대 직장인 싱싱○○", date: "2025.11.02" },
  { star: 5, text: "마무리 서신을 읽고 오래 여운이 남았어요. 따뜻한 경험이었습니다.", name: "30대 직장인 잉잉○○", date: "2025.11.02" },
  { star: 4, text: "사주를 믿지 않았는데 내용이 맞아서 생각이 바뀌었어요.", name: "30대 남성 징징○○", date: "2025.11.01" },
  { star: 5, text: "사주를 보고 나서 남은 올해를 더 알차게 보내고 싶어졌어요.", name: "30대 직장인 칭칭○○", date: "2025.11.01" },
  { star: 5, text: "홍연 덕분에 제 삶이 더 풍요로워졌어요. 감사합니다 홍연님.", name: "20대 여성 킹킹○○", date: "2025.10.31" },
  { star: 5, text: "인연운 파트가 희망을 줬어요. 좋은 인연이 올 시기를 기대하고 있어요.", name: "30대 싱글 팅팅○○", date: "2025.10.31" },
  { star: 5, text: "사주를 통해 내 인생의 큰 흐름을 이해하게 됐어요. 마음이 편해졌습니다.", name: "40대 직장인 핑핑○○", date: "2025.10.30" },
  { star: 5, text: "결과지를 여러 번 읽었어요. 읽을수록 더 많은 걸 발견하게 돼요.", name: "30대 독서가 힝힝○○", date: "2025.10.30" },
  { star: 5, text: "사주를 보고 나서 내 삶을 더 아끼게 됐어요. 나를 응원합니다.", name: "30대 여성 긱긱○○", date: "2025.10.29" },
  { star: 5, text: "개운법 실천이 일상이 됐어요. 뭔가 달라지고 있다는 게 느껴져요.", name: "30대 직장인 닉닉○○", date: "2025.10.29" },
  { star: 5, text: "대운 흐름을 알고 나서 더 여유 있게 살게 됐어요. 때가 있다는 걸 믿어요.", name: "40대 직장인 딕딕○○", date: "2025.10.28" },
  { star: 5, text: "홍연 말투가 처음엔 낯설었는데 이제는 너무 자연스럽고 좋아요.", name: "20대 대학생 릭릭○○", date: "2025.10.28" },
  { star: 4, text: "내용이 길어서 나눠서 읽었어요. 다 읽고 나니 충분히 가치 있었어요.", name: "30대 직장인 믹믹○○", date: "2025.10.27" },
  { star: 5, text: "재물 파트에서 조심할 시기를 알게 됐어요. 큰 지출을 미루게 됐습니다.", name: "40대 주부 빅빅○○", date: "2025.10.27" },
  { star: 5, text: "사주를 보고 나서 내 삶의 의미를 다시 발견했어요. 귀한 경험이에요.", name: "30대 직장인 식식○○", date: "2025.10.26" },
  { star: 5, text: "마무리 서신이 딱 내가 듣고 싶었던 말이었어요. 감동이에요.", name: "20대 여성 익익○○", date: "2025.10.26" },
  { star: 5, text: "사주가 이렇게 실용적일 줄 몰랐어요. 개운법이 특히 도움이 됩니다.", name: "30대 직장인 직직○○", date: "2025.10.25" },
  { star: 5, text: "홍연 덕분에 나 자신을 더 잘 알게 됐어요. 최고의 경험이었습니다.", name: "40대 직장인 칙칙○○", date: "2025.10.25" },
  { star: 5, text: "건강 파트가 정확해서 바로 생활 습관 교정에 나섰어요.", name: "50대 주부 킥킥○○", date: "2025.10.24" },
  { star: 5, text: "인연 파트가 설레요. 그 시기를 위해 지금 더 성장할게요.", name: "30대 싱글 틱틱○○", date: "2025.10.24" },
  { star: 5, text: "사주를 보고 나서 나 자신에게 더 친절해졌어요.", name: "30대 직장인 픽픽○○", date: "2025.10.23" },
  { star: 4, text: "사주를 처음 봤는데 완전히 만족스러웠어요. 또 올게요.", name: "20대 여성 힉힉○○", date: "2025.10.23" },
  { star: 5, text: "대운 교체기를 준비했더니 변화가 덜 무서웠어요. 감사합니다 홍연.", name: "40대 직장인 갈갈갈○○", date: "2025.10.22" },
  { star: 5, text: "재물운 사이클을 알고 나서 재정 계획을 세우게 됐어요.", name: "30대 직장인 날날날○○", date: "2025.10.22" },
  { star: 5, text: "기질 분석이 너무 정확해서 가족들한테 자랑하게 됐어요.", name: "30대 직장인 달달달○○", date: "2025.10.21" },
  { star: 5, text: "홍연 서신이 진짜 편지 같았어요. 마음이 따뜻해졌습니다.", name: "20대 여성 말말말○○", date: "2025.10.21" },
  { star: 5, text: "사주를 통해 내 인생의 타이밍을 이해하게 됐어요. 조급함이 사라졌어요.", name: "30대 직장인 발발발○○", date: "2025.10.20" },
  { star: 5, text: "개운법 실천 여섯 달째예요. 삶에 확실한 변화가 생겼어요.", name: "40대 주부 살살살○○", date: "2025.10.20" },
  { star: 4, text: "내용이 너무 많아서 압도됐지만 그만큼 알차서 만족해요.", name: "30대 직장인 알알알○○", date: "2025.10.19" },
  { star: 5, text: "사주를 보고 나서 내 삶에 자신감이 생겼어요. 잘 될 이유가 있어요.", name: "20대 취준생 잘잘잘○○", date: "2025.10.19" },
  { star: 5, text: "건강 파트에서 미리 알게 된 덕분에 큰 병을 예방했어요. 감사해요.", name: "50대 주부 찰찰찰○○", date: "2025.10.18" },
  { star: 5, text: "홍연 덕분에 나를 더 잘 이해하게 됐어요. 이게 가장 큰 선물이에요.", name: "30대 직장인 탈탈탈○○", date: "2025.10.18" },
  { star: 5, text: "인연이 오는 시기를 알게 됐어요. 그 시기에 더 열린 마음으로 지낼게요.", name: "30대 싱글 팔팔팔○○", date: "2025.10.17" },
  { star: 5, text: "사주를 보고 내 강점을 다시 확인하게 됐어요. 자존감이 올라갔어요.", name: "20대 여성 할할할○○", date: "2025.10.17" },
  { star: 5, text: "마무리 서신을 읽고 눈물이 났어요. 오래 마음에 남을 것 같아요.", name: "30대 여성 감감감○○", date: "2025.10.16" },
  { star: 5, text: "사주를 통해 내 삶의 패턴을 이해하게 됐어요. 이제는 바꿀 수 있을 것 같아요.", name: "40대 직장인 남남남○○", date: "2025.10.16" },
  { star: 4, text: "처음엔 반신반의했는데 내용이 너무 맞아서 다 읽게 됐어요.", name: "30대 회의론자 담담담○○", date: "2025.10.15" },
  { star: 5, text: "재물 파트에서 좋은 시기가 가까이 왔다고 해줘서 열심히 준비 중이에요.", name: "30대 직장인 람람람○○", date: "2025.10.15" },
  { star: 5, text: "홍연 말투가 사주에 신뢰감을 더해줘요. 무게감이 있어요.", name: "30대 독자 맘맘맘○○", date: "2025.10.14" },
  { star: 5, text: "사주를 보고 나서 더 나은 사람이 되고 싶어졌어요. 좋은 동기가 됐어요.", name: "20대 여성 밤밤밤○○", date: "2025.10.14" },
  { star: 5, text: "대운 흐름이 인생 타임라인과 딱 맞아서 신기하고 믿게 됐어요.", name: "40대 직장인 삼삼삼○○", date: "2025.10.13" },
  { star: 5, text: "홍연 덕분에 내 삶의 이야기를 다시 쓰게 됐어요. 앞으로가 기대됩니다.", name: "30대 여성 암암암○○", date: "2025.10.13" },
  { star: 5, text: "사주를 보고 나서 나 자신을 응원하게 됐어요. 내 시기가 온다는 걸 믿어요.", name: "20대 취준생 잠잠잠○○", date: "2025.10.12" },
  { star: 5, text: "개운법을 꾸준히 실천 중이에요. 뭔가 달라지고 있다는 게 느껴져요.", name: "30대 직장인 참참참○○", date: "2025.10.12" },
  { star: 5, text: "사주가 이렇게 따뜻하고 실용적인 도구가 될 수 있다니 감동이에요.", name: "40대 주부 캄캄캄○○", date: "2025.10.11" },
  { star: 4, text: "내용이 상당히 방대하지만 모두 필요한 내용이었어요.", name: "30대 직장인 탐탐탐○○", date: "2025.10.11" },
  { star: 5, text: "건강 파트가 너무 정확해요. 챙겨야 할 부위를 알게 됐습니다.", name: "50대 주부 팜팜팜○○", date: "2025.10.10" },
  { star: 5, text: "사주를 보고 나서 내 인생에 더 감사하게 됐어요. 있는 것에 집중할게요.", name: "30대 직장인 함함함○○", date: "2025.10.10" },
  { star: 5, text: "홍연이 남긴 편지가 진심으로 느껴졌어요. 오래 간직할게요.", name: "20대 여성 강강강○○", date: "2025.10.09" },
  { star: 5, text: "대운 교체기 준비를 잘 했더니 변화가 수월하게 이루어졌어요.", name: "40대 직장인 낭낭낭○○", date: "2025.10.09" },
  { star: 5, text: "사주를 통해 내 강점과 약점을 객관적으로 알게 됐어요.", name: "30대 직장인 당당당○○", date: "2025.10.08" },
  { star: 5, text: "재물운이 오는 시기를 알게 됐어요. 그 때를 위해 지금 씨앗을 심고 있어요.", name: "30대 직장인 랑랑랑○○", date: "2025.10.08" },
  { star: 5, text: "마무리 서신이 내 마음을 위로해줬어요. 읽고 나서 힘이 났습니다.", name: "20대 여성 망망망○○", date: "2025.10.07" },
  { star: 5, text: "사주를 처음 봤는데 완전히 만족스러웠어요. 매년 볼 것 같아요.", name: "30대 직장인 방방방○○", date: "2025.10.07" },
  { star: 4, text: "내용이 많아서 나눠서 읽었는데 다 좋은 내용이었어요.", name: "40대 직장인 상상상○○", date: "2025.10.06" },
  { star: 5, text: "홍연 덕분에 내 삶을 더 사랑하게 됐어요. 나를 응원합니다.", name: "30대 여성 앙앙앙○○", date: "2025.10.06" },
  { star: 5, text: "인연 파트가 너무 설렜어요. 좋은 만남을 기대하며 준비할게요.", name: "30대 싱글 장장장○○", date: "2025.10.05" },
  { star: 5, text: "사주를 보고 나서 내 삶의 방향이 잡혔어요. 자신감이 생겼습니다.", name: "20대 취준생 창창창○○", date: "2025.10.05" },
  { star: 5, text: "개운법에 나온 공간 방향으로 책상을 배치했어요. 집중력이 올라간 것 같아요.", name: "20대 대학생 캉캉캉○○", date: "2025.10.04" },
  { star: 5, text: "건강 파트가 실제 몸 상태와 너무 잘 맞아서 놀랐어요. 챙길게요.", name: "40대 주부 탕탕탕○○", date: "2025.10.04" },
  { star: 5, text: "사주를 보고 나서 더 여유 있게 살게 됐어요. 때를 믿게 됐습니다.", name: "30대 직장인 팡팡팡○○", date: "2025.10.03" },
  { star: 5, text: "홍연 서신이 딱 필요한 위로였어요. 오래 마음에 남을 것 같아요.", name: "20대 여성 항항항○○", date: "2025.10.03" },
  { star: 5, text: "재물운과 건강운 파트가 가장 도움이 됐어요. 둘 다 실천하고 있어요.", name: "50대 주부 개개개○○", date: "2025.10.02" },
  { star: 4, text: "사주를 처음 봤는데 이렇게 정확한 줄 몰랐어요. 강추합니다.", name: "30대 직장인 내내내○○", date: "2025.10.02" },
  { star: 5, text: "대운 흐름을 알게 된 후로 조급함이 없어졌어요. 내 때를 기다릴게요.", name: "30대 직장인 대대대○○", date: "2025.10.01" },
  { star: 5, text: "사주를 통해 나 자신을 더 잘 이해하게 됐어요. 이게 최고의 선물이에요.", name: "20대 여성 래래래○○", date: "2025.10.01" },
  { star: 5, text: "홍연 덕분에 내 인생을 더 아끼게 됐어요. 나를 소중히 여기게 됩니다.", name: "30대 직장인 매매매○○", date: "2025.09.30" },
  { star: 5, text: "마무리 서신이 제 마음을 다 알고 쓴 것 같았어요. 감동이에요.", name: "30대 여성 배배배○○", date: "2025.09.30" },
  { star: 5, text: "사주를 보고 나서 내 인생에 자신감이 생겼어요. 잘 될 거라는 믿음이 생겼어요.", name: "20대 취준생 새새새○○", date: "2025.09.29" },
  { star: 5, text: "개운법을 실천하면서 하루하루가 더 의미 있어지고 있어요.", name: "30대 직장인 애애애○○", date: "2025.09.29" },
  { star: 4, text: "처음엔 긴 내용이 부담스러웠는데 읽으면 읽을수록 빠져들었어요.", name: "30대 독서가 재재재○○", date: "2025.09.28" },
  { star: 5, text: "사주를 통해 내 삶의 의미를 다시 발견했어요. 앞으로가 기대됩니다.", name: "40대 직장인 채채채○○", date: "2025.09.28" },
  { star: 5, text: "결과지를 읽으면서 나에 대해 더 많이 알게 됐어요. 좋은 경험이에요.", name: "30대 직장인 캐캐캐○○", date: "2025.09.27" },
  { star: 5, text: "홍연이 쓴 편지가 제 마음속에 오래 남을 것 같아요. 감사합니다.", name: "20대 여성 태태태○○", date: "2025.09.27" },
  { star: 5, text: "사주를 보고 나서 더 나은 사람이 되고 싶어졌어요. 동기 부여가 됐어요.", name: "30대 직장인 패패패○○", date: "2025.09.26" },
  { star: 5, text: "건강 파트와 재물 파트가 실생활에 가장 도움이 됐어요.", name: "40대 주부 해해해○○", date: "2025.09.26" },
  { star: 5, text: "사주를 보고 나서 나 자신을 더 사랑하게 됐어요. 나를 응원합니다.", name: "30대 여성 걔걔걔○○", date: "2025.09.25" },
  { star: 5, text: "인연운 파트가 희망을 줬어요. 좋은 만남이 올 시기를 기다릴게요.", name: "30대 싱글 냬냬냬○○", date: "2025.09.25" },
  { star: 5, text: "매년 보는 루틴이 됐어요. 올해도 방향을 잡아준 홍연에게 감사해요.", name: "40대 직장인 댜댜댜○○", date: "2025.09.24" },
  { star: 4, text: "내용이 상당히 많지만 모두 의미 있는 내용이었어요. 만족합니다.", name: "30대 직장인 랴랴랴○○", date: "2025.09.24" },
  { star: 5, text: "사주를 보고 나서 내 삶의 사이클을 이해하게 됐어요. 마음이 편해졌습니다.", name: "30대 직장인 먀먀먀○○", date: "2025.09.23" },
  { star: 5, text: "홍연 덕분에 제 삶이 더 선명해졌어요. 진심으로 감사합니다.", name: "20대 여성 뱌뱌뱌○○", date: "2025.09.23" },
  { star: 5, text: "재물운 파트에서 조심할 시기를 알게 됐어요. 큰 지출을 미루게 됐습니다.", name: "40대 직장인 샤샤샤○○", date: "2025.09.22" },
  { star: 5, text: "사주를 처음 봤는데 너무 정확해서 두 번 읽었어요. 정말 좋아요.", name: "30대 직장인 야야야○○", date: "2025.09.22" },
  { star: 5, text: "마무리 서신이 내 마음을 정확하게 짚어줬어요. 오랫동안 기억할게요.", name: "20대 여성 쟈쟈쟈○○", date: "2025.09.21" },
  { star: 5, text: "개운법을 실천한 지 일 년이 됐어요. 삶이 확실히 달라졌습니다.", name: "30대 직장인 챠챠챠○○", date: "2025.09.21" },
  { star: 5, text: "사주를 통해 나를 더 깊이 이해하게 됐어요. 삶의 질이 높아졌어요.", name: "40대 직장인 탸탸탸○○", date: "2025.09.20" },
  { star: 5, text: "홍연이 남긴 말이 힘든 시기에 버팀목이 됐어요. 진심으로 감사합니다.", name: "30대 직장인 퍄퍄퍄○○", date: "2025.09.20" },
  { star: 4, text: "사주를 통해 나 자신을 더 잘 알게 됐어요. 좋은 도구예요.", name: "20대 여성 햐햐햐○○", date: "2025.09.19" },
  { star: 5, text: "대운 분석이 제 인생과 너무 잘 맞아서 놀랐어요. 강력 추천합니다.", name: "40대 자영업자 고고고○○", date: "2025.09.19" },
  { star: 5, text: "사주를 보고 나서 내 삶에 자신감이 생겼어요. 잘 될 거라 믿게 됐어요.", name: "30대 직장인 노노노○○", date: "2025.09.18" },
  { star: 5, text: "홍연 덕분에 나 자신을 사랑하게 됐어요. 나를 더 소중히 여기게 됩니다.", name: "20대 여성 도도도○○", date: "2025.09.18" },
  { star: 5, text: "재물 파트가 너무 정확해서 투자 시기를 잡는 데 큰 도움이 됐어요.", name: "40대 투자자 로로로○○", date: "2025.09.17" },
  { star: 5, text: "건강 파트에서 알게 된 덕분에 조기 검진을 받아 문제를 발견했어요.", name: "50대 주부 모모모○○", date: "2025.09.17" },
  { star: 5, text: "사주를 보고 나서 내 타고난 기질을 인정하게 됐어요. 살리는 방향으로 살게요.", name: "30대 직장인 보보보○○", date: "2025.09.16" },
  { star: 5, text: "마무리 서신을 읽고 위로를 받았어요. 내가 혼자가 아니라는 걸 느꼈습니다.", name: "20대 여성 소소소○○", date: "2025.09.16" },
  { star: 5, text: "사주를 처음 봤는데 이렇게 감동적인 경험이 될 줄 몰랐어요.", name: "30대 직장인 오오오○○", date: "2025.09.15" },
  { star: 4, text: "내용이 방대하지만 읽다 보면 다 필요한 내용이라는 걸 알게 돼요.", name: "40대 직장인 조조조○○", date: "2025.09.15" },
  { star: 5, text: "홍연 덕분에 내 인생의 방향이 잡혔어요. 진심으로 감사합니다.", name: "30대 직장인 초초초○○", date: "2025.09.14" },
  { star: 5, text: "인연 파트가 설레게 만들었어요. 좋은 만남을 준비할게요.", name: "30대 싱글 코코코○○", date: "2025.09.14" },
  { star: 5, text: "사주를 보고 나서 내 삶이 더 의미 있게 느껴졌어요. 추천합니다.", name: "20대 여성 토토토○○", date: "2025.09.13" },
  { star: 5, text: "개운법이 가장 실용적이었어요. 바로 실천할 수 있는 내용들이라 좋았어요.", name: "30대 직장인 포포포○○", date: "2025.09.13" },
  { star: 5, text: "홍연이 쓴 편지를 읽고 2025년을 감사하게 시작할 수 있었어요.", name: "30대 직장인 호호호○○", date: "2025.09.12" },
  { star: 5, text: "사주를 보고 나서 나 자신을 더 잘 이해하게 됐어요. 이게 가장 큰 수확이에요.", name: "40대 주부 구구구○○", date: "2025.09.12" },
];

const REVIEWS_PER_PAGE = 5;

// 기준일 2026-07-04, 기준 개수 591개
// 이후 매일 seed 기반 3~8개 자동 누적
function getTotalReviewCount(): number {
  const BASE_DATE = new Date("2026-07-04");
  const BASE_COUNT = 591;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  BASE_DATE.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return BASE_COUNT;
  let total = BASE_COUNT;
  for (let d = 1; d <= days; d++) {
    total += (d * 31 + 7) % 6 + 3; // 3~8개
  }
  return total;
}

// 후기 텍스트 풀 (카테고리별)
const R_SHORT = [
  "오 좋아요", "좋네요", "만족해요", "생각보다 좋아요", "꽤 정확해요",
  "잘 맞네요", "오 신기하다", "나쁘지 않아요", "굿굿", "별점 그냥 5점",
  "재밌게 봤어요", "좋았어요", "오 이거 맞다..?", "생각보다 볼게 많네요", "만족",
  "좋아요~", "오케이 굿", "ㄷㄷ 맞네", "짧게 보려했는데 다 읽었어요", "정확하네요",
  "오 생각보다 자세하다", "나름 좋아요", "볼만해요", "괜찮아요", "한번쯤 볼만함",
  "뭔가 맞는 느낌", "신기하네요", "오 ㄹㅇ네", "읽기 편했어요", "좋은 경험이었어요",
];
const R_FUNNY = [
  "ㅋㅋㅋ별기대안했는데 엄청 정확하네요 와이프꺼도 결제했어요 ㅋㅋㅋㅋㅋ",
  "반신반의하며 봤는데 ㅋㅋㅋ 맞는게 너무 많아서 당황했어요 ㅋㅋ",
  "ㅋㅋ어머니한테 선물로 결제해드렸는데 딱 맞다고 놀라셨어요 ㅋㅋㅋ",
  "친구랑 같이 보면서 맞다맞다 했어요 ㅋㅋㅋㅋ 진짜 재밌었음",
  "ㅋㅋ 이거 사기아님? 왜이렇게 맞아 ㅋㅋㅋㅋ 남자친구꺼도 봤어요",
  "형이 억지로 시켜서 봤는데 ㅋㅋ 어 맞네 하면서 다 읽었습니다 ㅋㅋㅋ",
  "회사 동료랑 점심에 같이 봤는데 ㅋㅋ 둘다 맞아서 소름돋고 밥도 못먹음 ㅋㅋ",
];
const R_EMOTIONAL = [
  "요즘 너무 힘들었는데 마무리 편지 읽고 눈물이 났어요. 내 시기가 온다는 말이 오래 남을 것 같아요. 위로가 많이 됐습니다.",
  "이직 고민 때문에 지쳐있었는데 대운 흐름 보고 나서 마음이 좀 편해졌어요. 지금이 변화의 시기라는 게 딱 맞아서 신기했고, 그냥 나를 믿어봐야겠다고 생각했어요.",
  "결혼이 늦어지면서 자존감이 많이 떨어졌었는데 인연 파트 읽으면서 내 시기가 따로 있구나 싶었어요. 조급함이 좀 사라졌습니다. 감사해요.",
  "작년에 많이 힘들었어요. 그때 왜 그랬는지 이제야 이해가 됐어요. 마무리 편지에서 홍연이 해준 말이 마음에 오래 남았습니다. 고맙습니다 정말로.",
  "요즘 번아웃 왔었는데 결과지 읽으면서 잠깐 나를 돌아봤어요. 내가 어떤 사람인지, 뭘 힘들어하는지 정확히 짚어줘서 위로가 됐어요.",
  "부모님 병간호하면서 내 삶이 없어진 것 같았는데 내 사주 보면서 나도 좋은 시기가 온다는 걸 알게 됐어요. 버텨야겠다는 힘이 생겼어요.",
  "사업이 안 풀려서 자책을 많이 했는데 지금이 힘든 대운 시기라는 걸 알게 되니 오히려 마음이 편해졌어요. 내가 못난 게 아니었구나 싶었어요.",
  "이혼 후에 방황하던 중에 봤는데 마무리 편지 읽고 한참 울었어요. 다시 시작할 수 있겠다는 용기가 생겼습니다. 감사해요 홍연님.",
];
const R_SKEPTIC = [
  "뭔가 그냥 돈날린셈치고 봤는데 예상이상이었다.",
  "소름이다. 진짜로.",
  "사주 안 믿는 사람인데 맞는 게 너무 많아서 당황했어요.",
  "반신반의했는데 읽다보니 멈출 수가 없었어요. 어떻게 이렇게 아는 거죠?",
  "돈아깝다 생각했는데 솔직히 이 가격에 이 내용이면 기분 좋음.",
  "사주 처음 봤는데 AI가 이 정도 수준인 줄 몰랐어요. 소름.",
  "믿지 않으려고 했는데 자꾸 맞으니까 인정하게 됨.",
  "친구가 강추해서 울며겨자먹기로 봤는데 진짜 신기하다. 친구한테 감사 전화했어요.",
  "이런 거 믿는 사람이 아닌데 직업 파트 보고 소름돋아서 캡처해뒀어요.",
  "그냥 심심해서 봤는데 대운 분석이 너무 딱 맞아서 오히려 당황스러웠어요.",
];
const R_OTHER = [
  "딱히 뭐라 할 말은 없는데 그냥 만족해요.",
  "처음엔 어색했는데 홍연 말투 적응되니까 오히려 좋더라고요.",
  "엄마한테 선물해드렸더니 좋아하셨어요.",
  "생일 선물로 받았어요. 의미 있었어요.",
  "결과지 프린트해서 냉장고에 붙여뒀어요 ㅋ",
  "개운법은 진짜 바로 써먹을 수 있어서 좋아요.",
  "전체적으로 읽는 데 꽤 걸렸는데 충분히 그만한 가치 있었어요.",
];

const R_STAR1 = [
  "솔직히 별로였어요. 내용이 너무 일반적인 것 같아서 아쉬웠습니다.",
  "맞는 내용도 있긴 한데 전반적으로 제 상황이랑 달라서 아쉬웠어요.",
  "기대가 너무 컸나봐요. 그냥 그랬어요.",
  "환불하고 싶었는데 정책상 안 된다고 해서.. 아쉽네요.",
  "저한텐 안 맞았어요. 다른 분들은 좋다고 하는데 저는 잘 모르겠어요.",
];
const R_STAR3 = [
  "어떤 부분은 맞고 어떤 부분은 잘 모르겠어요. 전반적으로 평범했어요.",
  "내용이 많긴 한데 제 상황에 딱 맞는 느낌은 아니었어요. 그냥 보통이요.",
  "나쁘진 않은데 딱히 감동적이지도 않았어요.",
  "좀 더 구체적이었으면 좋겠어요. 전반적인 이야기가 많은 느낌.",
  "읽는 건 재밌었는데 실생활에 쓸 수 있을지 모르겠어요.",
  "반반이에요. 맞는 것도 있고 아닌 것도 있고.",
  "기대보다는 조금 아쉬웠어요. 그래도 나름 읽을 만 했어요.",
  "보통이에요. 특별히 좋다거나 나쁘다거나 하진 않아요.",
];
const R_STAR4 = [
  "전반적으로 만족했어요. 세부 내용 일부가 좀 더 구체적이었으면 했는데 아쉬워요.",
  "좋은데 가끔 너무 일반적인 표현이 있어서 4점이요.",
  "대부분 맞았어요. 근데 딱 하나 틀렸는데 그게 좀 아쉬웠어요.",
  "만족스러워요. 다만 내용이 너무 많아서 읽는 데 좀 걸렸어요.",
  "좋아요. 별점 하나는 제 주관적인 느낌 때문에 뺐어요.",
  "꽤 정확했어요. 완벽하진 않지만 충분히 가치 있었습니다.",
  "좋긴 한데 개운법 파트가 좀 더 구체적이었으면 했어요.",
  "전체적으로 좋아요. 마무리 편지는 진짜 감동이었어요.",
  "꽤 볼 만해요. 5점까진 아니지만 추천은 해요.",
  "생각보다 좋았어요. 한 파트가 좀 아쉬워서 4점이에요.",
];

// 별점 결정 (1:1%, 3:10%, 4:19%, 5:70%)
function getReviewStar(idx: number): number {
  const slot = (idx * 41 + 17) % 100;
  if (slot === 0) return 1;
  if (slot <= 10) return 3;
  if (slot <= 29) return 4;
  return 5;
}

// 인덱스 기반 후기 텍스트 선택 (비율: 단순40/ㅋㅋ10/감성20/회의20/기타10)
// 40~60대는 ㅋㅋ 타입 제외
function getReviewText(idx: number, age: number, star: number): string {
  if (star === 1) return R_STAR1[idx % R_STAR1.length];
  if (star === 3) return R_STAR3[idx % R_STAR3.length];
  if (star === 4) return R_STAR4[idx % R_STAR4.length];
  const slot = (idx * 13 + 5) % 10;
  const isOlder = age >= 40;
  if (slot <= 3) return R_SHORT[(idx * 7 + 3) % R_SHORT.length];
  if (slot === 4) return isOlder ? R_SHORT[(idx * 9 + 1) % R_SHORT.length] : R_FUNNY[(idx * 11 + 2) % R_FUNNY.length];
  if (slot <= 6) return R_EMOTIONAL[(idx * 17 + 1) % R_EMOTIONAL.length];
  if (slot <= 8) return R_SKEPTIC[(idx * 19 + 4) % R_SKEPTIC.length];
  return R_OTHER[(idx * 23 + 6) % R_OTHER.length];
}

// 날짜 자동 생성: 최신순, 하루 1~8개 랜덤 분포
const REVIEW_DATES = (() => {
  const dates: string[] = [];
  let cur = new Date("2026-07-04");
  let idx = 0;
  while (idx < REVIEWS_RAW.length) {
    // 하루 몇 개: seed 기반 1~8
    const seed = idx * 31 + 7;
    const count = (seed % 8) + 1;
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const dateStr = `${y}.${m}.${d}`;
    for (let k = 0; k < count && idx < REVIEWS_RAW.length; k++, idx++) {
      dates.push(dateStr);
    }
    cur.setDate(cur.getDate() - 1);
  }
  return dates;
})();

type DBReview = { id: string; name: string; gender: string | null; star: number; text: string; created_at: string };

function ReviewSection() {
  const [page, setPage] = useState(0);
  const [dbReviews, setDbReviews] = useState<DBReview[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("saju_total_reviews")
        .select("id, name, gender, star, text, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => { if (data) setDbReviews(data); });
    });
  }, []);

  // DB 후기 + 정적 후기 합산 (DB 최신순 앞에)
  const totalStatic = REVIEWS_RAW.length;
  const totalPages = Math.ceil((dbReviews.length + totalStatic) / REVIEWS_PER_PAGE);
  const allCount = dbReviews.length + totalStatic;
  const pageStart = page * REVIEWS_PER_PAGE;
  const pageEnd = pageStart + REVIEWS_PER_PAGE;

  const goPage = (p: number) => {
    setPage(p);
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div ref={sectionRef} className="px-5 py-7" style={{ backgroundColor: CREAM }}>
      <h2 className="text-center text-[20px] font-black mb-1" style={{ color: GRAY1 }}>이미 수천 명이 만족했소</h2>
      <p className="text-center text-[12px] mb-4" style={{ color: GRAY3 }}>총 {getTotalReviewCount() + dbReviews.length}개 후기 · 최신순</p>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => goPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px]"
          style={{ color: page === 0 ? GRAY4 : GRAY2, border: `1px solid ${page === 0 ? GRAY4 : GRAY3}`, backgroundColor: WHITE }}>
          ‹
        </button>
        <span className="text-[14px] font-medium" style={{ color: GRAY2 }}>{page + 1} / {totalPages}</span>
        <button
          onClick={() => goPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px]"
          style={{ color: page === totalPages - 1 ? GRAY4 : GRAY2, border: `1px solid ${page === totalPages - 1 ? GRAY4 : GRAY3}`, backgroundColor: WHITE }}>
          ›
        </button>
      </div>

      <div className="space-y-3 mb-5">
        {Array.from({ length: Math.min(REVIEWS_PER_PAGE, allCount - pageStart) }).map((_, i) => {
          const globalIdx = pageStart + i;
          // DB 후기 우선
          if (globalIdx < dbReviews.length) {
            const dr = dbReviews[globalIdx];
            const starArr = Array.from({ length: 5 });
            return (
              <div key={`db-${dr.id}`} className="rounded-2xl px-4 py-4"
                style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {starArr.map((_, j) => (
                      <span key={j} className="text-[13px]" style={{ color: j < dr.star ? "#f5a623" : GRAY4 }}>★</span>
                    ))}
                  </div>
                  <span className="text-[11px]" style={{ color: GRAY3 }}>{dr.created_at?.slice(0, 10).replace(/-/g, ".")}</span>
                </div>
                <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: GRAY2 }}>{dr.text}</p>
                <p className="text-[11px]" style={{ color: GRAY3 }}>— {dr.name} {dr.gender}</p>
              </div>
            );
          }
          const staticIdx = globalIdx - dbReviews.length;
          const r = REVIEWS_RAW[staticIdx];
          const gender = globalIdx % 2 === 0 ? "여성" : "남성";
          const prefixes = ["rladk","ghkd","dkagh","tnals","wjdgh","ekdl","alswl","dhkdl","qkrgh","thsms","whdms","rlaqo","sksms","dnjsgh","ghkrl"];
          const domainPool = ["naver.com","naver.com","naver.com","naver.com","gmail.com","gmail.com","gmail.com","gmail.com","kakao.com","daum.net","nate.com","hanmail.net","icloud.com","outlook.com","yahoo.co.kr"];
          const prefix = prefixes[globalIdx % prefixes.length];
          const num = ((globalIdx * 37 + 13) % 90) + 10;
          const domain = domainPool[globalIdx % domainPool.length];
          const maskedEmail = `${prefix}${num}***@${domain}`;
          const agePart = r.name.match(/\d+대/)?.[0] ?? "";
          const surnames = ["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권","황","안","송","전","홍","고","문","양","손","배","백","허","유","남","심","노","하","곽","성","차","주","우","구","민","류"];
          const surWeights = [10,8,6,4,4,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
          const surTotal = surWeights.reduce((a,b)=>a+b,0);
          let surPick = (globalIdx * 7 + 3) % surTotal;
          let surName = surnames[0];
          for (let si = 0; si < surWeights.length; si++) { if (surPick < surWeights[si]) { surName = surnames[si]; break; } surPick -= surWeights[si]; }
          const namePart = `${surName}OO`;
          const star = getReviewStar(globalIdx);
          const reviewText = getReviewText(globalIdx, parseInt(agePart) || 30, star);
          return (
            <div key={i} className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-[13px]" style={{ color: j < star ? "#f5a623" : GRAY4 }}>★</span>
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: GRAY3 }}>{REVIEW_DATES[staticIdx]}</span>
              </div>
              <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: GRAY2 }}>{reviewText}</p>
              <p className="text-[11px]" style={{ color: GRAY3 }}>— {agePart} {gender} {namePart} | {maskedEmail}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─── 결제 모달 ────────────────────────────────────────────────────────────────
const PRODUCT = { name: "종합사주", original: 49800, discount: 50, price: 24900 };

function PayBottomSheet({ open, onClose, onConfirm }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
}) {
  const [legalDoc, setLegalDoc] = useState<null | "terms" | "privacy">(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
    setConfirmExit(false);
  }, [open]);

  if (!open) return null;

  const DBG = "#1b1820"; const DCARD = "#262229"; const DTXT = "#ffffff";
  const DMUTE = "rgba(255,255,255,0.5)"; const DSTRIKE = "rgba(255,255,255,0.38)";
  const ACCENT = "#9b2335";
  const saved = PRODUCT.original - PRODUCT.price;
  const visible = mounted && !closing;
  const requestClose = () => setConfirmExit(true);
  const doExit = () => { setConfirmExit(false); setClosing(true); setTimeout(onClose, 320); };

  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
        onClick={requestClose} />
      <div className="fixed bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", maxHeight: "92vh", backgroundColor: DBG, boxShadow: "0 -12px 40px rgba(0,0,0,0.5)", scrollbarWidth: "none", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.34s cubic-bezier(0.32,0.72,0,1)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div className="px-5 pt-2 pb-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>종합사주 결제 안내</h3>
            <button onClick={requestClose} className="flex items-center justify-center" style={{ width: 28, height: 28, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>✕</button>
          </div>
          <div className="inline-block text-[13px] font-bold px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(155,35,53,0.16)", border: `1px solid ${ACCENT}55`, color: "#c9474f" }}>
            총 <span style={{ color: ACCENT }}>{saved.toLocaleString()}원</span> 할인받았어요!
          </div>
          <div className="mb-5">
            <div className="w-full text-left rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: DCARD, border: `1.5px solid ${ACCENT}`, boxShadow: `0 0 0 3px ${ACCENT}22` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>종합사주</span>
                  <p className="text-[11.5px] mt-1" style={{ color: DMUTE }}>홍연이 들려주는 나의 운명 이야기</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px]" style={{ color: DSTRIKE }}>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>{PRODUCT.discount}%</span>{" "}
                    <span className="line-through">{PRODUCT.original.toLocaleString()}</span>
                  </p>
                  <p className="text-[16px] font-black mt-0.5" style={{ color: DTXT }}>{PRODUCT.price.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: DMUTE }}>상품 판매가 (정가)</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{PRODUCT.original.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: ACCENT, fontWeight: 700 }}>지금 결제 시 할인 ({PRODUCT.discount}% 특가)</span>
              <span style={{ color: ACCENT, fontWeight: 700 }}>-{saved.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-[17px] text-white active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #9b2335, #c9474f)", boxShadow: "0 6px 20px rgba(155,35,53,0.4)" }}>
            결제하기
          </button>
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="flex-shrink-0 flex items-center justify-center rounded"
              style={{ width: 16, height: 16, background: ACCENT, color: "#fff", fontSize: 10 }}>✓</span>
            <p className="text-[11px] leading-relaxed" style={{ color: DMUTE }}>
              결제 시{" "}
              <button onClick={() => setLegalDoc("privacy")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>개인정보 처리방침</button>과{" "}
              <button onClick={() => setLegalDoc("terms")} className="underline" style={{ color: "rgba(255,255,255,0.78)" }}>이용약관</button>에 동의합니다.
            </p>
          </div>
        </div>
      </div>

      {confirmExit && (
        <div className="fixed z-[60] px-6"
          style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", top: "34%", pointerEvents: "none" }}>
          <div className="relative mx-auto rounded-2xl px-5 py-4"
            style={{ pointerEvents: "auto", maxWidth: 290, background: "#211d27", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", animation: "popIn 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <button onClick={() => setConfirmExit(false)}
              className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
              style={{ width: 22, height: 22, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1 }}>✕</button>
            <p className="text-[14px] font-black pr-5" style={{ color: "#fff" }}>🎁 {saved.toLocaleString()}원 할인이 사라져요!</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>이 혜택은 지금만 적용됩니다.</p>
            <button onClick={() => setConfirmExit(false)}
              className="w-full mt-3 py-2.5 rounded-xl text-[13.5px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #9b2335, #c9474f)" }}>혜택 받고 계속하기</button>
            <button onClick={doExit}
              className="w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>나가기</button>
          </div>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {legalDoc && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setLegalDoc(null)} />
          <div className="fixed z-[71] flex flex-col rounded-2xl overflow-hidden"
            style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(80vw, 300px)", maxHeight: "56vh", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", animation: "legalPop 0.2s cubic-bezier(0.34,1.4,0.5,1)" }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #eee" }}>
              <span className="text-[13px] font-bold" style={{ color: "#111" }}>{legalDoc === "terms" ? "이용약관" : "개인정보처리방침"}</span>
              <button onClick={() => setLegalDoc(null)}
                className="flex items-center justify-center rounded-full"
                style={{ width: 24, height: 24, background: "#f1f1f1", color: "#666", fontSize: 13, lineHeight: 1 }}>✕</button>
            </div>
            <div className={`legal-scroll flex-1 overflow-y-auto px-4 pt-2 pb-6 ${LEGAL_DOC_CLASS} [&_h1]:hidden [&_h2:first-of-type]:border-t-0 [&_h2:first-of-type]:pt-0`}
              style={{ background: "#fff", zoom: 0.82, scrollbarWidth: "thin", scrollbarColor: "#cfcfcf transparent" } as React.CSSProperties}>
              {legalDoc === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
          <style>{`@keyframes legalPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.legal-scroll::-webkit-scrollbar{width:5px}.legal-scroll::-webkit-scrollbar-thumb{background:#cfcfcf;border-radius:3px}.legal-scroll::-webkit-scrollbar-track{background:transparent}`}</style>
        </div>
      )}
    </>
  );
}

// ─── 고정 결제 CTA ────────────────────────────────────────────────────────────
const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"];
const ENDINGS  = ["지", "은", "현", "수", "민", "호", "아", "연", "준", "서", "영", "우", "빈", "진"];
const TIMES    = ["방금", "방금 전", "1분 전", "2분 전", "3분 전", "5분 전", "7분 전"];
const TIME_COLORS: Record<string, string> = {
  "방금": "#9b2335", "방금 전": "#9b2335",
  "1분 전": "#c9474f", "2분 전": "#c9474f",
  "3분 전": "#b5651d", "5분 전": "#6c757d", "7분 전": "#6c757d",
};
function randomName() {
  return SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + "*" + ENDINGS[Math.floor(Math.random() * ENDINGS.length)];
}
function randomTime() { return TIMES[Math.floor(Math.random() * TIMES.length)]; }

function ToastLayer() {
  const [toasts, setToasts] = useState<{ id: number; name: string; time: string }[]>([]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const addToast = () => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, name: randomName(), time: randomTime() }]);
      timers.push(setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000));
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 5500;
      timers.push(setTimeout(() => {
        addToast();
        if (Math.random() < 0.3) timers.push(setTimeout(addToast, 500));
        schedule();
      }, delay));
    };
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{`@keyframes toastInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ position: "fixed", bottom: 100, right: "max(8px, calc(50vw - 232px))", zIndex: 49, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: "toastInRight 0.35s ease", display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9999, padding: "6px 14px", fontSize: 12, color: "#fff", whiteSpace: "nowrap", backdropFilter: "blur(6px)" }}>
            <span style={{ backgroundColor: TIME_COLORS[t.time] ?? "#c9474f", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: "2px 7px" }}>{t.time}</span>
            <span><b>{t.name}</b>님이 신청하였습니다.</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StickyPayCTA({ onPay, name }: { onPay: () => void; name: string }) {
  const [timeLeft, setTimeLeft] = useState("22:14:08");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const DURATION = 6 * 3600000 + 22 * 60000 + 14 * 1000 + 80;
    const endTime = Date.now() + DURATION;
    const tick = () => {
      let diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000);   diff %= 60000;
      const s = Math.floor(diff / 1000);    diff %= 1000;
      const cs = Math.floor(diff / 10);
      setTimeLeft(`${pad(m)}:${pad(s)}:${pad(cs)}`);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 flex items-center gap-3 px-4 z-50"
      style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", height: 80, backgroundColor: "#141414" } as React.CSSProperties}>
      {/* 왼쪽: 타이머 */}
      <div className="flex flex-col items-start flex-shrink-0">
        <span className="text-[13px] font-bold tracking-wider" style={{ color: RED }}>할인 혜택까지</span>
        <span className="text-[18px] font-black tabular-nums" style={{ color: WHITE }}>{timeLeft}</span>
      </div>
      {/* 구분선 */}
      <div style={{ width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
      {/* 오른쪽: 버튼 */}
      <style>{`
        @keyframes jeongtongBtnNeon {
          0%   { background: #9b2335; box-shadow: 0 0 12px 3px rgba(155,35,53,0.7); }
          33%  { background: #c9474f; box-shadow: 0 0 12px 3px rgba(201,71,79,0.7); }
          66%  { background: #e8a0a8; box-shadow: 0 0 12px 3px rgba(232,160,168,0.7); }
          100% { background: #9b2335; box-shadow: 0 0 12px 3px rgba(155,35,53,0.7); }
        }
        @keyframes jeongtongBtnBeat {
          0%, 40%, 60%, 100% { transform: scale(1); }
          20% { transform: scale(1.05); }
          50% { transform: scale(1.03); }
        }
      `}</style>
      <button onClick={onPay}
        className="flex-1 py-3.5 rounded-2xl font-black text-[18px] text-white flex items-center justify-center"
        style={{ animation: "jeongtongBtnNeon 3s ease-in-out infinite, jeongtongBtnBeat 2s ease-in-out infinite" }}>
        종합사주 확인하기
      </button>
    </div>
  );
}

// ─── 생성 로딩 화면 ───────────────────────────────────────────────────────────
// API 생성 순서(2 먼저, 나머지 1·3~14) 기준 14개 → 표시 이름은 결과지 목차와 일치
const CHAPTER_TITLES = [
  "제2장 — 나의 진짜 모습은 무엇일까",   // API 2 (먼저)
  "제1장 — 나는 어떤 그릇으로 태어났나", // API 1
  "제3장 — 나는 세상을 어떻게 대하는가", // API 3
  "제4장 — 내 사주에 나타나는 특이점",   // API 4
  "제5장 — 내 재물과 천직은 어떠한가",   // API 5
  "제6장 — 내 인연과 혼인의 때는 언제인가", // API 6
  "제7장 — 내 건강과 약한 곳은 어디인가", // API 7
  "제4장 — 내 사주에 나타나는 특이점",   // API 8 (4장 보조)
  "제4장 — 내 사주에 나타나는 특이점",   // API 9 (4장 보조)
  "제4장 — 내 사주에 나타나는 특이점",   // API 10 (4장 보조)
  "제8장 — 내 인생은 어떻게 흐르는가",   // API 11
  "제4장 — 내 사주에 나타나는 특이점",   // API 12 (4장 보조)
  "인트로 — 사주팔자란 무엇인가",        // API 13
  "마무리 — 그대에게 남기는 홍연의 서신", // API 14
];
const TOTAL = 10;

function CreatingScreen({ doneCount, currentChapter }: { doneCount: number; currentChapter: number }) {
  const pct = Math.round((doneCount / TOTAL) * 100);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-8"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #3a0008 0%, #0a0002 100%)" }}>
      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px 2px #9b2335aa,0 0 20px 4px #c9474f55} 50%{box-shadow:0 0 16px 4px #c9474fcc,0 0 40px 10px #9b233588} }
        @keyframes title-fade { 0%{opacity:0;transform:translateY(6px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(38px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      `}</style>
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #9b233522 0%, transparent 70%)" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            top: "50%", left: "50%", marginTop: "-2px", marginLeft: "-2px",
            background: i % 2 === 0 ? "#9b2335" : "#e8a0a8",
            boxShadow: `0 0 6px 2px ${i % 2 === 0 ? "#9b2335" : "#e8a0a8"}`,
            animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
            animationDelay: `${i * -0.5}s`,
          }} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #9b2335)" }}>✦</span>
        </div>
      </div>
      <p className="text-[18px] font-bold mb-1" style={{ color: "#fff5f5", fontFamily: "'Noto Serif KR', serif", textShadow: "0 0 20px #9b233588" }}>
        결과지를 완성하고 있소…
      </p>
      <p key={currentChapter} className="text-[13px] mb-8" style={{ color: "#e8a0a8", animation: "title-fade 4s ease-in-out", minHeight: 20 }}>
        {doneCount < TOTAL ? CHAPTER_TITLES[currentChapter - 1] + " 풀이 중" : "마무리 중이오…"}
      </p>
      <div className="w-full max-w-[280px] mb-3">
        <div className="flex justify-between text-[11px] mb-2" style={{ color: "#c9909a" }}>
          <span>풀이 진행 중</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden relative" style={{ background: "#1a0005" }}>
          <div className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7a1020, #9b2335, #c9474f)", animation: pct > 0 ? "glow-pulse 1.8s ease-in-out infinite" : "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", animation: "shimmer 1.6s linear infinite", width: "40%" }} />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-center leading-relaxed mt-4" style={{ color: "#886677" }}>
        풀이가 완성되면 자동으로 열리오.<br />이 창을 벗어나셔도 입력하신 이메일로<br />결과지 링크를 보내드렸으니 언제든 확인하실 수 있소.
      </p>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name     = searchParams.get("name")     ?? "고객";
  const date     = searchParams.get("date")     ?? "";
  const time     = searchParams.get("time")     ?? "시간 모름";
  const calendar = searchParams.get("calendar") ?? "양력";
  const gender   = searchParams.get("gender")   ?? "";
  const email    = searchParams.get("email")    ?? "";
  const phone    = searchParams.get("phone")    ?? "";
  const concern  = searchParams.get("concern")  ?? "";

  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);

  const [showSheet, setShowSheet] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [widgetOrderId, setWidgetOrderId] = useState<string | null>(null);
  const [widgetAmount, setWidgetAmount] = useState<number>(PRODUCT.price);

  // 페이지 로드 시 미리 주문 생성 → 버튼 클릭 즉시 위젯 오픈
  const pendingOrderId = useRef<string | null>(null);
  const pendingAmount  = useRef<number>(PRODUCT.price);
  const orderCreating  = useRef(false);

  const buildOrderBody = useCallback(async () => {
    const { parseTimeVal, parseCalendar } = await import("@/lib/saju/local-manseryeok");
    const birthDate   = date.replace(/\./g, "-");
    const timeVal     = parseTimeVal(time);
    const birthTime   = timeVal !== "unknown" ? timeVal : null;
    const timeUnknown = timeVal === "unknown";
    const calApi      = parseCalendar(calendar) === "solar" ? "solar" : "lunar";
    const genderApi: "male" | "female" =
      gender === "여자" || gender === "여성" || gender === "여아" || gender === "female" ? "female" : "male";
    return { productSlug: "total", email, name, birthDate, birthTime, timeUnknown, gender: genderApi, calendar: calApi, concerns: concern ? [concern] : [] };
  }, [date, time, calendar, gender, email, name, concern]);

  useEffect(() => {
    if (orderCreating.current) return;
    orderCreating.current = true;
    (async () => {
      try {
        const body = await buildOrderBody();
        const res = await fetch("/api/orders/create-guest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (res.ok) {
          const { orderId, amount } = await res.json();
          pendingOrderId.current = orderId;
          pendingAmount.current  = amount;
        }
      } catch { /* 실패 시 handleConfirm에서 재시도 */ }
    })();
  }, [buildOrderBody]);

  const handleConfirm = async () => {
    setShowSheet(false);
    setOrderError(null);
    if (pendingOrderId.current) {
      setWidgetOrderId(pendingOrderId.current);
      setWidgetAmount(pendingAmount.current);
      setShowWidget(true);
      return;
    }
    // 미리 생성 실패 시 즉석 재시도
    try {
      const body = await buildOrderBody();
      const res = await fetch("/api/orders/create-guest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setOrderError(json.error ?? "주문 생성에 실패했습니다. 다시 시도해 주세요.");
        return;
      }
      const { orderId, amount } = await res.json();
      setWidgetOrderId(orderId);
      setWidgetAmount(amount);
      setShowWidget(true);
    } catch {
      setOrderError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  const SITE = typeof window !== "undefined" ? window.location.origin : "";

  void phone; // TODO: Solapi 알림톡 연동 시 사용

  return (
    <div className="w-full h-full" style={{ backgroundColor: WHITE }}>
      <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: "none", paddingBottom: 80 }}>
        <style>{`div::-webkit-scrollbar{display:none} @font-face{font-family:'GmarketSans';font-weight:700;src:url('https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSansBold.woff2') format('woff2');}`}</style>

        {/* ① 상단 이미지 */}
        <div className="relative w-full" style={{ aspectRatio: "1000/7000" }}>
          <img src="/media/checkout/saju_total/s1-v.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
          <div className="absolute flex flex-col items-center gap-1 pointer-events-none" style={{ top: "28.2%", left: "33%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>
              {`${name}님`}
            </p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>
              만나서 반갑소.
            </p>
          </div>
          <div className="absolute flex flex-col items-center gap-1 pointer-events-none" style={{ top: "94.5%", left: "37%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>자, 한번 보시오.</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>{`${name}님`} 사주팔자요.</p>
          </div>
          <div className="absolute flex flex-col items-center gap-1 pointer-events-none" style={{ top: "36%", left: "68%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>소인은,</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>조선의 명리대가</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>홍연이라고 하오.</p>
          </div>
          <div className="absolute flex flex-col items-center gap-1 pointer-events-none" style={{ top: "64%", left: "72%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>
              어디보자...
            </p>
          </div>
          <div className="absolute flex flex-col items-center gap-1 pointer-events-none" style={{ top: "59.2%", left: "43%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>풀이에 앞서,</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>{`${name}님`}의 사주팔자가</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000" }}>어떻게 생겼는지 봐야하오.</p>
          </div>
        </div>

        {/* ② 명식 */}
        <MyeongsikSection saju={saju} name={name} date={date} calendar={calendar} gender={gender} />

        {/* ③ 하단 이미지 */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10" style={{ background: `linear-gradient(to top, transparent, ${WHITE})` }} />
          <img src="/media/checkout/saju_total/s2-v.jpg" alt="" className="w-full block" />
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "13.5%", left: "65%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>어떤 내용들인지</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>일부만 말해주겠소</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>&nbsp;</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>아주 디테일하오.</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "39.5%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>{`${name}님 사주가 과연`}</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>신강한지 신약한지</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "57.8%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>{`${name}님에게 꼭 필요한 오행과`}</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>도와주는 오행, 피해야할 오행</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "73.8%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>{`${name}님의 연애/재물흐름`}</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>그리고 건강운의 흐름</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "103%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>{`${name}님 적성에 잘 맞는`}</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>직군과 직업들 (사업vs직장인)</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "121%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>{`${name}님에게 잘맞는 이성의`}</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>사주팔자와 생일까지...❤️</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "175%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>내 사주상 취약한 신체부위와</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>개운을 위한 일상속 방법들</p>
          </div>
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "147.5%", left: "34%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>이뿐이겠소?</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>&nbsp;</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>아주 극히</p>
            <p style={{ fontSize: 22, fontWeight: 400, color: "#000000", lineHeight: 1.4 }}>일부일 뿐이오</p>
          </div>
        </div>

        <img src="/media/checkout/saju_total/s3-v.jpg" alt="" className="w-full block" />
        <div className="relative">
          <video src="/media/checkout/saju_total/s3-vv1.mp4" autoPlay muted loop playsInline className="w-full block" />
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "13%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>대운과 세운의 흐름까지</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>속시원하게 볼 수 있소.</p>
          </div>
        </div>
        <div className="relative">
          <img src="/media/checkout/saju_total/s4-v3.jpg" alt="" className="w-full block" />
          <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: "2.5%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap", fontFamily: "'GmarketSans', sans-serif", fontWeight: 700 }}>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>지금, 소인의 손에</p>
            <p style={{ fontSize: 22, color: "#000000", lineHeight: 1.4 }}>들려 있소이다.</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
        </div>

        {/* ④ 후기 */}
        <ReviewSection />

<div className="h-4" />
      </div>

      <ToastLayer />
      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
      {orderError && (
        <div className="fixed bottom-24 z-[60] px-4" style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)" }}>
          <div className="rounded-2xl px-4 py-3 text-center" style={{ background: "#7a1020", color: "#fff", fontSize: 13 }}>
            {orderError}
            <button onClick={() => setOrderError(null)} className="ml-3 underline opacity-70">닫기</button>
          </div>
        </div>
      )}
      {/* 토스 결제 위젯 오버레이 */}
      {showWidget && widgetOrderId && (
        <>
          <div className="fixed inset-0 z-[70]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowWidget(false)} />
          <div className="fixed z-[71] overflow-y-auto rounded-t-3xl"
            style={{ left: "max(0px, calc(50vw - 240px))", width: "min(100%, 480px)", bottom: 0, maxHeight: "92vh", background: "#fff", scrollbarWidth: "none" }}>
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(0,0,0,0.15)" }} />
            </div>
            <style>{`
              .toss-widget-wrap button[class*="inline-flex"][class*="w-full"] {
                background: #3182F6 !important;
                color: #fff !important;
                border-radius: 12px !important;
                font-weight: 700 !important;
                font-size: 16px !important;
                box-shadow: none !important;
              }
              .toss-widget-wrap button[class*="inline-flex"][class*="w-full"]:hover {
                background: #1b6fe8 !important;
              }
              .toss-widget-wrap #agreement { transform: scale(0.72); transform-origin: left top; margin-bottom: -24px; }

            `}</style>
            <div className="px-5 pt-2 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[17px] font-black" style={{ color: "#1a1a1a" }}>결제</h3>
                <button onClick={() => setShowWidget(false)} style={{ fontSize: 18, color: "#888" }}>✕</button>
              </div>
              <p className="text-[13px] mb-4" style={{ color: "#888" }}>
                종합사주풀이 · <span className="font-bold" style={{ color: "#1a1a1a" }}>{widgetAmount.toLocaleString()}원</span>
              </p>
              <div className="toss-widget-wrap">
              <TossWidget
                orderId={widgetOrderId}
                amount={widgetAmount}
                customerKey={`guest_${widgetOrderId}`}
                productName="종합사주풀이"
                customerEmail={email || null}
                successUrl={`${SITE}/saju/saju_total/checkout/success`}
                failUrl={`${SITE}/checkout/fail`}
              />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SajuJeongtongCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: RED, borderTopColor: "transparent" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
