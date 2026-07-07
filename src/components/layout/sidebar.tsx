"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-bg-elevated/60 px-4 py-5 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-[var(--shadow-glow)]">
          <Brain size={22} />
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight tracking-tight">Second Brain</p>
          <p className="text-xs text-text-muted">Livia Januario</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {MODULES.map((m) => {
          const active = pathname === m.href || (m.href !== "/" && pathname.startsWith(m.href));
          const Icon = m.icon;
          return (
            <div key={m.key}>
              {m.groupLabel && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-bold tracking-widest text-text-muted first:mt-0">
                  {m.groupLabel}
                </p>
              )}
              <Link
                href={m.available ? m.href : "#"}
                aria-disabled={!m.available}
                onClick={(e) => !m.available && e.preventDefault()}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-text" : "text-text-secondary hover:bg-surface-hover hover:text-text",
                  !m.available && "cursor-not-allowed opacity-55 hover:bg-transparent"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-surface shadow-[var(--shadow-sm)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className="relative z-10 grid h-6 w-6 place-items-center rounded-lg"
                  style={{
                    color: active ? m.accent : undefined,
                    background: active ? `color-mix(in srgb, ${m.accent} 14%, transparent)` : undefined,
                  }}
                >
                  <Icon size={15} />
                </span>
                <span className="relative z-10 flex-1 text-[13px]">{m.label}</span>
                {!m.available && (
                  <span className="relative z-10 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                    Em breve
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl border border-border bg-surface p-3">
        <p className="text-xs font-semibold text-text">🎯 Foco: Medicina</p>
        <p className="mt-1 text-[11px] leading-snug text-text-muted">
          USP · UNICAMP · UNESP · FUVEST · ENEM
        </p>
      </div>
    </aside>
  );
}
