import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
  delay = 0,
  as = "div",
  interactive = true,
  ...rest
}) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        interactive
          ? { y: -4, transition: { duration: 0.22, ease: "easeOut" } }
          : undefined
      }
      whileTap={
        interactive
          ? { scale: 0.985, y: -1, transition: { duration: 0.1 } }
          : undefined
      }
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative bg-paper-raised border border-rule/80 rounded-2xl shadow-sm ${
        interactive
          ? "hover:shadow-xl hover:border-brass/50 transition-all duration-300 card-interactive"
          : ""
      } overflow-hidden ${className}`}
      {...rest}
    >
      {interactive && (
        <div className="absolute inset-0 bg-gradient-to-b from-brass/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      {children}
    </Component>
  );
}
