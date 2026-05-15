import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "Doctor Plant",
    category: "Frontend Dev",
    description: "A plant health diagnosis web app. Built the entire frontend with a team of developers.",
    tags: ["React", "TypeScript", "Team Project"],
    image: "/images/doctor-plant.png"
  },
  {
    id: 2,
    title: "Environment Study #01",
    category: "3D Art",
    description: "A photorealistic environment scene in Blender. Volumetric lighting and textured surfaces.",
    tags: ["Blender", "Environment", "Lighting"],
    image: "/images/environment-study.png"
  },
  {
    id: 3,
    title: "Sociopedia",
    category: "Frontend Dev",
    description: "A campus social media platform. Social feeds, profiles, and real-time community features.",
    tags: ["React", "MongoDB", "Campus Social Media"],
    image: "/images/sociopedia.png"
  },
  {
    id: 4,
    title: "Character Animation Reel",
    category: "3D Art",
    description: "Animated character sequences with physics simulations and complex rigging workflows.",
    tags: ["Blender", "Animation", "Rigging"],
    image: "/images/character-reel.png"
  },
  {
    id: 5,
    title: "Nuke Compositing Demo",
    category: "3D Art",
    description: "VFX compositing work combining live footage with 3D renders using node-based workflows.",
    tags: ["Nuke", "Compositing", "VFX"],
    image: "/images/nuke-demo.png"
  }
];

export default function Works() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Frontend Dev", "3D Art"];

  const filteredProjects = projects.filter(p => filter === "All" || p.category === filter);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Works</h1>
          <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f 
                    ? "bg-primary/10 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <div className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">{project.category}</div>
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1 mb-6">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium px-2 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
}
