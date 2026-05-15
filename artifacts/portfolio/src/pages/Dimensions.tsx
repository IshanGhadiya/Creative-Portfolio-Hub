import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dimensions() {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(0,240,255,0.05) 0%, rgba(255,0,127,0.03) 40%, transparent 70%)",
          }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* corner brackets */}
        {([
          ["top-6 left-6", "border-t border-l"],
          ["top-6 right-6", "border-t border-r"],
          ["bottom-6 left-6", "border-b border-l"],
          ["bottom-6 right-6", "border-b border-r"],
        ] as const).map(([pos, borders]) => (
          <div
            key={pos}
            className={`absolute ${pos} w-8 h-8 ${borders} border-primary/30`}
          />
        ))}

        <div className="relative z-10 text-center p-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[5px] text-primary/60 font-semibold mb-4"
          >
            3D Art & Spatial Composition
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40"
          >
            DIMENSIONS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-base text-muted-foreground max-w-sm mx-auto"
          >
            Blender animation · environment creation · Nuke compositing
          </motion.p>
        </div>

        {/* bottom fade into content */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)",
          }}
        />

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-primary/60 to-transparent"
          />
          <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground/50">Scroll</span>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-24 bg-background border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-3">Rendered Work</div>
            <h2 className="text-4xl font-bold tracking-tight">Environment Gallery</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* River Scene */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_35px_rgba(0,240,255,0.1)]"
            >
              <div className="aspect-video overflow-hidden">
                <img src="/images/river-scene.png" alt="River Scene" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Blender · Environment</div>
                <h3 className="text-2xl font-bold mb-2">River Scene</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Misty lakeside scene with volumetric fog, reflective water simulation, procedural foliage, and a hand-placed cabin nestled at the forest edge.
                </p>
              </div>
            </motion.div>

            {/* Forest Floor */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_35px_rgba(0,240,255,0.1)]"
            >
              <div className="aspect-video overflow-hidden">
                <img src="/images/forest-floor.png" alt="Forest Floor" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Blender · Nature Study</div>
                <h3 className="text-2xl font-bold mb-2">Forest Floor</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Dense ground-cover study using particle systems and scatter objects — fallen leaves, clover patches, soil, and emergent grass under dappled light.
                </p>
              </div>
            </motion.div>

            {/* Dark Garden — full-width */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_35px_rgba(0,240,255,0.1)] md:col-span-2"
            >
              <div className="aspect-[21/9] overflow-hidden">
                <img src="/images/dark-garden.png" alt="Dark Garden" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Blender · Atmosphere & Lighting</div>
                <h3 className="text-2xl font-bold mb-2">Dark Garden</h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Nocturnal park scene built around practical lamp lighting, volumetric rain, and atmospheric fog. The isolated bench draws focus through contrast against the muted, rain-soaked surroundings.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tools & Pipeline ── */}
      <section className="py-24 border-t border-border/30 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-3">Workflow</div>
            <h2 className="text-4xl font-bold tracking-tight">Tools & Pipeline</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { tool: "Blender", role: "Modelling & Rendering", description: "Primary 3D suite for environment creation, lighting, shading, and final Cycles renders.", color: "from-orange-500/20 to-transparent", accent: "text-orange-400", icon: "⬡" },
              { tool: "Nuke", role: "VFX Compositing", description: "Node-based compositing to blend 3D renders with live footage, colour grading, and effects layers.", color: "from-blue-500/20 to-transparent", accent: "text-blue-400", icon: "◈" },
              { tool: "Particle Systems", role: "Procedural Nature", description: "Scatter-based foliage, ground cover, and instanced geometry for dense, natural-looking scenes.", color: "from-green-500/20 to-transparent", accent: "text-green-400", icon: "✦" },
              { tool: "Volumetrics", role: "Atmosphere & Fog", description: "Volumetric scattering for mist, god rays, and environmental depth that makes scenes feel alive.", color: "from-primary/20 to-transparent", accent: "text-primary", icon: "◌" },
              { tool: "HDRI Lighting", role: "Natural Illumination", description: "High-dynamic-range environment maps for physically accurate lighting and reflections.", color: "from-yellow-500/20 to-transparent", accent: "text-yellow-400", icon: "◎" },
              { tool: "Cycles", role: "Path-Trace Renderer", description: "Unbiased ray tracing for photorealistic outputs — glass, caustics, subsurface scattering.", color: "from-secondary/20 to-transparent", accent: "text-secondary", icon: "◉" },
            ].map((item, i) => (
              <motion.div
                key={item.tool}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="relative p-6 rounded-lg border border-border bg-card overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`text-3xl mb-4 ${item.accent}`}>{item.icon}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${item.accent}`}>{item.role}</div>
                  <h3 className="text-xl font-bold mb-3">{item.tool}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-3">Approach</div>
            <h2 className="text-4xl font-bold tracking-tight">The Process</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent hidden md:block" />
            <div className="flex flex-col gap-10 md:pl-16">
              {[
                { step: "01", title: "Reference & Concept", body: "Gather photographic reference, establish mood boards, and define the atmosphere — lighting direction, palette, and focal story." },
                { step: "02", title: "Modelling & Layout", body: "Block out the scene geometry first, establish scale and composition, then iterate on detail density from foreground to background." },
                { step: "03", title: "Shading & Materials", body: "Build procedural materials using Blender's shader nodes — layered dirt, wet surfaces, translucent leaves — tuned against reference." },
                { step: "04", title: "Lighting & Atmosphere", body: "Place HDRI and supplemental lights, add volumetric fog for depth, then iterate until the scene reads clearly at a thumbnail scale." },
                { step: "05", title: "Render & Composite", body: "Cycles path-trace render passes piped into Nuke for colour grade, lens effects, and final delivery." },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className="relative flex gap-6 items-start"
                >
                  <div className="hidden md:flex absolute -left-[2.85rem] w-8 h-8 rounded-full bg-background border border-primary/50 items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="text-4xl font-bold text-primary/20 tabular-nums leading-none shrink-0 w-10">{s.step}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-border/30 bg-card/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold">Want to see more?</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-xl">
              Explore the full portfolio or get in touch
            </h2>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/works"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] focus-visible:outline-none"
              >
                All Works
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background/40 px-8 text-sm font-medium transition-all hover:border-primary/50 hover:bg-muted focus-visible:outline-none"
              >
                Contact Me
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
