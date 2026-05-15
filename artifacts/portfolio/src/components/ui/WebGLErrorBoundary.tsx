import { useState, useEffect, type ReactNode } from "react";

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

interface WebGLGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WebGLGuard({ children, fallback }: WebGLGuardProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(checkWebGLSupport());
  }, []);

  if (supported === null) return null;
  if (!supported) return <>{fallback ?? <CSSFallbackScene />}</>;
  return <>{children}</>;
}

export function CSSFallbackScene({ height = "100%" }: { height?: string }) {
  return (
    <div
      className="w-full flex items-center justify-center relative overflow-hidden"
      style={{
        height,
        background: "radial-gradient(circle at 60% 50%, #1a1a28 0%, #0a0a0c 70%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { x: "15%", y: "20%", size: 2, delay: 0, color: "#00f0ff" },
          { x: "75%", y: "15%", size: 3, delay: 0.5, color: "#ffffff" },
          { x: "45%", y: "70%", size: 2, delay: 1, color: "#00f0ff" },
          { x: "85%", y: "55%", size: 1.5, delay: 1.5, color: "#ff007f" },
          { x: "25%", y: "80%", size: 2, delay: 0.8, color: "#ffffff" },
          { x: "60%", y: "30%", size: 1, delay: 0.3, color: "#00f0ff" },
          { x: "10%", y: "60%", size: 2.5, delay: 2, color: "#ffffff" },
          { x: "90%", y: "85%", size: 1.5, delay: 1.2, color: "#ff007f" },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: star.x,
              top: star.y,
              background: star.color,
              opacity: 0.4,
              animation: `starPulse ${2.5 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <div
          className="absolute border border-[#00f0ff]/20 rounded-sm"
          style={{
            width: "220px",
            height: "220px",
            animation: "cssRotate 20s linear infinite",
            boxShadow: "0 0 40px rgba(0,240,255,0.05)",
          }}
        />
        <div
          className="absolute border border-[#ff007f]/15 rounded-sm"
          style={{
            width: "160px",
            height: "160px",
            animation: "cssRotate 14s linear infinite reverse",
          }}
        />
        <div
          className="absolute border border-[#00f0ff]/30 rounded-sm"
          style={{
            width: "90px",
            height: "90px",
            animation: "cssRotate 8s linear infinite",
            boxShadow: "0 0 20px rgba(0,240,255,0.1)",
          }}
        />
        <div
          className="w-3 h-3 rounded-full bg-[#00f0ff]"
          style={{
            boxShadow: "0 0 20px #00f0ff, 0 0 40px rgba(0,240,255,0.5)",
            animation: "corePulse 3s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes cssRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes starPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.6; } }
        @keyframes corePulse { 0%, 100% { box-shadow: 0 0 15px #00f0ff, 0 0 30px rgba(0,240,255,0.4); } 50% { box-shadow: 0 0 25px #00f0ff, 0 0 50px rgba(0,240,255,0.7); } }
      `}</style>
    </div>
  );
}
