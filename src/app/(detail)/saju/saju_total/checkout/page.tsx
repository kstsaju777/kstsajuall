"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect, useRef } from "react";
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
const REVIEWS = [
  { star: 5, text: "소름돋을 정도로 정확해요. 제 성격을 너무 잘 맞췄어요. 주변에 다 추천했습니다.", name: "30대 직장인 김○○", date: "2025.05.12" },
  { star: 5, text: "대운 흐름이 딱 맞았어요. 미리 알고 준비했더니 힘든 시기를 잘 넘길 수 있었습니다.", name: "40대 주부 이○○", date: "2025.04.28" },
  { star: 5, text: "재물운 분석이 정말 좋았어요. 왜 그때 기회가 왔는지 이제야 이해가 됐습니다.", name: "50대 자영업자 박○○", date: "2025.05.03" },
  { star: 5, text: "내 인생의 큰 줄기를 딱 짚어줘서 앞으로 어떻게 살아야 할지 방향이 잡혔어요.", name: "20대 대학원생 최○○", date: "2025.06.01" },
];

function ReviewSection() {
  return (
    <div className="px-5 py-7" style={{ backgroundColor: CREAM }}>
      <p className="text-center text-[11px] tracking-[0.2em] mb-1 font-medium" style={{ color: "#7a1020" }}>✦ 실제 후기 ✦</p>
      <h2 className="text-center text-[20px] font-black mb-4" style={{ color: GRAY1 }}>이미 수천 명이 확인했소</h2>
      <div className="space-y-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-2xl px-4 py-4"
            style={{ backgroundColor: WHITE, border: `1px solid ${GRAY4}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[13px]" style={{ color: j < r.star ? "#f5a623" : GRAY4 }}>★</span>
                ))}
              </div>
              <span className="text-[11px]" style={{ color: GRAY3 }}>{r.date}</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: GRAY2 }}>"{r.text}"</p>
            <p className="text-[11px]" style={{ color: GRAY3 }}>— {r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ 섹션 ────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "결과지는 얼마나 걸리나요?", a: "결제 직후 약 1~2분 내에 자동 생성됩니다. 입력하신 이메일로도 링크를 보내드려, 언제든 다시 확인하실 수 있소." },
  { q: "생년월일 시간을 모르면요?", a: "시주까지 입력할 수 있으나, 시간을 모르는 경우도 분석이 가능하오. 다만 시주 관련 항목의 정확도는 다소 낮을 수 있소." },
  { q: "어떤 항목을 분석하나요?", a: "타고난 운명 구조, 대운 흐름, 재물과 직업운, 사랑과 결혼운, 주의 시기 등 총 16장에 걸쳐 상세히 풀이하오." },
  { q: "환불이 가능한가요?", a: "AI가 생성한 콘텐츠 특성상, 결과지가 생성된 후에는 환불이 어렵습니다. 구매 전 신중히 결정해주시오." },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="px-5 py-7" style={{ backgroundColor: WHITE }}>
      <h2 className="text-center text-[20px] font-black mb-4" style={{ color: GRAY1 }}>자주 묻는 질문</h2>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${openIdx === i ? ROSE : GRAY4}`, transition: "border-color 0.2s" }}>
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              style={{ backgroundColor: openIdx === i ? RED_PALE : WHITE }}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span className="text-[13.5px] font-bold pr-2" style={{ color: GRAY1 }}>{faq.q}</span>
              <span className="flex-shrink-0 text-[18px] font-light transition-transform duration-200"
                style={{ color: "#7a1020", transform: openIdx === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 pt-1" style={{ backgroundColor: RED_PALE }}>
                <p className="text-[13px] leading-relaxed" style={{ color: GRAY2 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 결제 모달 ────────────────────────────────────────────────────────────────
const PRODUCT = { name: "정통사주", original: 59800, discount: 50, price: 29900 };

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
            <h3 className="text-[18px] font-black" style={{ color: DTXT }}>정통사주 결제 안내</h3>
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
                  <span className="text-[14.5px] font-bold" style={{ color: DTXT }}>정통사주</span>
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
        정통사주 확인하기
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
  const concern  = searchParams.get("concern")  ?? "";

  const saju = useMemo(() => calcSaju(date, time, calendar), [date, time, calendar]);

  const [showSheet, setShowSheet] = useState(false);
  const [creating, setCreating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);

  const handleConfirm = async () => {
    setShowSheet(false);
    setCreating(true);
    setDoneCount(0);
    setCurrentChapter(1);
    try {
      const res = await fetch("/api/saju_total-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, time, calendar, gender, email, concern }),
      });
      if (!res.ok) {
        router.push(`/saju/saju_total/report-preview?${new URLSearchParams({ name, gender }).toString()}`);
        return;
      }
      const { resultId } = await res.json();
      if (!resultId) {
        router.push(`/saju/saju_total/report-preview?${new URLSearchParams({ name, gender }).toString()}`);
        return;
      }

      const FIRST = [2]; // 용신 확정을 위해 2장 먼저 단독 생성
      const REST  = [1,3,4,5,6,7,11,14,15]; // 실제 표시 목차에 대응하는 API ch만 생성
      let done = 0;
      const allContent: Record<string, unknown> = {};

      // 2장 먼저 생성 — 완료 시 route.ts가 myeongsik에 yongsinEl 저장
      for (const ch of FIRST) {
        try {
          const r = await fetch("/api/saju_total-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }

      // 나머지 장 병렬 생성 (myeongsik에 yongsinEl이 저장된 상태)
      await Promise.all(REST.map(async (ch) => {
        try {
          const r = await fetch("/api/saju_total-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: resultId, chapter: ch }),
          });
          const data = await r.json();
          if (data.sections) Object.assign(allContent, data.sections);
        } catch { /* 장 실패해도 계속 */ }
        done++;
        setDoneCount(done);
        setCurrentChapter(Math.min(done + 1, TOTAL));
      }));

      await fetch("/api/saju_total-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, content: allContent }),
      });

      router.push(`/saju/saju_total/report-preview?id=${resultId}&gender=${encodeURIComponent(gender)}&name=${encodeURIComponent(name)}`);
    } catch {
      router.push(`/saju/saju_total/report-preview?${new URLSearchParams({ name, gender }).toString()}`);
    }
  };

  if (creating) {
    return <CreatingScreen doneCount={doneCount} currentChapter={currentChapter} />;
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: WHITE }}>
      <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: "none", paddingBottom: 80 }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {/* ① 상단 이미지 */}
        <div className="relative w-full" style={{ aspectRatio: "1000/7000" }}>
          <img src="/media/checkout/saju_total/s1-3.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
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
          <img src="/media/checkout/saju_total/s2.jpg" alt="" className="w-full block" />
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }} />
        </div>

        {/* ④ FAQ */}
        <FAQSection />

        <div className="h-4" />
      </div>

      <ToastLayer />
      <StickyPayCTA onPay={() => setShowSheet(true)} name={name} />
      <PayBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onConfirm={handleConfirm} />
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
