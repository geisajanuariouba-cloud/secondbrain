"use client";

import { motion } from "framer-motion";
import { Sparkles, type LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  icon: Icon,
  accent = "var(--primary)",
  features,
}: {
  title: string;
  icon: LucideIcon;
  accent?: string;
  features: string[];
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="grid h-24 w-24 place-items-center rounded-3xl shadow-[var(--shadow-glow)]"
        style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
      >
        <Icon size={44} />
      </motion.div>

      <span
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
        style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
      >
        <Sparkles size={13} /> Em breve
      </span>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-text-secondary">
        Este módulo já está previsto na arquitetura do sistema e chegará nas próximas atualizações.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {features.map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium shadow-[var(--shadow-sm)]"
          >
            <span className="mr-2" style={{ color: accent }}>◆</span>
            {f}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
