import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-xs uppercase tracking-[4px] text-primary/60 font-semibold mb-4">Error 404</div>
        <h1 className="text-6xl font-bold tracking-tight mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">This page doesn't exist in this dimension.</p>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.35)]"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
