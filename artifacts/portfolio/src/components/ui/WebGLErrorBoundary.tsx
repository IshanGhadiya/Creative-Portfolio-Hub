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
  } catch {
    return false;
  }
}

interface WebGLGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

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

/* ─── JARVIS HUD ──────────────────────────────────────────────────────────── */
export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const smooth = useRef({ x: 0.5, y: 0.5 });
  const clock = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    const el = containerRef.current;
    if (el) el.addEventListener("mousemove", onMove);
    return () => { if (el) el.removeEventListener("mousemove", onMove); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      clock.current += 0.016;
      const T = clock.current;

      const s = smooth.current;
      const m = mouse.current;
      s.x += (m.x - s.x) * 0.05;
      s.y += (m.y - s.y) * 0.05;
      const mx = (s.x - 0.5) * 2; // −1…1
      const my = (s.y - 0.5) * 2;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2 + mx * 22;
      const cy = H / 2 + my * 16;
      const R = Math.min(W, H) * 0.35;

      ctx.save();
      ctx.translate(cx, cy);

      /* ── 1. Background radial glow ── */
      {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
        g.addColorStop(0, "rgba(0,30,55,0.45)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(-cx, -cy, W, H);
      }

      /* ── 2. Hex grid ── */
      {
        const hr = 26;
        ctx.save();
        ctx.translate(-cx, -cy);
        ctx.strokeStyle = "rgba(0,200,240,0.04)";
        ctx.lineWidth = 0.5;
        const cols = Math.ceil(W / (hr * 1.73)) + 3;
        const rows = Math.ceil(H / (hr * 1.5)) + 3;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const hx = col * hr * 1.732 + (row % 2) * hr * 0.866;
            const hy = row * hr * 1.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (i * Math.PI) / 3 - Math.PI / 6;
              const px = hx + hr * Math.cos(a);
              const py = hy + hr * Math.sin(a);
              i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      /* ── 3. Dashed radial guide lines ── */
      {
        ctx.save();
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = "rgba(0,200,240,0.14)";
        ctx.lineWidth = 0.7;
        for (let i = 0; i < 8; i++) {
          ctx.save();
          ctx.rotate((i / 8) * Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(R * 0.24, 0);
          ctx.lineTo(R * 1.28, 0);
          ctx.stroke();
          ctx.restore();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      /* ── 4. Radar sweep ── */
      {
        const sweep = (T * 0.65) % (Math.PI * 2);
        // afterglow fan
        for (let i = 0; i < 50; i++) {
          const ratio = i / 50;
          const angle = sweep - ratio * Math.PI * 0.55;
          ctx.save();
          ctx.rotate(angle);
          ctx.strokeStyle = `rgba(0,220,255,${((1 - ratio) * 0.065).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(R * 1.28, 0);
          ctx.stroke();
          ctx.restore();
        }
        // sweep line
        ctx.save();
        ctx.rotate(sweep);
        const lg = ctx.createLinearGradient(0, 0, R * 1.28, 0);
        lg.addColorStop(0, "rgba(0,240,255,1)");
        lg.addColorStop(1, "rgba(0,240,255,0.05)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(R * 1.28, 0);
        ctx.stroke();
        ctx.fillStyle = "rgba(0,240,255,0.95)";
        ctx.beginPath();
        ctx.arc(R * 1.28, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* ── 5. Outer ring + 72 tick marks ── */
      {
        const rr = R * 1.28;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,190,230,0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let i = 0; i < 72; i++) {
          const angle = (i / 72) * Math.PI * 2;
          const major = i % 6 === 0;
          const inner = major ? rr - 10 : rr - 5;
          ctx.save();
          ctx.rotate(angle);
          ctx.strokeStyle = major ? "rgba(0,240,255,0.65)" : "rgba(0,200,240,0.22)";
          ctx.lineWidth = major ? 1.5 : 0.7;
          ctx.beginPath();
          ctx.moveTo(inner, 0);
          ctx.lineTo(rr + 1, 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      /* ── 6. Rotating arc ring A ── */
      {
        const rr = R * 0.92;
        const base = T * 0.28;
        const segs = [
          [base, base + Math.PI * 0.58],
          [base + Math.PI * 0.78, base + Math.PI * 1.18],
          [base + Math.PI * 1.38, base + Math.PI * 1.88],
        ];
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(0,220,255,0.62)";
        for (const [s, e] of segs) {
          ctx.beginPath();
          ctx.arc(0, 0, rr, s, e);
          ctx.stroke();
          // end-cap dots
          for (const angle of [s, e]) {
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = "rgba(0,240,255,0.9)";
            ctx.beginPath();
            ctx.arc(rr, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      /* ── 7. Counter-rotating arc ring B ── */
      {
        const rr = R * 0.72;
        const base = -T * 0.38 + 0.8;
        const segs = [
          [base, base + Math.PI * 0.75],
          [base + Math.PI, base + Math.PI * 1.65],
        ];
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(0,180,255,0.42)";
        for (const [s, e] of segs) {
          ctx.beginPath();
          ctx.arc(0, 0, rr, s, e);
          ctx.stroke();
        }
      }

      /* ── 8. Dashed inner ring with pointer arrows ── */
      {
        const rr = R * 0.54;
        ctx.save();
        ctx.setLineDash([5, 7]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,220,255,0.48)";
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 4 rotating arrow pointers
        ctx.save();
        ctx.rotate(T * 0.14);
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = "rgba(0,240,255,0.75)";
          ctx.beginPath();
          ctx.moveTo(rr - 7, -3.5);
          ctx.lineTo(rr + 3, 0);
          ctx.lineTo(rr - 7, 3.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      /* ── 9. Arc reactor inner ring ── */
      {
        const rr = R * 0.3;
        // Glow halo
        const g = ctx.createRadialGradient(0, 0, rr * 0.4, 0, 0, rr * 1.6);
        g.addColorStop(0, "rgba(0,240,255,0.14)");
        g.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rr * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Bright ring
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,240,255,0.88)";
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();

        // Spinning inner segments (6-blade)
        ctx.save();
        ctx.rotate(T * 1.6);
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.arc(0, 0, rr * 0.7, -0.22, 0.22);
          ctx.strokeStyle = "rgba(0,240,255,0.65)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();

        // Slow outer dividers (3-blade)
        ctx.save();
        ctx.rotate(-T * 0.4);
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.strokeStyle = "rgba(0,240,255,0.3)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(rr * 0.45, 0);
          ctx.lineTo(rr * 0.95, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      /* ── 10. Orbiting data dots ── */
      {
        const dots = [
          { r: R * 1.28, speed: 1.1, phase: 0 },
          { r: R * 0.92, speed: -0.9, phase: 2.1 },
          { r: R * 0.72, speed: 0.7, phase: 4.2 },
          { r: R * 0.54, speed: -1.3, phase: 1.0 },
        ];
        for (const d of dots) {
          const angle = T * d.speed + d.phase;
          const px = Math.cos(angle) * d.r;
          const py = Math.sin(angle) * d.r;
          const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, "rgba(0,240,255,0.75)");
          g.addColorStop(1, "rgba(0,240,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#00f0ff";
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── 11. HUD corner brackets ── */
      {
        const bd = R * 1.12;
        const bs = 20;
        const corners = [
          { x: -bd, y: -bd, sx: 1, sy: 1 },
          { x: bd,  y: -bd, sx: -1, sy: 1 },
          { x: -bd, y: bd,  sx: 1,  sy: -1 },
          { x: bd,  y: bd,  sx: -1, sy: -1 },
        ];
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(0,240,255,0.55)";
        for (const c of corners) {
          ctx.beginPath();
          ctx.moveTo(c.x + c.sx * bs, c.y);
          ctx.lineTo(c.x, c.y);
          ctx.lineTo(c.x, c.y + c.sy * bs);
          ctx.stroke();
          // corner dot
          ctx.fillStyle = "rgba(0,240,255,0.8)";
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── 12. Data readout arc (top) ── */
      {
        const rr = R * 1.42;
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = "rgba(0,200,240,0.28)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, rr, -Math.PI * 0.35, -Math.PI * 0.65, true);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Blinking readout dots along the arc
        for (let i = 0; i < 12; i++) {
          const ratio = i / 12;
          const angle = -Math.PI * 0.35 - ratio * Math.PI * 0.3;
          const blink = Math.sin(T * 3 + i * 0.7) > 0.3 ? 1 : 0.2;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillStyle = `rgba(0,240,255,${(0.2 + blink * 0.5).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(rr, 0, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      /* ── 13. Central reactor core ── */
      {
        const coreG = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
        coreG.addColorStop(0, "rgba(255,255,255,1)");
        coreG.addColorStop(0.25, "rgba(180,240,255,0.95)");
        coreG.addColorStop(0.6, "rgba(0,240,255,0.5)");
        coreG.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = coreG;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── 14. Mouse-reactive ping ring ── */
      {
        const dist = Math.sqrt(mx * mx + my * my);
        if (dist > 0.05) {
          const pingR = R * 0.42 + dist * 30;
          const alpha = 0.12 + dist * 0.12;
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(0,240,255,${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(0, 0, pingR, 0, Math.PI * 2);
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

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-crosshair"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
