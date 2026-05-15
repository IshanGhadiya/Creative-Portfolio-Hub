import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<TrailPoint[]>([]);
  const mouse = useRef({ x: -200, y: -200 });
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      trail.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trail.current.length > 28) trail.current.shift();
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trail.current = trail.current
        .map(p => ({ ...p, age: p.age + 1 }))
        .filter(p => p.age < 30);

      for (let i = 0; i < trail.current.length; i++) {
        const p = trail.current[i];
        const progress = i / trail.current.length;
        const opacity = progress * (1 - p.age / 30) * 0.55;
        const radius = 3 + progress * 8;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.5);
        grd.addColorStop(0, `rgba(0,240,255,${(opacity * 0.9).toFixed(3)})`);
        grd.addColorStop(0.5, `rgba(0,200,220,${(opacity * 0.35).toFixed(3)})`);
        grd.addColorStop(1, "rgba(0,240,255,0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, radius * 0.25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${(opacity * 1.4).toFixed(3)})`;
        ctx.fill();
      }

      /* cursor dot */
      const { x, y } = mouse.current;
      if (x > 0) {
        const grd2 = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grd2.addColorStop(0, "rgba(0,240,255,0.18)");
        grd2.addColorStop(1, "rgba(0,240,255,0)");
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = grd2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255,0.9)";
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
