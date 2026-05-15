import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { WebGLGuard } from "@/components/ui/WebGLErrorBoundary";

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff007f" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh rotation={[0.5, 0.5, 0]}>
            <torusKnotGeometry args={[1, 0.3, 128, 32]} />
            <MeshDistortMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={0.2}
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              metalness={0.8}
              roughness={0.2}
              distort={0.4}
              speed={2}
              wireframe={true}
            />
          </mesh>
        </Float>
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

export default function Home() {
  return (
    <Layout>
      <section className="w-full min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Bridging the gap between <span className="text-primary glow-text">code</span> and <span className="text-primary glow-text">3D space</span>.
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Creative technologist specializing in production-grade frontend architecture and spatial composition.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link href="/works" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                Explore Works
              </Link>
              <Link href="/about" className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                About & Contact
              </Link>
            </div>
          </motion.div>
          <div className="h-[500px] lg:h-[700px] w-full relative rounded-lg overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm">
            <WebGLGuard>
              <HeroScene />
            </WebGLGuard>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Selected Works</h2>
            <Link href="/works" className="text-primary hover:underline underline-offset-4 font-medium">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Teaser cards */}
            {[
              {
                title: "Doctor Plant",
                category: "Frontend Dev",
                img: "/images/doctor-plant.png"
              },
              {
                title: "Environment Study #01",
                category: "3D Art",
                img: "/images/environment-study.png"
              },
              {
                title: "Sociopedia",
                category: "Frontend Dev",
                img: "/images/sociopedia.png"
              }
            ].map((work, i) => (
              <motion.div
                key={work.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href="/works" className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img 
                      src={work.img} 
                      alt={work.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-medium text-secondary mb-2">{work.category}</div>
                    <h3 className="text-lg font-semibold">{work.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
