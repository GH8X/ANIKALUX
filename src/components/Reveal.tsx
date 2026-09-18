import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Use when the element is already in the first viewport. */
  immediate?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 18, immediate = false }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const animation = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      {...(immediate
        ? { animate: animation }
        : { whileInView: animation, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
