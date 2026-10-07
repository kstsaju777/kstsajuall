"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_CARDS, type CategoryCard } from "@/config/category-cards";
import { businessInfo, siteConfig } from "@/config/site";
import { FooterLegal } from "@/components/layout/FooterLegal";

const GOLD = "#FFD36A";
const GOLD_DEEP = "#E8A93A";
const WINE = "#2d0008";
const RED = "#b40501";
const MAIN_SLUG = "total";

// href(/saju/<slug>) → 카드 정보. 홈 화면과 같은 썸네일·문구를 그대로 쓴다.
const CARD_BY_SLUG: Record<string, CategoryCard> = {};
for (const card of Object.values(CATEGORY_CARDS).flat()) {
  const slug = card.href.replace("/saju/", "");
  if (!CARD_BY_SLUG[slug] && card.tagline) CARD_BY_SLUG[slug] = card;
}

// 윗줄: 사주 상품, 아랫줄: 궁합 상품
const ROW_A = ["total", "saju_yeonae", "saju_jaemul", "saju_janyeo", "saju_youare", "saju_health"];
const ROW_B = ["kunghap_yeonae", "kunghap_jaehwe", "kunghap_gyeolhon", "kunghap_janyeo", "kunghap_imshin", "kunghap_business", "kunghap_banryeo", "kunghap_ehon"];


const BADGE_COLORS: Record<string, string> = {
  궁합: "#e1337d", 반려동물: "#b47221", 사주: "#711b20", 종합: "#711b20", 재물: "#eac660", 건강: "#2e7d32",
  결혼: "#c2185b", 임신: "#6a1b9a", 연애: "#e1337d", 자녀: "#0077b6", 유아: "#dddbd1", 재회: "#7b2fff",
  이혼: "#444", 비즈니스: "#1d6fce",
};
const BADGE_DARK_TEXT = ["유아", "재물"];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function WelcomeClient() {
  const [qs, setQs] = useState("");
  const [muted, setMuted] = useState(true);
  const [needTap, setNeedTap] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useRef(true);

  // 광고 주소의 utm 값 등을 보관했다가 상품 페이지 링크에 그대로 붙인다.
  useEffect(() => {
    try {
      const cur = window.location.search;
      if (cur && cur.length > 1) {
        sessionStorage.setItem("welcome_qs", cur);
        setQs(cur);
      } else {
        const saved = sessionStorage.getItem("welcome_qs");
        if (saved) setQs(saved);
      }
    } catch {
      setQs(window.location.search);
    }
  }, []);

  const href = useCallback(
    (path: string) => {
      const extra = qs && qs.length > 1 ? qs.slice(1) + "&" : "";
      return `${path}?${extra}from=welcome`;
    },
    [qs]
  );

  const track = useCallback((place: string, slug: string) => {
    try { window.gtag?.("event", "welcome_click", { place, slug }); } catch { /* 무시 */ }
    try { window.fbq?.("trackCustom", "WelcomeClick", { place, slug }); } catch { /* 무시 */ }
  }, []);

  // 영상 자동재생(무음). 막히면 탭해서 재생
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => setNeedTap(true));
  }, []);

  // 히어로가 화면에서 벗어나면 영상을 멈추고 하단 버튼을 보여준다.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        setShowBar(!e.isIntersecting);
        heroInView.current = e.isIntersecting;
        const v = videoRef.current;
        if (!v) return;
        if (e.isIntersecting) v.play().catch(() => undefined);
        else if (v.muted) v.pause(); // 소리를 켜 둔 상태면 화면 밖에서도 계속 재생
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => undefined);
    else if (!heroInView.current) v.pause();
  };

  const startVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setNeedTap(false)).catch(() => undefined);
  };


  return (
    <div style={{ background: "#0b0305", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @keyframes wlPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,211,106,0); } 50% { transform: scale(1.08); box-shadow: 0 0 18px 2px rgba(255,211,106,.35); } }
        .wl-pulse { animation: wlPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .wl-pulse { animation: none; } }
        .wl-cta { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 0; border-radius: 14px; background: linear-gradient(180deg, #d41a14 0%, #b40501 55%, #8f0300 100%); color: #fff; font-size: 17px; font-weight: 900; letter-spacing: -0.2px; overflow: hidden; isolation: isolate; box-shadow: 0 8px 24px rgba(180,5,1,.55); animation: wlCtaBeat 1.9s ease-in-out infinite, wlCtaRing 1.9s ease-out infinite; -webkit-tap-highlight-color: transparent; transition: filter .15s ease; }
        .wl-cta:active { transform: scale(.96); animation-play-state: paused; filter: brightness(.92); }
        .wl-cta-label { position: relative; z-index: 2; text-shadow: 0 1px 6px rgba(0,0,0,.35); }
        .wl-cta-arrow { position: relative; z-index: 2; animation: wlCtaArrow 1.1s ease-in-out infinite; }
        .wl-cta-shine { position: absolute; top: 0; bottom: 0; left: -45%; width: 38%; z-index: 1; background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,246,214,.55) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); animation: wlCtaShine 2.6s ease-in-out infinite; pointer-events: none; }
        @keyframes wlCtaBeat { 0%, 100% { transform: scale(1); } 12% { transform: scale(1.045); } 24% { transform: scale(1); } 36% { transform: scale(1.03); } 48% { transform: scale(1); } }
        @keyframes wlCtaRing { 0% { box-shadow: 0 8px 24px rgba(180,5,1,.55), 0 0 0 0 rgba(255,211,106,.65); } 70%, 100% { box-shadow: 0 8px 24px rgba(180,5,1,.55), 0 0 0 16px rgba(255,211,106,0); } }
        @keyframes wlCtaArrow { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
        @keyframes wlCtaShine { 0% { left: -45%; } 55%, 100% { left: 120%; } }
        @media (prefers-reduced-motion: reduce) { .wl-cta, .wl-cta-arrow, .wl-cta-shine { animation: none; } .wl-cta-shine { display: none; } }
        @keyframes wlArrow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
        @keyframes wlArrowFade { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
        @keyframes wlGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,211,106,.0), 0 10px 28px rgba(180,5,1,.5); } 50% { box-shadow: 0 0 0 6px rgba(255,211,106,.16), 0 10px 34px rgba(180,5,1,.65); } }
        .wl-scroll::-webkit-scrollbar { display: none; }
        .wl-card { transition: transform .18s ease; }
        .wl-card:active { transform: scale(.98); }
      `}</style>

      {/* 1. 히어로 영상 */}
      <section ref={heroRef} style={{ position: "relative", width: "100%", aspectRatio: "9 / 16", overflow: "hidden", background: "#000" }}>
        <video
          ref={videoRef}
          src="/media/welcome/hero.mp4"
          poster="/media/welcome/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(11,3,5,0.94) 100%)", pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img src="/logo_128.jpg" alt="홍연당" width={38} height={38} style={{ borderRadius: "50%", border: "1px solid rgba(255,255,255,.35)" }} />
          <button
            onClick={toggleSound}
            aria-label={muted ? "소리 켜기" : "소리 끄기"}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", fontSize: 12, fontWeight: 700 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></>}
            </svg>
            {muted ? "소리 켜기" : "소리 끄기"}
          </button>
        </div>

        {needTap && (
          <button onClick={startVideo} aria-label="영상 재생" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)" }}>
            <span style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 20px 12px", textAlign: "center" }}>
          <p style={{ fontSize: 12, letterSpacing: 2, color: GOLD, fontWeight: 700, margin: "0 0 4px" }}>조선의 정통 명리학 × AI</p>
          <p style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.35, margin: "0 0 12px", textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>
            생년월일 하나로,<br />그대만의 이야기를 써 드리겠소.
          </p>
          <Link
            href={href(`/saju/${MAIN_SLUG}`)}
            onClick={() => track("hero", MAIN_SLUG)}
            style={{ display: "block", padding: "14px 0", borderRadius: 14, background: RED, color: "#fff", fontSize: 16, fontWeight: 900, animation: "wlGlow 2.2s ease-in-out infinite" }}
          >
            홍연에게 사주 보러가기
          </Link>
        </div>
      </section>

      {/* 2. 소개 */}
      <section style={{ position: "relative", padding: "78px 22px 20px", background: `linear-gradient(180deg, #0b0305 0%, ${WINE} 100%)` }}>
        {/* 스크롤 안내 화살표 (가운데 정렬, 위아래로 움직임) */}
        <div aria-hidden style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <ScrollArrows />
        </div>
        <h2 style={{ fontSize: 27, lineHeight: 1.4, fontWeight: 900, margin: "0 0 14px", textAlign: "center" }}>
          수백 년을 이어온 명리학을<br /><span style={{ color: GOLD }}>오늘의 말</span>로 풀었소.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,.78)", margin: "0 0 26px", textAlign: "center", wordBreak: "keep-all", textWrap: "balance" }}>
          생년월일시로 사주 여덟 글자를 정확히 헤아리고, AI가 그대의 이야기를 장(章)마다 차근차근 써 내려가오. 어려운 한자 풀이가 아니라, 읽다 보면 고개가 끄덕여지는 이야기로 말이오.
        </p>
        {/* 좌우 끝까지 채우고, 위아래는 배경색으로 서서히 사라지게 */}
        <div style={{ margin: "0 -22px", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)" }}>
          <LoopVideo src="/media/welcome/trust2.mp4" poster="/media/welcome/trust2-poster.jpg" ratio="540 / 968" />
        </div>
      </section>

      {/* 3. 차별점 */}
      <section style={{ padding: "34px 22px 40px", background: WINE }}>
        {[
          { t: "30년 명리 내공 위에 세웠소", d: "30년 경력 명리학자의 자문을 거쳐, 사주 여덟 글자부터 정확히 세우오." },
          { t: "쉬운 말로, 깊이 있게", d: "어렵게 느껴지던 사주를 일상의 말로 풀되, 가볍지 않게 짚어 드리오." },
          { t: "오직 그대 한 사람을 위해", d: "이름과 생년월일시로 한 편씩 따로 써서, 완성되면 알림톡으로 알려 드리오." },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, padding: "26px 0", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.1)" }}>
            <BrushCheck />
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", wordBreak: "keep-all" }}>{f.t}</p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,.75)", margin: 0, wordBreak: "keep-all", textWrap: "balance" }}>{f.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 4. 상품 */}
      <section style={{ padding: "110px 18px 40px", background: "linear-gradient(180deg, #2d0008 0%, #0b0305 100px, #0b0305 100%)" }}>
        <div style={{ padding: "0 4px 18px", textAlign: "center" }}>
          <img src="/media/welcome/logo-circle.jpg" alt="홍연당" width={76} height={76} style={{ display: "block", width: 76, height: 76, margin: "0 auto 16px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,211,106,.55)", boxShadow: "0 8px 22px rgba(0,0,0,.5)" }} />
          <h2 style={{ fontSize: "clamp(18px, 5.8vw, 25px)", fontWeight: 900, lineHeight: 1.4, margin: 0, whiteSpace: "nowrap" }}>다양한 풀이들을 준비하였소.</h2>
          <div aria-hidden style={{ width: 2, height: 34, margin: "16px auto 0", borderRadius: 2, background: "linear-gradient(180deg, rgba(255,211,106,.9), rgba(255,211,106,0))" }} />
        </div>

        {/* 전체 상품: 두 줄이 서로 반대 방향으로 천천히 흐름(만지면 멈춤) */}
        <div style={{ margin: "0 -18px" }}>
          <Marquee slugs={ROW_A} dir={1} speed={34} href={href} track={track} />
          <div style={{ height: 10 }} />
          <Marquee slugs={ROW_B} dir={-1} speed={34} href={href} track={track} />
        </div>
      </section>

      {/* 5. 안심 */}
      <section style={{ padding: "10px 22px 42px", background: `linear-gradient(180deg, #0b0305 0%, ${WINE} 100%)` }}>
        {/* 좌우 끝까지 채우고, 위아래는 배경색으로 서서히 사라지게 */}
        <div style={{ margin: "0 -22px", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)" }}>
          <LoopVideo src="/media/welcome/last3.mp4" poster="/media/welcome/last3-poster.jpg" ratio="540 / 968" />
        </div>

        {/* 영상 아래: 스크롤 화살표 → 모든상품 보러가기 */}
        <div aria-hidden style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <ScrollArrows />
        </div>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Link href="/" onClick={() => track("home_link", "home")} className="wl-pulse" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 999, border: "1px solid rgba(255,211,106,.55)", color: GOLD, fontSize: 14, fontWeight: 800 }}>
            모든상품 보러가기 →
          </Link>
        </div>
      </section>

      {/* 6. 사업자 정보 */}
      <footer style={{ backgroundColor: "#e5e5e5", paddingBottom: showBar ? 84 : 0 }}>
        <div className="px-6 py-10 text-center space-y-5" style={{ color: "#333" }}>
          <div className="flex justify-center">
            <Link href="/" aria-label="홈으로"><img src="/logo.png" alt={siteConfig.name} className="h-10 w-auto object-contain" /></Link>
          </div>
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            <p>상호 {businessInfo.companyName}{businessInfo.representative && <> &nbsp;|&nbsp; 대표이사 {businessInfo.representative}</>}</p>
            {businessInfo.address && <p>{businessInfo.address}</p>}
            {businessInfo.mailOrderNumber && <p>통신판매업 신고 {businessInfo.mailOrderNumber}</p>}
            {businessInfo.businessNumber && <p>사업자등록번호 {businessInfo.businessNumber}</p>}
            <p>고객센터 : <a href={businessInfo.kakaoChannel} target="_blank" rel="noreferrer" className="underline">카카오톡 홍연당 채널</a></p>
            <p>MAIL {businessInfo.email}</p>
            <p>TEL 010-2395-8953</p>
          </div>
          <FooterLegal />
          <p className="text-[11px]" style={{ color: "#777" }}>Copyright © {new Date().getFullYear()} 홍연당 · All rights reserved</p>
        </div>
      </footer>

      {/* 소리를 켠 채 아래로 내려왔을 때, 끌 수 있는 작은 버튼 */}
      <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", width: "min(100%, 430px)", display: "flex", justifyContent: "flex-end", padding: "0 14px", zIndex: 41, pointerEvents: "none", opacity: showBar && !muted ? 1 : 0, transition: "opacity .25s ease" }}>
        <button
          onClick={toggleSound}
          aria-label="소리 끄기"
          tabIndex={showBar && !muted ? 0 : -1}
          style={{ pointerEvents: showBar && !muted ? "auto" : "none", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", fontSize: 12, fontWeight: 700 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></svg>
          소리 끄기
        </button>
      </div>

      {/* 하단 고정 버튼 */}
      <div
        style={{
          position: "fixed", left: "50%", bottom: 0, transform: `translateX(-50%) translateY(${showBar ? "0" : "110%"})`,
          width: "min(100%, 430px)", padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
          background: "linear-gradient(180deg, rgba(11,3,5,0) 0%, rgba(11,3,5,.92) 38%)", transition: "transform .3s ease", zIndex: 40, pointerEvents: showBar ? "auto" : "none",
        }}
      >
        <Link
          href={href(`/saju/${MAIN_SLUG}`)}
          onClick={() => track("sticky", MAIN_SLUG)}
          className="wl-cta"
        >
          <span className="wl-cta-shine" aria-hidden />
          <span className="wl-cta-label">홍연에게 사주 보러가기</span>
          <svg className="wl-cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  );
}

// 스크롤 안내 화살표(금빛 겹화살표, 위아래로 움직임) — 위·아래 두 곳에서 같은 모양으로 사용
function ScrollArrows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "wlArrow 1.5s ease-in-out infinite" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: -20, filter: "drop-shadow(0 0 6px rgba(255,211,106,.7))", animation: "wlArrowFade 1.5s ease-in-out infinite" }}><path d="m6 9 6 6 6-6" /></svg>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,211,106,.7))", animation: "wlArrowFade 1.5s ease-in-out .25s infinite" }}><path d="m6 9 6 6 6-6" /></svg>
    </div>
  );
}

// 화면에 보일 때만 재생하는 반복 영상(무음)
function LoopVideo({ src, poster, ratio }: { src: string; poster: string; ratio: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      style={{ display: "block", width: "100%", aspectRatio: ratio, objectFit: "cover", background: "#000" }}
    />
  );
}

function Badges({ card, size }: { card: CategoryCard; size: number }) {
  const pill: React.CSSProperties = { display: "inline-block", fontSize: size, fontWeight: 700, padding: `1px ${size - 3}px`, borderRadius: 20 };
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
      {card.tag && <span style={{ ...pill, background: card.tag === "BEST" ? GOLD : card.tag === "HOT" ? "#ff4500" : card.tag === "NEW" ? "#4fd5e8" : card.tag === "추천" ? "#00ff73" : "rgba(255,255,255,.22)", color: card.tag === "BEST" || card.tag === "NEW" || card.tag === "추천" ? "#000" : "#fff" }}>{card.tag}</span>}
      <span style={{ ...pill, background: BADGE_COLORS[card.badge] ?? "#711b20", color: BADGE_DARK_TEXT.includes(card.badge) ? "#000" : "#fff" }}>{card.badge}</span>
    </div>
  );
}

function CardName({ name, size }: { name: string; size: number }) {
  const i = name.indexOf(" ");
  if (i === -1) return <p style={{ color: "#fff", fontWeight: 800, fontSize: size, lineHeight: 1.25, margin: 0 }}>{name}</p>;
  return (
    <p style={{ fontSize: size, lineHeight: 1.25, margin: 0 }}>
      <span style={{ fontWeight: 400 }}>{name.slice(0, i)} </span>
      <span style={{ fontWeight: 800 }}>{name.slice(i + 1)}</span>
    </p>
  );
}

// 붓으로 그린 듯한 금빛 체크 표시(가장자리를 살짝 거칠게 해서 손으로 쓴 느낌)
function BrushCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden style={{ overflow: "visible", filter: "drop-shadow(0 0 10px rgba(255,190,70,.45))" }}>
      <defs>
        <linearGradient id="wlBrushGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset="0.45" stopColor="#FFD36A" />
          <stop offset="1" stopColor="#C98A1E" />
        </linearGradient>
        <filter id="wlBrushRough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
      </defs>
      <path
        filter="url(#wlBrushRough)"
        fill="url(#wlBrushGold)"
        d="M7 34 C10 30 16 31 19 35 L25 43 C33 30 44 18 58 9 C60 8 61.5 9.5 60 11 C48 23 39 36 30 53 C28 57 23 57 20.5 53.5 L8 38.5 C6.5 37 6 35.5 7 34 Z"
      />
    </svg>
  );
}

// 상품 카드를 옆으로 흘려보내는 줄. 손가락·마우스가 닿으면 멈추고 직접 밀어서 볼 수 있다.
function Marquee({ slugs, dir, speed, href, track }: { slugs: string[]; dir: 1 | -1; speed: number; href: (p: string) => string; track: (place: string, slug: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const init = () => { if (dir === -1) el.scrollLeft = el.scrollWidth / 2; };
    init();
    let acc = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(64, now - last); // 프레임이 느려도 속도는 일정하게(초당 px)
      last = now;
      if (!paused.current) {
        const half = el.scrollWidth / 2;
        acc += (speed * dt / 1000) * dir;
        // scrollLeft는 소수점이 버려질 수 있어 모았다가 정수 단위로 적용
        if (Math.abs(acc) >= 1) {
          el.scrollLeft += Math.trunc(acc);
          acc -= Math.trunc(acc);
        }
        if (half > 0) {
          if (dir === 1 && el.scrollLeft >= half) el.scrollLeft -= half;
          if (dir === -1 && el.scrollLeft <= 0) el.scrollLeft += half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dir, speed]);

  const pause = () => { paused.current = true; if (resumeTimer.current) clearTimeout(resumeTimer.current); };
  const resume = (delay = 1600) => { if (resumeTimer.current) clearTimeout(resumeTimer.current); resumeTimer.current = setTimeout(() => { paused.current = false; }, delay); };

  const items = slugs.map((slug) => ({ slug, card: CARD_BY_SLUG[slug] })).filter((x) => x.card);
  return (
    <div
      ref={ref}
      className="wl-scroll"
      onTouchStart={pause}
      onTouchEnd={() => resume()}
      onMouseEnter={pause}
      onMouseLeave={() => resume(300)}
      style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 18px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      {[0, 1].map((copy) =>
        items.map(({ slug, card }) => (
          <div key={copy + slug} aria-hidden={copy === 1 ? true : undefined} style={{ flexShrink: 0, width: 132 }}>
            <MiniCard card={card} slug={slug} href={href(`/saju/${slug}`)} onClick={() => track("marquee", slug)} tab={copy === 1 ? -1 : 0} />
          </div>
        ))
      )}
    </div>
  );
}

function MiniCard({ card, slug, href, onClick, tab }: { card: CategoryCard; slug: string; href: string; onClick: () => void; tab: number }) {
  return (
    <Link href={href} onClick={onClick} tabIndex={tab} draggable={false} className="wl-card" style={{ display: "block", position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", background: "#1a1a1a" }}>
      <img src={`/media/welcome/cards/${slug}.jpg`} alt={card.name} draggable={false} width={396} height={528} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" decoding="async" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,.9))" }} />
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 8 }}>
        <Badges card={card} size={9} />
        <CardName name={card.name} size={14} />
      </div>
    </Link>
  );
}
