import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    let start: number | null = null;
    const DURATION = 1600;

    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / DURATION, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("out");
        setTimeout(onComplete, 700);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const NUM = 60;
      for (let i = 0; i < NUM; i++) {
        const x = ((i / NUM) * W + t * 18 * (i % 2 === 0 ? 1 : -0.5)) % W;
        const y = (Math.sin(i * 2.1 + t * 0.9) * 0.5 + 0.5) * H;
        const alpha = (Math.sin(i + t * 1.2) * 0.5 + 0.5) * 0.12;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      for (let i = 0; i < 4; i++) {
        const x0 = ((t * 22 * (i + 1) * 0.35) % W);
        const y0 = (Math.sin(i * 1.7 + t * 0.5) * 0.4 + 0.5) * H;
        const g = ctx.createRadialGradient(x0, y0, 0, x0, y0, 140);
        g.addColorStop(0, `rgba(0,240,255,0.03)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x0, y0, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const easedProgress = Math.pow(progress, 0.5);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center gap-2"
            >
              <LogoMark />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-3xl font-bold tracking-[0.15em] select-none"
              >
                ISHAN
                <span className="text-primary">.</span>
                DEV
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="text-[11px] uppercase tracking-[5px] text-muted-foreground font-medium"
              >
                Frontend Dev &amp; 3D Artist
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex flex-col items-center gap-3 w-48"
            >
              <div className="relative w-full h-[2px] bg-border overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  style={{ width: `${easedProgress * 100}%` }}
                />
                <motion.div
                  className="absolute inset-y-0 w-16 rounded-full"
                  style={{
                    left: `calc(${easedProgress * 100}% - 4rem)`,
                    background: "linear-gradient(to right, transparent, rgba(0,240,255,0.6), transparent)",
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-[4px] text-muted-foreground/50 tabular-nums">
                {Math.round(easedProgress * 100)}%
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LogoMark() {
  return (
    <motion.svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.circle
        cx="36"
        cy="36"
        r="32"
        stroke="rgba(0,240,255,0.18)"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <motion.circle
        cx="36"
        cy="36"
        r="24"
        stroke="rgba(0,240,255,0.35)"
        strokeWidth="1"
        strokeDasharray="4 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "36px 36px" }}
      />
      <motion.path
        d="M24 36 L36 20 L48 36 L36 52 Z"
        stroke="rgba(0,240,255,0.9)"
        strokeWidth="1.5"
        fill="rgba(0,240,255,0.06)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      />
      <motion.path
        d="M28 36 L36 24 L44 36 L36 48 Z"
        stroke="rgba(0,240,255,0.5)"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
      />
      <motion.circle
        cx="36"
        cy="36"
        r="3"
        fill="rgba(0,240,255,1)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 1], opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
      />
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.circle
          key={angle}
          cx={36 + 32 * Math.cos((angle * Math.PI) / 180)}
          cy={36 + 32 * Math.sin((angle * Math.PI) / 180)}
          r="2.5"
          fill="rgba(0,240,255,0.7)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
        />
      ))}
    </motion.svg>
  );
}
