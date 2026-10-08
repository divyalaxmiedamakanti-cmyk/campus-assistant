import { motion } from "framer-motion";

const VARIANTS = {
  neutral: "border-rule/80 text-ink-soft bg-canvas/40",
  brass: "border-brass/70 text-brass bg-brass/10",
  danger: "border-danger/70 text-danger bg-danger/10",
  success: "border-success/70 text-success bg-success/10",
};

export default function Badge({ children, variant = "neutral", stamp = false, className = "", interactive = false }) {
  return (
    <motion.span
      whileHover={interactive ? { scale: 1.06, y: -1 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-wider font-medium shadow-sm transition-all duration-200
        ${VARIANTS[variant]} ${stamp ? "ink-stamp animate-stamp-in" : ""} ${className}`}
    >
      {children}
    </motion.span>
  );
}
