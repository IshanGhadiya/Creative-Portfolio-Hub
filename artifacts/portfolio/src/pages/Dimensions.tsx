import { useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";

/* ─── math helpers ───────────────────────────────────────────────────────── */
type V3 = [number, number, number];

function rotateX(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}
function rotateY(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}
function rotateZ(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}
function project(p: V3, fov: number, W: number, H: number, cx: number, cy: number): [number, number, number] {
  const z = p[2] + fov;
  if (z <= 0) return [-9999, -9999, 0];
  const scale = fov / z;
  return [cx + p[0] * scale, cy + p[1] * scale, scale];
}

/* ─── geometry builders ─────────────────────────────────────────────────── */

function buildIcosahedron(r: number): { verts: V3[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: V3[] = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const norm = Math.sqrt(1 + phi * phi);
  const verts: V3[] = raw.map(([x, y, z]) => [x / norm * r, y / norm * r, z / norm * r]);
  const edges: [number, number][] = [
    [0,1],[0,5],[0,7],[0,10],[0,11],
    [1,5],[1,7],[1,8],[1,9],
    [2,3],[2,4],[2,10],[2,11],[2,6],
    [3,4],[3,6],[3,8],[3,9],
    [4,5],[4,9],[4,11],
    [5,9],[5,11],
    [6,7],[6,8],[6,10],
    [7,8],[7,10],
    [8,9],[10,11],
  ];
  return { verts, edges };
}

function buildOctahedron(r: number): { verts: V3[]; edges: [number, number][] } {
  const verts: V3[] = [[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]];
  const edges: [number, number][] = [
    [0,2],[0,3],[0,4],[0,5],
    [1,2],[1,3],[1,4],[1,5],
    [2,4],[2,5],[3,4],[3,5],
  ];
  return { verts, edges };
}

function buildTorus(R: number, r: number, segs: number, tubes: number): { verts: V3[]; edges: [number, number][] } {
  const verts: V3[] = [];
  const edges: [number, number][] = [];
  for (let i = 0; i < segs; i++) {
    const phi = (i / segs) * Math.PI * 2;
    for (let j = 0; j < tubes; j++) {
      const theta = (j / tubes) * Math.PI * 2;
      verts.push([
        (R + r * Math.cos(theta)) * Math.cos(phi),
        (R + r * Math.cos(theta)) * Math.sin(phi),
        r * Math.sin(theta),
      ]);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < tubes; j++) {
      const a = i * tubes + j;
      const b = i * tubes + (j + 1) % tubes;
      const c = ((i + 1) % segs) * tubes + j;
      edges.push([a, b], [a, c]);
    }
  }
  return { verts, edges };
}

/* ─── star field ─────────────────────────────────────────────────────────── */
interface Star { x: number; y: number; z: number; }

function buildStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    z: Math.random() * 1600 + 200,
  }));
}

/* ─── component ──────────────────────────────────────────────────────────── */
export default function Dimensions() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse        = useRef({ x: 0.5, y: 0.5 });
  const smooth       = useRef({ x: 0.5, y: 0.5 });
  const lastTime     = useRef<number | null>(null);
  const clock        = useRef(0);
  const raf          = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    /* geometries */
    const ico   = buildIcosahedron(70);
    const oct   = buildOctahedron(85);
    const tor   = buildTorus(110, 22, 24, 12);
    const stars = buildStars(380);

    /* per-object rotation state */
    const rot = {
      ico:  { rx: 0, ry: 0, rz: 0 },
      oct:  { rx: 0, ry: 0, rz: 0 },
      tor:  { rx: 0, ry: 0, rz: 0 },
    };
    /* per-object float offsets */
    const floatSeed = { ico: 0, oct: 1.4, tor: 2.8 };

    const draw = (now: number) => {
      if (lastTime.current === null) lastTime.current = now;
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;
      clock.current += dt;
      const T = clock.current;

      /* smooth mouse */
      smooth.current.x = lerp(smooth.current.x, mouse.current.x, 1 - Math.pow(0.001, dt));
      smooth.current.y = lerp(smooth.current.y, mouse.current.y, 1 - Math.pow(0.001, dt));
      const mx = (smooth.current.x - 0.5) * 2;
      const my = (smooth.current.y - 0.5) * 2;

      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const FOV = 600;

      ctx.clearRect(0, 0, W, H);

      /* ── 1. Background gradient ── */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "#0a0d14"); bg.addColorStop(1, "#020406");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* ── 2. Stars ── */
      for (const star of stars) {
        const zz = ((star.z - T * 60) % 1600 + 1600) % 1600 + 200;
        const scale = FOV / (zz + FOV);
        const sx = cx + star.x * scale + mx * 12 * scale;
        const sy = cy + star.y * scale + my * 8 * scale;
        const r = Math.max(0.4, scale * 1.6);
        const a = Math.min(scale * 1.2, 0.9);
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,230,255,${a.toFixed(2)})`; ctx.fill();
      }

      /* ── 3. Perspective grid ── */
      {
        const gridY = cy + H * 0.28;
        const gridZ = 80;
        const COUNT = 24;
        const SPREAD = 1800;
        const DEPTH = 1800;
        const STEP = DEPTH / COUNT;
        const tOff = (T * 45) % STEP;

        /* longitudinal lines */
        for (let i = -COUNT; i <= COUNT; i++) {
          const worldX = (i / COUNT) * SPREAD;
          const near = project([worldX + mx * 30, 0, gridZ + tOff], FOV, W, H, cx, gridY);
          const far  = project([worldX + mx * 30, 0, gridZ + DEPTH], FOV, W, H, cx, gridY);
          if (near[2] <= 0 || far[2] <= 0) continue;
          const alpha = 0.06 + (1 - Math.abs(i) / COUNT) * 0.08;
          ctx.strokeStyle = `rgba(0,220,255,${alpha.toFixed(2)})`; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(near[0], near[1]); ctx.lineTo(far[0], far[1]); ctx.stroke();
        }

        /* transversal lines (receding) */
        for (let d = 0; d < COUNT; d++) {
          const z = gridZ + tOff + d * STEP;
          const leftNear  = project([-SPREAD + mx * 30, 0, z], FOV, W, H, cx, gridY);
          const rightNear = project([SPREAD  + mx * 30, 0, z], FOV, W, H, cx, gridY);
          if (leftNear[2] <= 0) continue;
          const alpha = (1 - d / COUNT) * 0.12;
          /* pink accent every 6th line */
          const isPink = d % 6 === 0;
          ctx.strokeStyle = isPink
            ? `rgba(255,0,127,${(alpha * 1.6).toFixed(2)})`
            : `rgba(0,220,255,${alpha.toFixed(2)})`;
          ctx.lineWidth = isPink ? 1 : 0.6;
          ctx.beginPath(); ctx.moveTo(leftNear[0], leftNear[1]); ctx.lineTo(rightNear[0], rightNear[1]); ctx.stroke();
        }
      }

      /* ── helper to draw a wireframe object ── */
      const drawObject = (
        verts: V3[], edges: [number, number][],
        rx: number, ry: number, rz: number,
        offX: number, offY: number, offZ: number,
        color: string, alpha: number
      ) => {
        const projected: [number, number, number][] = verts.map(v => {
          let p: V3 = [...v];
          p = rotateX(p, rx); p = rotateY(p, ry); p = rotateZ(p, rz);
          p = [p[0] + offX, p[1] + offY, p[2] + offZ];
          return project(p, FOV, W, H, cx, cy);
        });
        for (const [a, b] of edges) {
          const pa = projected[a], pb = projected[b];
          if (pa[2] <= 0 || pb[2] <= 0 || pa[0] < -W || pb[0] < -W) continue;
          /* depth-fade: closer (higher scale) = brighter */
          const depth = (pa[2] + pb[2]) / 2;
          const da = Math.min(alpha * depth * 1.2, alpha);
          ctx.strokeStyle = color.replace("A", da.toFixed(2));
          ctx.lineWidth = depth * 0.8;
          ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
        }
      };

      /* ── 4. Update rotations ── */
      rot.ico.rx += 0.35 * dt; rot.ico.ry += 0.55 * dt + mx * 0.015;
      rot.oct.rx += 0.45 * dt; rot.oct.ry -= 0.30 * dt + my * 0.012;
      rot.tor.rx += 0.22 * dt + my * 0.01; rot.tor.ry += 0.28 * dt;

      /* ── 5. Floating offsets (bob) ── */
      const fIco = Math.sin(T * 0.9 + floatSeed.ico) * 22;
      const fOct = Math.sin(T * 1.1 + floatSeed.oct) * 18;
      const fTor = Math.sin(T * 0.7 + floatSeed.tor) * 25;

      /* ── 6. Draw geometries ── */
      /* Torus — back, neon pink wireframe */
      drawObject(
        tor.verts, tor.edges,
        rot.tor.rx, rot.tor.ry, rot.tor.rz,
        mx * -35 + 90, fTor + my * -20,
        260,
        "rgba(255,0,127,A)", 0.5
      );

      /* Octahedron — left-ish, metal blue */
      drawObject(
        oct.verts, oct.edges,
        rot.oct.rx, rot.oct.ry, rot.oct.rz,
        mx * 40 - 220, fOct + my * 25,
        200,
        "rgba(0,200,255,A)", 0.55
      );

      /* Icosahedron — right-ish, cyan */
      drawObject(
        ico.verts, ico.edges,
        rot.ico.rx, rot.ico.ry, rot.ico.rz,
        mx * -30 + 200, fIco + my * -30,
        140,
        "rgba(0,240,255,A)", 0.65
      );

      /* ── 7. Glow halos around objects ── */
      const halos: [number, number, number, string][] = [
        [cx + 200 + mx * -30, cy + fIco + my * -30, 90, "rgba(0,240,255,0.06)"],
        [cx - 220 + mx * 40, cy + fOct + my * 25, 110, "rgba(0,180,255,0.05)"],
        [cx + 90 + mx * -35, cy + fTor + my * -20, 130, "rgba(255,0,127,0.04)"],
      ];
      for (const [hx, hy, hr, hc] of halos) {
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        g.addColorStop(0, hc); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
      }

      /* ── 8. Corner HUD brackets ── */
      const pad = 22, blen = 32;
      const corners: [number, number, number, number][] = [
        [pad, pad, 1, 1], [W - pad, pad, -1, 1], [pad, H - pad, 1, -1], [W - pad, H - pad, -1, -1],
      ];
      ctx.strokeStyle = "rgba(0,240,255,0.35)"; ctx.lineWidth = 1.2;
      for (const [bx, by, sx, sy] of corners) {
        ctx.beginPath();
        ctx.moveTo(bx + sx * blen, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + sy * blen);
        ctx.stroke();
      }

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
    <Layout hideFooter>
      {/* canvas fills the page */}
      <div ref={containerRef} className="fixed inset-0 top-16 z-0 bg-background cursor-none">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* overlay text */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 pointer-events-none">
        <div className="text-center bg-background/40 p-8 rounded-xl backdrop-blur-md border border-white/5 pointer-events-auto shadow-2xl">
          <p className="text-xs uppercase tracking-[5px] text-primary/60 font-semibold mb-3">3D Art & Spatial Composition</p>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
            DIMENSIONS
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mb-8">
            Blender animation · environment creation · Nuke compositing
          </p>
          <Link
            href="/works"
            className="inline-flex h-12 items-center justify-center rounded-full border border-primary/50 bg-background/50 backdrop-blur px-8 text-sm font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Return to Works
          </Link>
        </div>
      </div>
    </Layout>
  );
}
