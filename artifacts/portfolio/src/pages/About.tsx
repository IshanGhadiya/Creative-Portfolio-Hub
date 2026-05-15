import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { motion } from "framer-motion";

export default function About() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend, just simulate
    setFormData({ name: "", email: "", message: "" });
    alert("Message initialized.");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Bio & Skills */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">The Blueprint</h1>
              <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
                <p>
                  A creative technologist who structures web experiences with production-grade code, then breaks into the third dimension with spatial composition and VFX pipelines.
                </p>
                <p>
                  Operating at the intersection of logical engineering and visual artistry.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-border pb-4">Skills Matrix</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Engineering</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>JavaScript (ES6+)</li>
                    <li>TypeScript</li>
                    <li>React / Next.js</li>
                    <li>HTML5 / CSS3</li>
                    <li>TailwindCSS</li>
                    <li>Git / CI/CD</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">Spatial & 3D</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Blender 3D</li>
                    <li>Nuke (Compositing)</li>
                    <li>Animation & Rigging</li>
                    <li>Environment Creation</li>
                    <li>Lighting & Baking</li>
                    <li>VFX Pipeline</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border p-8 rounded-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight mb-8">Establish Connection</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-border"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-border"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-border resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-md border-2 border-primary bg-primary/10 px-8 text-sm font-bold tracking-wider uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] mt-4"
              >
                Initialize Project
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
