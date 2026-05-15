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

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return a + d * t;
};

interface Ripple { x: number; y: number; born: number; }

/* ─── JARVIS HUD ──────────────────────────────────────────────────────────── */
export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* raw inputs */
  const mouse   = useRef({ x: 0.5, y: 0.5 });
  const ripples = useRef<Ripple[]>([]);

  /* smoothed state — all values lerped every frame */
  const sm = useRef({
    mx: 0, my: 0,            // smoothed normalised mouse offset (−1…1)
    velSpeed: 0,             // mouse speed proxy
    dist: 0.5,               // dist from HUD centre
    angle: 0,                // mouse angle
    radarSpeed: 0.62,        // current radar sweep ω
    innerSpin: 1.55,         // reactor blade ω
    tiltScale: 1,            // subtle scale push
    goldArc: 0,              // gold arc angular offset
    rimAlpha: 0.85,          // inner rim brightness
    tickBoost: 1,            // ruler brightness multiplier
  });

  /* accumulated rotation angles — incremented each frame by real dt */
  const ang = useRef({
    sweep: 0,     // radar
    seg1: 0,      // mid arc ring (CW)
    seg2: 0,      // outer arc (CCW)
    blade: 0,     // reactor 6-blade
    arm: 0,       // reactor 3-arm (CCW)
  });

  /* timing */
  const lastTime = useRef<number | null>(null);
  const clock    = useRef(0);   // total elapsed (for blink effects)
  const raf      = useRef(0);

  /* event listeners */
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
      ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, born: clock.current });
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

    const draw = (now: number) => {
      /* real delta time — capped at 50ms to avoid big jumps after tab-switch */
      if (lastTime.current === null) lastTime.current = now;
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;
      clock.current += dt;
      const T = clock.current;

      /* ── update smoothed values ── */
      const rawMx = (mouse.current.x - 0.5) * 2;
      const rawMy = (mouse.current.y - 0.5) * 2;

      const prevMx = sm.current.mx;
      const prevMy = sm.current.my;
      sm.current.mx = lerp(sm.current.mx, rawMx, 1 - Math.pow(0.002, dt));
      sm.current.my = lerp(sm.current.my, rawMy, 1 - Math.pow(0.002, dt));

      /* velocity from smoothed delta */
      const velX = (sm.current.mx - prevMx) / dt;
      const velY = (sm.current.my - prevMy) / dt;
      const rawVel = Math.min(Math.sqrt(velX * velX + velY * velY), 3);
      sm.current.velSpeed  = lerp(sm.current.velSpeed,  rawVel, 1 - Math.pow(0.01, dt));

      const rawDist  = Math.min(Math.sqrt(rawMx * rawMx + rawMy * rawMy), 1);
      const rawAngle = Math.atan2(rawMy, rawMx);
      sm.current.dist  = lerp(sm.current.dist,  rawDist,  1 - Math.pow(0.002, dt));
      sm.current.angle = lerpAngle(sm.current.angle, rawAngle, 1 - Math.pow(0.001, dt));

      /* derived targets */
      const targetRadar = 0.62 + sm.current.velSpeed * 0.38;
      const targetSpin  = 1.55 + (1 - sm.current.dist) * 2.0;
      const targetScale = 1 + sm.current.dist * 0.06;
      const targetGold  = sm.current.angle * 0.35;
      const targetRim   = 0.85 + sm.current.dist * 0.15;
      const targetTick  = 1 + sm.current.velSpeed * 0.35;

      sm.current.radarSpeed = lerp(sm.current.radarSpeed, targetRadar, 1 - Math.pow(0.01, dt));
      sm.current.innerSpin  = lerp(sm.current.innerSpin,  targetSpin,  1 - Math.pow(0.005, dt));
      sm.current.tiltScale  = lerp(sm.current.tiltScale,  targetScale, 1 - Math.pow(0.003, dt));
      sm.current.goldArc    = lerpAngle(sm.current.goldArc, targetGold, 1 - Math.pow(0.003, dt));
      sm.current.rimAlpha   = lerp(sm.current.rimAlpha,   targetRim,  1 - Math.pow(0.005, dt));
      sm.current.tickBoost  = lerp(sm.current.tickBoost,  targetTick,  1 - Math.pow(0.01, dt));

      /* ── increment rotation angles by real dt ── */
      ang.current.sweep += sm.current.radarSpeed * dt;
      ang.current.seg1  += 0.28 * dt;
      ang.current.seg2  -= 0.38 * dt;
      ang.current.blade += sm.current.innerSpin * dt;
      ang.current.arm   -= 0.4 * dt;

      /* ── layout ── */
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const ts   = sm.current.tiltScale;
      const ox   = sm.current.mx * 22;
      const oy   = sm.current.my * 16;
      const cx   = W / 2 + ox;
      const cy   = H / 2 + oy;
      const R    = Math.min(W, H) * 0.41;
      const bandW = R * 0.27;
      const iR   = R - bandW;   // inner radius

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(ts, ts);

      const bx = -cx / ts, by = -cy / ts, bw = W / ts, bh = H / ts;

      /* 1 · background */
      {
        const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
        bg.addColorStop(0, "#080d14"); bg.addColorStop(0.55, "#050a10"); bg.addColorStop(1, "#020406");
        ctx.fillStyle = bg;
        ctx.fillRect(bx, by, bw, bh);
      }

      /* 2 · blueprint grid */
      {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, iR - 2, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = "rgba(0,160,210,0.055)"; ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = -iR; x <= iR; x += 20) { ctx.moveTo(x, -iR); ctx.lineTo(x, iR); }
        for (let y = -iR; y <= iR; y += 20) { ctx.moveTo(-iR, y); ctx.lineTo(iR, y); }
        ctx.stroke();
        ctx.restore();
      }

      /* 3 · outer glow halo */
      {
        const g = ctx.createRadialGradient(0, 0, R * 0.92, 0, 0, R * 1.22);
        g.addColorStop(0, "rgba(0,200,240,0.22)"); g.addColorStop(1, "rgba(0,200,240,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.22, 0, Math.PI * 2);
        ctx.arc(0, 0, R * 0.92, 0, Math.PI * 2, true); ctx.fill();
      }

      /* 4 · thick outer ring — 3D bevel */
      {
        const rg = ctx.createRadialGradient(0, 0, iR, 0, 0, R + 4);
        rg.addColorStop(0,    "rgba(0,240,255,1)");
        rg.addColorStop(0.04, "rgba(0,60,90,0.97)");
        rg.addColorStop(0.28, "rgba(0,28,50,0.97)");
        rg.addColorStop(0.58, "rgba(0,40,65,0.95)");
        rg.addColorStop(0.80, "rgba(0,110,160,0.82)");
        rg.addColorStop(0.94, "rgba(0,80,130,0.7)");
        rg.addColorStop(1,    "rgba(0,50,90,0.4)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, Math.PI * 2);
        ctx.arc(0, 0, iR, 0, Math.PI * 2, true); ctx.fill();
      }

      /* 5 · bright inner rim */
      ctx.strokeStyle = `rgba(0,240,255,${sm.current.rimAlpha.toFixed(2)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, iR, 0, Math.PI * 2); ctx.stroke();

      /* 6 · outer hard rim */
      ctx.strokeStyle = "rgba(0,180,230,0.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, R + 3, 0, Math.PI * 2); ctx.stroke();

      /* 7 · ruler tick marks */
      {
        const boost = sm.current.tickBoost;
        const rulerR = iR + 6;
        for (let i = 0; i < 300; i++) {
          const angle = (i / 300) * Math.PI * 2;
          const major = i % 25 === 0, med = i % 5 === 0 && !major;
          const tLen  = major ? 15 : med ? 9 : 4;
          const alpha = Math.min((major ? 0.9 : med ? 0.5 : 0.22) * boost, 1);
          ctx.save(); ctx.rotate(angle);
          ctx.strokeStyle = `rgba(0,220,255,${alpha.toFixed(2)})`;
          ctx.lineWidth = major ? 1.3 : 0.6;
          ctx.beginPath(); ctx.moveTo(rulerR, 0); ctx.lineTo(rulerR + tLen, 0); ctx.stroke();
          ctx.restore();
        }
      }

      /* 8 · notch brackets */
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate((i / 8) * Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,240,0.55)"; ctx.fillRect(R - 2, -6, 16, 12);
        ctx.fillStyle = "rgba(0,240,255,0.9)";  ctx.fillRect(R - 2, -1.5, 16, 3);
        ctx.restore();
      }

      /* 9 · gold arc — smoothly tracks mouse angle */
      {
        const arcR = iR + bandW * 0.48;
        ctx.save(); ctx.rotate(sm.current.goldArc);
        ctx.shadowColor = "rgba(255,170,0,0.8)"; ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(255,175,0,0.92)"; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(0, 0, arcR, Math.PI * 1.28, Math.PI * 1.82); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      /* 10 · gold status dots */
      {
        const dotR = iR + bandW * 0.52;
        for (let i = 0; i < 7; i++) {
          const angle = -Math.PI / 2 + (i - 3) * 0.044;
          const blink = Math.sin(T * 2.2 + i * 0.9) > 0.2;
          ctx.save(); ctx.rotate(angle);
          ctx.fillStyle = blink ? "rgba(255,210,0,0.92)" : "rgba(255,180,0,0.35)";
          ctx.shadowColor = "rgba(255,200,0,0.7)"; ctx.shadowBlur = blink ? 6 : 2;
          ctx.beginPath(); ctx.arc(dotR, 0, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      /* 11 · radar sweep — clipped, angle accumulated smoothly */
      {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, iR - 4, 0, Math.PI * 2); ctx.clip();
        const sweep = ang.current.sweep;
        for (let i = 0; i < 50; i++) {
          const ratio = i / 50;
          ctx.save(); ctx.rotate(sweep - ratio * Math.PI * 0.52);
          ctx.strokeStyle = `rgba(0,220,255,${((1 - ratio) * 0.055).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(iR - 6, 0); ctx.stroke();
          ctx.restore();
        }
        ctx.save(); ctx.rotate(sweep);
        const lg = ctx.createLinearGradient(0, 0, iR - 6, 0);
        lg.addColorStop(0, "rgba(0,240,255,0.95)"); lg.addColorStop(1, "rgba(0,240,255,0.04)");
        ctx.strokeStyle = lg; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(iR - 6, 0); ctx.stroke();
        ctx.restore();
        ctx.restore();
      }

      /* 12 · inner content rings */
      for (const [r, a, lw] of [[iR * 0.82, 0.18, 0.8], [iR * 0.64, 0.22, 0.8], [iR * 0.46, 0.35, 1.0]] as [number,number,number][]) {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,200,240,${a})`; ctx.lineWidth = lw; ctx.stroke();
      }

      /* 13 · rotating arc segments (mid ring) */
      {
        const rr = iR * 0.64, base = ang.current.seg1;
        const segs: [number, number][] = [
          [base, base + Math.PI * 0.55],
          [base + Math.PI * 0.75, base + Math.PI * 1.18],
          [base + Math.PI * 1.38, base + Math.PI * 1.85],
        ];
        ctx.strokeStyle = "rgba(0,220,255,0.62)"; ctx.lineWidth = 1.8;
        segs.forEach(([s, e]) => {
          ctx.beginPath(); ctx.arc(0, 0, rr, s, e); ctx.stroke();
          [s, e].forEach(a => {
            ctx.save(); ctx.rotate(a);
            ctx.fillStyle = "rgba(0,240,255,0.9)";
            ctx.beginPath(); ctx.arc(rr, 0, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          });
        });
      }

      /* 14 · counter-rotating arc */
      {
        const rr = iR * 0.46, base = ang.current.seg2;
        [[base, base + Math.PI * 0.72], [base + Math.PI, base + Math.PI * 1.6]].forEach(([s, e]) => {
          ctx.beginPath(); ctx.arc(0, 0, rr, s, e);
          ctx.strokeStyle = "rgba(0,190,255,0.42)"; ctx.lineWidth = 1.2; ctx.stroke();
        });
      }

      /* 15 · arc reactor core */
      {
        const rr = iR * 0.28;
        const g = ctx.createRadialGradient(0, 0, rr * 0.5, 0, 0, rr * 1.7);
        g.addColorStop(0, "rgba(0,240,255,0.15)"); g.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr * 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(0,240,255,0.9)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();

        ctx.save(); ctx.rotate(ang.current.blade);
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath(); ctx.arc(0, 0, rr * 0.72, -0.22, 0.22);
          ctx.strokeStyle = "rgba(0,240,255,0.65)"; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();

        ctx.save(); ctx.rotate(ang.current.arm);
        ctx.strokeStyle = "rgba(0,240,255,0.3)"; ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.beginPath(); ctx.moveTo(rr * 0.42, 0); ctx.lineTo(rr * 0.93, 0); ctx.stroke();
        }
        ctx.restore();
      }

      /* 16 · central core */
      {
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 26);
        cg.addColorStop(0, "rgba(255,255,255,1)"); cg.addColorStop(0.2, "rgba(200,245,255,0.95)");
        cg.addColorStop(0.6, "rgba(0,240,255,0.5)"); cg.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      }

      /* 17 · data blink readout */
      {
        const rr = iR + bandW * 0.28;
        for (let i = 0; i < 28; i++) {
          const angle = -Math.PI / 2 + (-14 + i) * 0.038;
          const blink = Math.sin(T * 3.5 + i * 0.65);
          const alpha = blink > 0.4 ? 0.85 : blink > -0.1 ? 0.35 : 0.1;
          ctx.save(); ctx.rotate(angle);
          ctx.fillStyle = `rgba(0,220,255,${alpha})`;
          ctx.fillRect(rr - 1, -1, 3, 2);
          ctx.restore();
        }
      }

      /* 18 · click ripple waves */
      {
        ripples.current = ripples.current.filter(r => T - r.born < 1.6);
        for (const rp of ripples.current) {
          const age = T - rp.born, dur = 1.6, progress = age / dur;
          const rpx = (rp.x - cx) / ts, rpy = (rp.y - cy) / ts;
          for (let ring = 0; ring < 3; ring++) {
            const delay = ring * 0.22;
            const p = Math.max(0, (age - delay) / dur);
            if (p <= 0) continue;
            const alpha = (1 - p) * (0.65 - ring * 0.18);
            ctx.beginPath(); ctx.arc(rpx, rpy, p * iR * 1.1, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,240,255,${alpha.toFixed(2)})`;
            ctx.lineWidth = 1.8 - ring * 0.4; ctx.stroke();
          }
          if (progress < 0.15) {
            const a = (1 - progress / 0.15) * 0.7;
            const fg = ctx.createRadialGradient(rpx, rpy, 0, rpx, rpy, 20);
            fg.addColorStop(0, `rgba(0,240,255,${a.toFixed(2)})`); fg.addColorStop(1, "rgba(0,240,255,0)");
            ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(rpx, rpy, 20, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      /* 19 · HUD crosshair cursor */
      {
        const curX = (mouse.current.x - 0.5) * W / ts - ox / ts;
        const curY = (mouse.current.y - 0.5) * H / ts - oy / ts;
        const onRim = Math.abs(Math.sqrt(curX * curX + curY * curY) - iR) < 12;
        const ca = onRim ? 0.9 : 0.42;
        ctx.strokeStyle = `rgba(0,240,255,${ca})`; ctx.lineWidth = 1;
        const sz = 7, gap = 3;
        ctx.beginPath();
        ctx.moveTo(curX - sz - gap, curY); ctx.lineTo(curX - gap, curY);
        ctx.moveTo(curX + gap, curY);      ctx.lineTo(curX + sz + gap, curY);
        ctx.moveTo(curX, curY - sz - gap); ctx.lineTo(curX, curY - gap);
        ctx.moveTo(curX, curY + gap);      ctx.lineTo(curX, curY + sz + gap);
        ctx.stroke();
        ctx.fillStyle = `rgba(0,240,255,${ca})`;
        ctx.beginPath(); ctx.arc(curX, curY, 1.5, 0, Math.PI * 2); ctx.fill();
        if (onRim) {
          ctx.strokeStyle = "rgba(0,240,255,0.22)"; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.arc(0, 0, iR, 0, Math.PI * 2); ctx.stroke();
        }
      }

      ctx.restore();
      raf.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      const el = containerRef.current;
      if (!el || !canvas) return;
      canvas.width = el.clientWidth; canvas.height = el.clientHeight;
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
