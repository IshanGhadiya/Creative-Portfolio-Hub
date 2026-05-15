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

export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coreRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const animate = () => {
      const target = mouseRef.current;
      const cur = currentRef.current;
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;

      const dx = (cur.x - 0.5) * 2;
      const dy = (cur.y - 0.5) * 2;

      if (outerRef.current) {
        outerRef.current.style.transform = `perspective(900px) rotateX(${dy * -22}deg) rotateY(${dx * 22}deg)`;
      }

      ringRefs.current.forEach((ring, i) => {
        if (!ring) return;
        const depth = (i + 1) * 0.35;
        const base = [0, 45, 20, 70, 10][i] ?? 0;
        ring.style.transform = `translate(${dx * depth * 18}px, ${dy * depth * 18}px) rotate(${base + cur.x * 12}deg)`;
      });

      particleRefs.current.forEach((p, i) => {
        if (!p) return;
        const angle = (i / particleRefs.current.length) * Math.PI * 2;
        const r = 40 + (i % 3) * 30;
        const px = Math.cos(angle) * r + dx * (10 + i * 2);
        const py = Math.sin(angle) * r + dy * (10 + i * 2);
        p.style.transform = `translate(${px}px, ${py}px)`;
        p.style.opacity = String(0.25 + Math.abs(dx) * 0.35);
      });

      if (coreRef.current) {
        const scale = 1 + (Math.abs(dx) + Math.abs(dy)) * 0.12;
        const g = 15 + (Math.abs(dx) + Math.abs(dy)) * 18;
        coreRef.current.style.transform = `scale(${scale})`;
        coreRef.current.style.boxShadow = `0 0 ${g}px #00f0ff, 0 0 ${g * 2}px rgba(0,240,255,0.4)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const el = containerRef.current;
    if (el) el.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (el) el.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rings = [
    { size: 340, border: "1px solid rgba(0,240,255,0.1)",  shadow: "" },
    { size: 260, border: "1px solid rgba(0,240,255,0.15)", shadow: "0 0 30px rgba(0,240,255,0.03)" },
    { size: 190, border: "1px solid rgba(255,0,127,0.12)", shadow: "" },
    { size: 130, border: "1px solid rgba(0,240,255,0.25)", shadow: "0 0 20px rgba(0,240,255,0.05)" },
    { size: 80,  border: "2px solid rgba(0,240,255,0.4)",  shadow: "0 0 15px rgba(0,240,255,0.08)" },
    { size: 50,  border: "1px solid rgba(255,0,127,0.3)",  shadow: "" },
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    size: 2 + (i % 3),
    color: i % 3 === 1 ? "#ff007f" : "#00f0ff",
  }));

  const stars = [
    { x: "8%",  y: "12%", size: 1.5, color: "#00f0ff", d: "0s" },
    { x: "82%", y: "18%", size: 2,   color: "#ffffff", d: "0.8s" },
    { x: "25%", y: "75%", size: 1,   color: "#00f0ff", d: "1.5s" },
    { x: "70%", y: "68%", size: 2.5, color: "#ff007f", d: "0.3s" },
    { x: "48%", y: "88%", size: 1,   color: "#ffffff", d: "2.1s" },
    { x: "92%", y: "45%", size: 1.5, color: "#00f0ff", d: "1.0s" },
    { x: "15%", y: "40%", size: 2,   color: "#ffffff", d: "0.6s" },
    { x: "60%", y: "10%", size: 1,   color: "#ff007f", d: "1.8s" },
    { x: "35%", y: "55%", size: 1,   color: "#00f0ff", d: "2.5s" },
    { x: "75%", y: "85%", size: 1.5, color: "#ffffff", d: "1.2s" },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden cursor-crosshair select-none"
      style={{ height, background: "radial-gradient(ellipse at 65% 50%, #111128 0%, #0a0a0c 70%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${s.size}px`, height: `${s.size}px`,
              left: s.x, top: s.y,
              background: s.color,
              boxShadow: `0 0 ${s.size * 4}px ${s.color}`,
              animation: `starBlink ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: s.d,
            }}
          />
        ))}
      </div>

      <div
        ref={outerRef}
        className="relative flex items-center justify-center"
        style={{ willChange: "transform" }}
      >
        {rings.map((ring, i) => (
          <div
            key={i}
            ref={el => { ringRefs.current[i] = el; }}
            className="absolute rounded-sm"
            style={{
              width: `${ring.size}px`, height: `${ring.size}px`,
              border: ring.border,
              boxShadow: ring.shadow || undefined,
              willChange: "transform",
            }}
          />
        ))}

        {particles.map((p, i) => (
          <div
            key={`p-${i}`}
            ref={el => { particleRefs.current[i] = el; }}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`, height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              willChange: "transform, opacity",
            }}
          />
        ))}

        <div
          ref={coreRef}
          className="w-5 h-5 rounded-full bg-[#00f0ff] relative z-10"
          style={{ boxShadow: "0 0 15px #00f0ff, 0 0 35px rgba(0,240,255,0.5)", willChange: "transform, box-shadow" }}
        />
      </div>

      <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[3px] pointer-events-none select-none" style={{ color: "rgba(0,240,255,0.2)" }}>
        move cursor
      </div>

      <style>{`
        @keyframes starBlink { 0%,100%{opacity:.1} 50%{opacity:.7} }
      `}</style>
    </div>
  );
}
