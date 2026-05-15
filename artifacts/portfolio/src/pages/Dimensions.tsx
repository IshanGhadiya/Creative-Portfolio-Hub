import { Layout } from "@/components/layout/Layout";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Stars, Grid } from "@react-three/drei";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Link } from "wouter";
import { WebGLGuard, CSSFallbackScene } from "@/components/ui/WebGLErrorBoundary";

function MovingCamera() {
  useFrame((state) => {
    state.camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.1) * 2;
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 1;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function DimensionScene() {
  return (
    <>
      <fog attach="fog" args={["#0a0a0c", 5, 20]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -5, -10]} intensity={2} color="#ff007f" />
      
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Grid 
        position={[0, -2, 0]} 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor="#00f0ff" 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#ff007f" 
        fadeDistance={25} 
        fadeStrength={1} 
      />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-2, 1, -5]} rotation={[1, 1, 0]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#000000" wireframe emissive="#00f0ff" emissiveIntensity={0.5} />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[3, 0, -8]} rotation={[0, 1, 1]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#121216" roughness={0.1} metalness={0.9} envMapIntensity={1} />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 2, -12]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[2, 0.2, 16, 100]} />
          <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={0.2} wireframe />
        </mesh>
      </Float>

      <Environment preset="city" />
      <MovingCamera />
    </>
  );
}

export default function Dimensions() {
  return (
    <Layout hideFooter>
      <div className="fixed inset-0 top-16 z-0 bg-background">
        <WebGLGuard fallback={<CSSFallbackScene height="100%" />}>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <Suspense fallback={null}>
              <DimensionScene />
            </Suspense>
          </Canvas>
        </WebGLGuard>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 pointer-events-none">
        <div className="text-center bg-background/40 p-8 rounded-xl backdrop-blur-md border border-white/5 pointer-events-auto shadow-2xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 glow-text text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            DIMENSIONS
          </h1>
          <p className="text-xl text-primary font-medium tracking-widest uppercase mb-8">
            3D Art & Spatial Composition
          </p>
          <Link 
            href="/works" 
            className="inline-flex h-12 items-center justify-center rounded-full border border-primary/50 bg-background/50 backdrop-blur px-8 text-sm font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Return to Works
          </Link>
        </div>
      </div>
    </Layout>
  );
}
