import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import { WebGLGuard } from "@/components/ui/WebGLErrorBoundary";
import * as THREE from "three";

const mousePos = { x: 0, y: 0 };

function MouseTracker() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return null;
}

function InteractiveMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const targetRot = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return;
    targetRot.current.x += (mousePos.y * 0.6 - targetRot.current.x) * 0.05;
    targetRot.current.y += (mousePos.x * 0.9 - targetRot.current.y) * 0.05;
    meshRef.current.rotation.x = targetRot.current.x + state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = targetRot.current.y + state.clock.elapsedTime * 0.12;
    ringRef.current.rotation.x = -targetRot.current.x * 0.5 + state.clock.elapsedTime * 0.05;
    ringRef.current.rotation.z = targetRot.current.y * 0.5 + state.clock.elapsedTime * 0.07;
    const scale = 1 + (Math.abs(mousePos.x) + Math.abs(mousePos.y)) * 0.04;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.1, 0.32, 180, 32]} />
        <MeshDistortMaterial
          color="#00f0ff"
          emissive="#003344"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          distort={0.35}
          speed={2}
          wireframe
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, -0.5]}>
        <torusGeometry args={[2.2, 0.012, 8, 120]} />
        <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.25} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0, -0.8]}>
        <torusGeometry args={[1.7, 0.012, 8, 120]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.9} transparent opacity={0.85} />
      </mesh>
    </>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <MouseTracker />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f0ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#ff007f" />
      <Stars radius={80} depth={60} count={4000} factor={3} saturation={0} fade speed={0.8} />
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
          <InteractiveMesh />
        </Float>
      </Suspense>
    </Canvas>
  );
}

const works = [
  { title: "Doctor Plant", category: "Frontend Dev", img: "/images/doctor-plant.png" },
  { title: "Environment Study #01", category: "3D Art", img: "/images/environment-study.png" },
  { title: "Sociopedia", category: "Frontend Dev", img: "/images/sociopedia.png" },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);

  return (
    <Layout>
      {/* ─── Full-width hero with 3D background ─────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden flex items-center">

        {/* 3D scene fills the full section */}
        <motion.div
          style={{ opacity: sceneOpacity, scale: sceneScale }}
          className="absolute inset-0 z-0"
        >
          <WebGLGuard>
            <HeroScene />
          </WebGLGuard>
        </motion.div>

        {/* Gradient veil so text stays readable over the 3D bg */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.65) 45%, rgba(10,10,12,0.15) 75%, rgba(10,10,12,0) 100%)",
          }}
        />

        {/* Text content */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col gap-6 max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-xs uppercase tracking-[4px] text-primary/70 font-semibold"
            >
              Frontend Dev / 3D Artist
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Bridging the gap between{" "}
              <motion.span
                className="text-primary inline-block"
                whileHover={{ scale: 1.04, textShadow: "0 0 20px rgba(0,240,255,0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                code
              </motion.span>{" "}
              and{" "}
              <motion.span
                className="text-primary inline-block"
                whileHover={{ scale: 1.04, textShadow: "0 0 20px rgba(0,240,255,0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                3D space
              </motion.span>
              .
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              Creative technologist specializing in production-grade frontend architecture and spatial composition.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/works"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Explore Works
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background/40 backdrop-blur-sm px-8 text-sm font-medium shadow-sm transition-all hover:border-primary/50 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                About & Contact
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll nudge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-primary/60 to-transparent"
          />
          <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground/50">Scroll</span>
        </div>
      </section>

      {/* ─── Selected works ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-card/50 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(0,240,255,0.04) 0%, transparent 60%)" }}
        />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-3">Portfolio</div>
              <h2 className="text-4xl font-bold tracking-tight">Selected Works</h2>
            </div>
            <Link href="/works" className="text-primary hover:underline underline-offset-4 font-medium text-sm">
              View all
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work, i) => (
              <motion.div
                key={work.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href="/works"
                  className="group block overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)]"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    <motion.img
                      src={work.img}
                      alt={work.title}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">{work.category}</div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{work.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Capabilities ─────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden border-t border-border/30">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(255,0,127,0.03) 0%, transparent 60%)" }}
        />
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Frontend Dev", value: "React & TypeScript", sub: "Production-grade interfaces" },
              { label: "3D Art", value: "Blender & Nuke", sub: "Animation, environments & VFX" },
              { label: "Projects", value: "2+ shipped", sub: "Doctor Plant & Sociopedia" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="p-8 rounded-lg border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300 group"
                whileHover={{ y: -4, boxShadow: "0 0 30px rgba(0,240,255,0.07)" }}
              >
                <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-3">{item.label}</div>
                <div className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
