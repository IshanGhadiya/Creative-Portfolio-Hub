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
    if (!checkWebGLSupport()) {
      setState("failed");
      return;
    }
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

/* ─── Fibonacci sphere helper ─────────────────────────────────────────────── */
function fibSphere(n: number) {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}

const BASE_PTS = fibSphere(80);

export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ nx: 0.5, ny: 0.5 });
  const current = useRef({ rotX: 0.08, rotY: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mouse.current = {
        nx: (e.clientX - r.left) / r.width,
        ny: (e.clientY - r.top) / r.height,
      };
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

    let autoAngle = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const { nx, ny } = mouse.current;
      const cur = current.current;
      const targetX = 0.08 + (ny - 0.5) * 0.6;
      const targetY = autoAngle + (nx - 0.5) * 0.8;
      cur.rotX += (targetX - cur.rotX) * 0.04;
      cur.rotY += (targetY - cur.rotY) * 0.04;
      autoAngle += 0.004;

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.33;
      const focal = radius * 2.4;

      const cosX = Math.cos(cur.rotX), sinX = Math.sin(cur.rotX);
      const cosY = Math.cos(cur.rotY), sinY = Math.sin(cur.rotY);

      type Pt = { sx: number; sy: number; z: number; alpha: number };
      const projected: Pt[] = BASE_PTS.map(([x, y, z]) => {
        // rotate Y
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        // rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const scale = focal / (focal + z2 * radius);
        return {
          sx: cx + x1 * radius * scale,
          sy: cy + y2 * radius * scale,
          z: z2,
          alpha: 0.35 + (z2 + 1) * 0.32,
        };
      });

      /* edges — connect points that are close on the sphere surface */
      ctx.lineWidth = 0.6;
      for (let i = 0; i < BASE_PTS.length; i++) {
        const [ax, ay, az] = BASE_PTS[i];
        for (let j = i + 1; j < BASE_PTS.length; j++) {
          const [bx, by, bz] = BASE_PTS[j];
          const dist = Math.hypot(ax - bx, ay - by, az - bz);
          if (dist > 0.52) continue;
          const a = projected[i];
          const b = projected[j];
          const edgeAlpha = ((a.alpha + b.alpha) / 2) * 0.55 * (1 - dist / 0.52);
          const frontness = Math.max(0, (a.z + b.z) / 2);
          const r = Math.round(0 + frontness * 20);
          const g = Math.round(200 + frontness * 55);
          const bl = Math.round(220 + frontness * 35);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${edgeAlpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }

      /* nodes */
      for (const pt of projected) {
        const size = 1.6 + (pt.z + 1) * 1.8;
        const a = pt.alpha;

        /* glow */
        const grd = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, size * 4);
        grd.addColorStop(0, `rgba(0,240,255,${(a * 0.5).toFixed(2)})`);
        grd.addColorStop(1, "rgba(0,240,255,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, size * 4, 0, Math.PI * 2);
        ctx.fill();

        /* dot */
        ctx.fillStyle = `rgba(0,240,255,${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      /* accent ring */
      const ringR = radius * 1.12;
      const ringAngle = cur.rotY * 0.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ringAngle);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,0,127,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
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
      className="w-full relative overflow-hidden cursor-crosshair"
      style={{
        height,
        background: "radial-gradient(ellipse at 55% 50%, #0e0e1e 0%, #0a0a0c 70%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[3px] pointer-events-none select-none"
        style={{ color: "rgba(0,240,255,0.25)" }}
      >
        move cursor
      </div>
    </div>
  );
}
