"use client";

import { useEffect, useRef } from "react";

const GOLD_COLORS = [
  "#FFD700","#FFC200","#FFDF00","#D4AF37",
  "#C9A84C","#F5C518","#FFE066","#E8C84A",
];
const rg = () => GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];

interface Dust {
  x: number; y: number; r: number;
  opacity: number; speedX: number; speedY: number;
  rotation: number; rotSpeed: number;
  flicker: number; flickerSpeed: number;
  type: "circle" | "diamond" | "line";
  length: number; color: string;
}

export function GoldDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = () => canvas.width || 480;
    const H = () => canvas.height || 900;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const dusts: Dust[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      r: Math.random() * 3.5 + 0.8,
      opacity: Math.random() * 0.65 + 0.2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -(Math.random() * 0.7 + 0.15),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.05 + 0.01,
      type: (["circle","diamond","line"] as Dust["type"][])[Math.floor(Math.random() * 3)],
      length: Math.random() * 10 + 4,
      color: rg(),
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      dusts.forEach((p) => {
        p.flicker += p.flickerSpeed;
        p.rotation += p.rotSpeed;
        const a = p.opacity * (0.5 + 0.5 * Math.sin(p.flicker));

        ctx.save();
        ctx.globalAlpha = a;

        if (p.type === "circle") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
          g.addColorStop(0, "#FFFACD");
          g.addColorStop(0.35, p.color);
          g.addColorStop(1, "rgba(212,175,55,0)");
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();

        } else if (p.type === "diamond") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -p.r * 2); ctx.lineTo(p.r * 1.1, 0);
          ctx.lineTo(0, p.r * 2); ctx.lineTo(-p.r * 1.1, 0);
          ctx.closePath();
          const g2 = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r);
          g2.addColorStop(0, "#FFFACD"); g2.addColorStop(0.5, p.color); g2.addColorStop(1, "#B8860B");
          ctx.fillStyle = g2; ctx.fill(); ctx.restore();

        } else {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
          const g3 = ctx.createLinearGradient(-p.length / 2, 0, p.length / 2, 0);
          g3.addColorStop(0, "rgba(212,175,55,0)");
          g3.addColorStop(0.5, p.color);
          g3.addColorStop(1, "rgba(212,175,55,0)");
          ctx.strokeStyle = g3; ctx.lineWidth = Math.random() * 1.2 + 0.3;
          ctx.beginPath(); ctx.moveTo(-p.length / 2, 0); ctx.lineTo(p.length / 2, 0); ctx.stroke();
          ctx.restore();
        }

        ctx.restore();

        p.x += p.speedX + Math.sin(p.flicker * 0.4) * 0.25;
        p.y += p.speedY;
        if (p.y < -20) { p.y = H() + 20; p.x = Math.random() * W(); }
        if (p.x < -20) p.x = W() + 20;
        if (p.x > W() + 20) p.x = -20;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}
