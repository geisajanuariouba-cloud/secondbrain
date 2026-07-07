"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent = "var(--primary)",
  trend,
  hint,
  index = 0,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: string;
  trend?: number;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 220, damping: 22 }}
      className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
    >
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.12] blur-xl"
        style={{ background: accent }}
      />
      <div className="mb-3 flex items-center justify-between">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          {icon}
        </span>
        {trend !== undefined && (
          <span
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: trend >= 0 ? "var(--success)" : "var(--danger)" }}
          >
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </motion.div>
  );
}
