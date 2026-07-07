"use client";

import { Search, Command, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { greeting } from "@/lib/utils";

export function Topbar() {
  const today = new Date("2026-06-28T10:00:00");
  const dateLabel = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-bg/70 px-5 backdrop-blur-xl lg:px-8">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight">
          {greeting(today)}, Livia 👋
        </p>
        <p className="truncate text-xs capitalize text-text-muted">{dateLabel}</p>
      </div>

      <button className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover md:flex">
        <Search size={16} />
        <span>Buscar…</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold">
          <Command size={10} /> K
        </kbd>
      </button>

      <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text">
        <Bell size={18} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
      </button>

      <ThemeToggle />

      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
        L
      </div>
    </header>
  );
}
