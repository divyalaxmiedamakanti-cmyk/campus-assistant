import { motion } from "framer-motion";

export default function ProgressBar({ label, value, max, suffix = "", variant = "brass" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const gradientClass =
    variant === "success" || pct >= 75
      ? "from-emerald-400 to-emerald-600"
      : pct >= 65
      ? "from-amber-400 to-amber-600"
      : "from-rose-400 to-rose-600";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="mb-3.5 last:mb-0 group cursor-default transition-all"
    >
      <div className="flex justify-between items-baseline mb-1.5 font-mono text-xs">
        <span className="text-ink-soft truncate pr-2 group-hover:text-ink font-medium transition-colors">
          {label}
        </span>
        <span className="text-ink font-semibold whitespace-nowrap group-hover:text-brass transition-colors">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-canvas/80 overflow-hidden border border-rule/70 p-[1px] shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} shadow-sm group-hover:brightness-110 transition-all`}
        />
      </div>
    </motion.div>
  );
}
