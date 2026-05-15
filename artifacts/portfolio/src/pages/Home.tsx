import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";

const works = [
  { title: "Doctor Plant", category: "Frontend Dev", img: "/images/doctor-plant.png" },
  { title: "River Scene", category: "3D Art", img: "/images/river-scene.png" },
  { title: "Sociopedia", category: "Frontend Dev", img: "/images/sociopedia.png" },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  return (
    <Layout>
      <section className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden flex items-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(0,240,255,0.05) 0%, rgba(255,0,127,0.03) 40%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
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
              Hi, I&apos;m{" "}
              <motion.span
                className="text-primary inline-block"
                whileHover={{ scale: 1.04, textShadow: "0 0 20px rgba(0,240,255,0.8)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Ishan Ghadiya
              </motion.span>
              .
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              Bridging the gap between{" "}
              <span className="text-primary font-semibold">code</span> and{" "}
              <span className="text-primary font-semibold">3D space</span>. Creative technologist specializing in production-grade frontend architecture and spatial composition.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/works"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] focus-visible:outline-none"
              >
                Explore Works
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background/40 backdrop-blur-sm px-8 text-sm font-medium transition-all hover:border-primary/50 hover:bg-muted focus-visible:outline-none"
              >
                About & Contact
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-primary/60 to-transparent"
          />
          <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground/50">Scroll</span>
        </div>
      </section>

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
