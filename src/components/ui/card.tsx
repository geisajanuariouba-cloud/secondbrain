"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  interactive = false,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
}) {
  return (
    <motion.div
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]",
        interactive && "cursor-pointer hover:border-border-strong hover:shadow-[var(--shadow-md)]",
        glow && "shadow-[var(--shadow-glow)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Badge({
  children,
  color = "var(--primary)",
  soft = true,
}: {
  children: ReactNode;
  color?: string;
  soft?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={
        soft
          ? { color, background: `color-mix(in srgb, ${color} 14%, transparent)` }
          : { color: "#fff", background: color }
      }
    >
      {children}
    </span>
  );
}
