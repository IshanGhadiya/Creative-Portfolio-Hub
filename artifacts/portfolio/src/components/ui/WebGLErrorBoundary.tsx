import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
    return true;
  } catch { return false; }
}

interface WebGLGuardProps { children: ReactNode; fallback?: ReactNode; }

export function WebGLGuard({ children, fallback }: WebGLGuardProps) {
  const [state, setState] = useState<"pending" | "ok" | "failed">("pending");
  const onContextLost = useCallback(() => setState("failed"), []);
  useEffect(() => {
    if (!checkWebGLSupport()) { setState("failed"); return; }
    setState("ok");
    const onLost = (e: Event) => {
      if ((e.target as HTMLElement)?.tagName === "CANVAS") onContextLost();
    };
    document.addEventListener("webglcontextlost", onLost, true);
    return () => document.removeEventListener("webglcontextlost", onLost, true);
  }, [onContextLost]);
  if (state === "pending") return null;
  if (state === "failed") return <>{fallback ?? <CSSFallbackScene />}</>;
  return <>{children}</>;
}

/* ─── JARVIS HUD — interactive ────────────────────────────────────────────── */

interface Ripple { x: number; y: number; t: number; }

export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse        = useRef({ x: 0.5, y: 0.5 });
  const smooth       = useRef({ x: 0.5, y: 0.5 });
  const ripples      = useRef<Ripple[]>([]);
  const clock        = useRef(0);
  const raf          = useRef(0);

  /* mouse move */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    const onClick = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: clock.current });
    };
    const el = containerRef.current;
    if (el) { el.addEventListener("mousemove", onMove); el.addEventListener("click", onClick); }
    return () => { if (el) { el.removeEventListener("mousemove", onMove); el.removeEventListener("click", onClick); } };
  }, []);

  /* draw loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      clock.current += 0.016;
      const T = clock.current;

      /* smooth mouse → velocity proxy */
      const s = smooth.current;
      const m = mouse.current;
      const velX = m.x - s.x;
      const velY = m.y - s.y;
      const velSpeed = Math.sqrt(velX * velX + velY * velY);  // 0..~0.05
      s.x += velX * 0.06;
      s.y += velY * 0.06;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* normalized mouse offset */
      const mx = (s.x - 0.5) * 2;  // −1…1
      const my = (s.y - 0.5) * 2;

      /* distance & angle from HUD center */
      const distFromCenter = Math.min(Math.sqrt(mx * mx + my * my), 1);
      const mouseAngle     = Math.atan2(my, mx);

      /* parallax offset */
      const ox = mx * 22;
      const oy = my * 16;
      const cx = W / 2 + ox;
      const cy = H / 2 + oy;

      /* sizing */
      const R     = Math.min(W, H) * 0.41;
      const bandW = R * 0.27;
      const innerR = R - bandW;

      /* derived interactive values */
      const radarSpeed    = 0.62 + velSpeed * 18;          // faster when mouse moves fast
      const innerSpin     = 1.55 + (1 - distFromCenter) * 2.2; // faster when near center
      const goldArcOffset = mouseAngle * 0.35;             // gold arc drifts toward mouse
      const tiltScale     = 1 + distFromCenter * 0.08;     // subtle scale push

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(tiltScale, tiltScale);

      /* ── 1. Background ── */
      {
        const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
        bg.addColorStop(0, "#080d14");
        bg.addColorStop(0.55, "#050a10");
        bg.addColorStop(1, "#020406");
        ctx.fillStyle = bg;
        ctx.fillRect(-cx / tiltScale, -cy / tiltScale, W / tiltScale, H / tiltScale);
      }

      /* ── 2. Blueprint grid (clipped) ── */
      {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, innerR - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = "rgba(0,160,210,0.055)";
        ctx.lineWidth = 0.5;
        const step = 20;
        ctx.beginPath();
        for (let x = -innerR; x <= innerR; x += step) { ctx.moveTo(x, -innerR); ctx.lineTo(x, innerR); }
        for (let y = -innerR; y <= innerR; y += step) { ctx.moveTo(-innerR, y); ctx.lineTo(innerR, y); }
        ctx.stroke();
        ctx.restore();
      }

      /* ── 3. Outer glow ── */
      {
        const g = ctx.createRadialGradient(0, 0, R * 0.92, 0, 0, R * 1.22);
        g.addColorStop(0, "rgba(0,200,240,0.22)");
        g.addColorStop(1, "rgba(0,200,240,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.22, 0, Math.PI * 2);
        ctx.arc(0, 0, R * 0.92, 0, Math.PI * 2, true);
        ctx.fill();
      }

      /* ── 4. Thick outer ring — 3D bevel ── */
      {
        const rg = ctx.createRadialGradient(0, 0, innerR, 0, 0, R + 4);
        rg.addColorStop(0,    "rgba(0,240,255,1)");
        rg.addColorStop(0.04, "rgba(0,60,90,0.97)");
        rg.addColorStop(0.28, "rgba(0,28,50,0.97)");
        rg.addColorStop(0.58, "rgba(0,40,65,0.95)");
        rg.addColorStop(0.80, "rgba(0,110,160,0.82)");
        rg.addColorStop(0.94, "rgba(0,80,130,0.7)");
        rg.addColorStop(1,    "rgba(0,50,90,0.4)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, R + 4, 0, Math.PI * 2);
        ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
        ctx.fill();
      }

      /* ── 5. Inner rim ── */
      {
        const rimAlpha = 0.85 + distFromCenter * 0.15;
        ctx.strokeStyle = `rgba(0,240,255,${rimAlpha.toFixed(2)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* ── 6. Outer hard rim ── */
      ctx.strokeStyle = "rgba(0,180,230,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, R + 3, 0, Math.PI * 2);
      ctx.stroke();

      /* ── 7. Ruler tick marks (react to velocity — slightly brighter when moving) ── */
      {
        const boost = 1 + velSpeed * 15;
        const rulerR = innerR + 6;
        const tickCount = 300;
        for (let i = 0; i < tickCount; i++) {
          const angle = (i / tickCount) * Math.PI * 2;
          const major = i % 25 === 0;
          const med   = i % 5 === 0 && !major;
          const tLen  = major ? 15 : med ? 9 : 4;
          const base  = major ? 0.9 : med ? 0.5 : 0.22;
          const alpha = Math.min(base * boost, 1);
          ctx.save();
          ctx.rotate(angle);
          ctx.strokeStyle = `rgba(0,220,255,${alpha.toFixed(2)})`;
          ctx.lineWidth = major ? 1.3 : 0.6;
          ctx.beginPath();
          ctx.moveTo(rulerR, 0);
          ctx.lineTo(rulerR + tLen, 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      /* ── 8. Notch brackets ── */
      {
        Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2).forEach(angle => {
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = "rgba(0,200,240,0.55)";
          ctx.fillRect(R - 2, -6, 16, 12);
          ctx.fillStyle = "rgba(0,240,255,0.9)";
          ctx.fillRect(R - 2, -1.5, 16, 3);
          ctx.restore();
        });
      }

      /* ── 9. Gold accent arc — tracks mouse angle ── */
      {
        const arcR = innerR + bandW * 0.48;
        ctx.save();
        ctx.rotate(goldArcOffset);
        ctx.shadowColor = "rgba(255,170,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(255,175,0,0.92)";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, arcR, Math.PI * 1.28, Math.PI * 1.82);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      /* ── 10. Gold status dots ── */
      {
        const dotR = innerR + bandW * 0.52;
        for (let i = 0; i < 7; i++) {
          const angle = -Math.PI / 2 + (i - 3) * 0.044;
          const blink = Math.sin(T * 2.2 + i * 0.9) > 0.2;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = blink ? "rgba(255,210,0,0.92)" : "rgba(255,180,0,0.35)";
          ctx.shadowColor = "rgba(255,200,0,0.7)";
          ctx.shadowBlur = blink ? 6 : 2;
          ctx.beginPath();
          ctx.arc(dotR, 0, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      /* ── 11. Radar sweep — speed driven by mouse velocity ── */
      {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, innerR - 4, 0, Math.PI * 2);
        ctx.clip();

        const sweep = ((T * radarSpeed) % (Math.PI * 2));
        for (let i = 0; i < 50; i++) {
          const ratio = i / 50;
          const angle = sweep - ratio * Math.PI * 0.52;
          ctx.save();
          ctx.rotate(angle);
          ctx.strokeStyle = `rgba(0,220,255,${((1 - ratio) * 0.06).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(innerR - 6, 0);
          ctx.stroke();
          ctx.restore();
        }
        ctx.save();
        ctx.rotate(sweep);
        const lg = ctx.createLinearGradient(0, 0, innerR - 6, 0);
        lg.addColorStop(0, "rgba(0,240,255,0.95)");
        lg.addColorStop(1, "rgba(0,240,255,0.04)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(innerR - 6, 0);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      }

      /* ── 12. Inner content rings ── */
      [
        { r: innerR * 0.82, alpha: 0.18, lw: 0.8 },
        { r: innerR * 0.64, alpha: 0.22, lw: 0.8 },
        { r: innerR * 0.46, alpha: 0.35, lw: 1.0 },
      ].forEach(ring => {
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,200,240,${ring.alpha})`;
        ctx.lineWidth = ring.lw;
        ctx.stroke();
      });

      /* ── 13. Rotating arc segments ── */
      {
        const rr   = innerR * 0.64;
        const base = T * 0.28;
        const segs: [number, number][] = [
          [base, base + Math.PI * 0.55],
          [base + Math.PI * 0.75, base + Math.PI * 1.18],
          [base + Math.PI * 1.38, base + Math.PI * 1.85],
        ];
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(0,220,255,0.62)";
        segs.forEach(([s, e]) => {
          ctx.beginPath();
          ctx.arc(0, 0, rr, s, e);
          ctx.stroke();
          [s, e].forEach(ang => {
            ctx.save();
            ctx.rotate(ang);
            ctx.fillStyle = "rgba(0,240,255,0.9)";
            ctx.beginPath();
            ctx.arc(rr, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        });
      }

      /* ── 14. Counter-rotating arc ── */
      {
        const rr   = innerR * 0.46;
        const base = -T * 0.38 + 1.0;
        [[base, base + Math.PI * 0.72], [base + Math.PI, base + Math.PI * 1.6]].forEach(([s, e]) => {
          ctx.beginPath();
          ctx.arc(0, 0, rr, s, e);
          ctx.strokeStyle = "rgba(0,190,255,0.42)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
      }

      /* ── 15. Arc reactor core — spin speed driven by mouse proximity ── */
      {
        const rr = innerR * 0.28;
        const g  = ctx.createRadialGradient(0, 0, rr * 0.5, 0, 0, rr * 1.7);
        g.addColorStop(0, "rgba(0,240,255,0.15)");
        g.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rr * 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,240,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.rotate(T * innerSpin);
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.arc(0, 0, rr * 0.72, -0.22, 0.22);
          ctx.strokeStyle = "rgba(0,240,255,0.65)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.rotate(-T * 0.4);
        ctx.strokeStyle = "rgba(0,240,255,0.3)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.beginPath();
          ctx.moveTo(rr * 0.42, 0);
          ctx.lineTo(rr * 0.93, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      /* ── 16. Central core ── */
      {
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 26);
        cg.addColorStop(0,   "rgba(255,255,255,1)");
        cg.addColorStop(0.2, "rgba(200,245,255,0.95)");
        cg.addColorStop(0.6, "rgba(0,240,255,0.5)");
        cg.addColorStop(1,   "rgba(0,240,255,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 17. Data blink readout ── */
      {
        const rr = innerR + bandW * 0.28;
        for (let i = 0; i < 28; i++) {
          const angle = -Math.PI / 2 + (-14 + i) * 0.038;
          const blink = Math.sin(T * 3.5 + i * 0.65);
          const alpha = blink > 0.4 ? 0.85 : blink > -0.1 ? 0.35 : 0.1;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = `rgba(0,220,255,${alpha})`;
          ctx.fillRect(rr - 1, -1, 3, 2);
          ctx.restore();
        }
      }

      /* ── 18. Click ripple waves ── */
      {
        ripples.current = ripples.current.filter(r => T - r.t < 1.6);
        for (const rp of ripples.current) {
          const age      = T - rp.t;
          const progress = age / 1.6;
          const rpx      = rp.x - cx / tiltScale;
          const rpy      = rp.y - cy / tiltScale;

          for (let ring = 0; ring < 3; ring++) {
            const delay  = ring * 0.22;
            const p      = Math.max(0, progress - delay / 1.6);
            if (p <= 0) continue;
            const radius = p * innerR * 1.15;
            const alpha  = (1 - p) * (0.7 - ring * 0.18);
            ctx.beginPath();
            ctx.arc(rpx, rpy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,240,255,${alpha.toFixed(2)})`;
            ctx.lineWidth = 2 - ring * 0.5;
            ctx.stroke();
          }

          /* flash at click point */
          if (progress < 0.15) {
            const a = (1 - progress / 0.15) * 0.8;
            const fg = ctx.createRadialGradient(rpx, rpy, 0, rpx, rpy, 20);
            fg.addColorStop(0, `rgba(0,240,255,${a.toFixed(2)})`);
            fg.addColorStop(1, "rgba(0,240,255,0)");
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.arc(rpx, rpy, 20, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      /* ── 19. HUD crosshair cursor ── */
      {
        const curX = (mouse.current.x - 0.5) * W - ox;
        const curY = (mouse.current.y - 0.5) * H - oy;
        const hoverRing = Math.abs(Math.sqrt(curX * curX + curY * curY) - innerR) < 10;
        const ca = hoverRing ? 0.9 : 0.45;

        ctx.strokeStyle = `rgba(0,240,255,${ca})`;
        ctx.lineWidth = 1;
        const sz = 7;
        const gap = 3;
        ctx.beginPath();
        ctx.moveTo(curX - sz - gap, curY); ctx.lineTo(curX - gap, curY);
        ctx.moveTo(curX + gap, curY);      ctx.lineTo(curX + sz + gap, curY);
        ctx.moveTo(curX, curY - sz - gap); ctx.lineTo(curX, curY - gap);
        ctx.moveTo(curX, curY + gap);      ctx.lineTo(curX, curY + sz + gap);
        ctx.stroke();

        ctx.fillStyle = `rgba(0,240,255,${ca})`;
        ctx.beginPath();
        ctx.arc(curX, curY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        /* ring highlight when cursor hovers over rim */
        if (hoverRing) {
          ctx.strokeStyle = "rgba(0,240,255,0.25)";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, innerR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
      raf.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      const el = containerRef.current;
      if (!el || !canvas) return;
      canvas.width = el.clientWidth;
      canvas.height = el.clientHeight;
    };
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    resize();
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden cursor-none" style={{ height }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
