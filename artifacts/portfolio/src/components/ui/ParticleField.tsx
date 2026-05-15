import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  r: number;
  alpha: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COUNT = 65;
    const CONNECT_DIST = 150;
    const MOUSE_CONNECT_DIST = 180;
    const REPEL_DIST = 100;
    const REPEL_FORCE = 0.18;

    const mouse = { x: -999, y: -999, active: false };
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx, vy,
          baseVx: vx,
          baseVy: vy,
          r: Math.random() * 1.6 + 0.5,
          alpha: Math.random() * 0.4 + 0.2,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; mouse.x = -999; mouse.y = -999; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    // also track on window so mouse moving over text still works
    window.addEventListener("mousemove", onMouseMove);

    let raf = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // repel from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < REPEL_DIST) {
          const force = (1 - dist / REPEL_DIST) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // drift back toward base velocity
        p.vx += (p.baseVx - p.vx) * 0.02;
        p.vy += (p.baseVy - p.vy) * 0.02;

        // clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.5) { p.vx = (p.vx / speed) * 2.5; p.vy = (p.vy / speed) * 2.5; }

        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // glow when near mouse
        const proximity = mouse.active ? Math.max(0, 1 - dist / REPEL_DIST) : 0;
        const glowAlpha = p.alpha + proximity * 0.5;
        const glowR = p.r + proximity * 1.5;

        if (proximity > 0) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 4);
          grd.addColorStop(0, `rgba(0,240,255,${(glowAlpha * 0.6).toFixed(2)})`);
          grd.addColorStop(1, "rgba(0,240,255,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${Math.min(glowAlpha, 0.9).toFixed(2)})`;
        ctx.fill();
      }

      // particle ↔ particle lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,200,255,${((1 - d / CONNECT_DIST) * 0.12).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // mouse ↔ nearby particle lines
      if (mouse.active) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_CONNECT_DIST) {
            const alpha = (1 - d / MOUSE_CONNECT_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(0,240,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // cursor dot
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 18);
        grd.addColorStop(0, "rgba(0,240,255,0.05)");
        grd.addColorStop(1, "rgba(0,240,255,0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255,0.3)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
