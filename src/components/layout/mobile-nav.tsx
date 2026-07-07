"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

const PRIMARY = ["dashboard", "rotina", "estudos", "financeiro", "config"];

export function MobileNav() {
  const pathname = usePathname();
  const items = MODULES.filter((m) => PRIMARY.includes(m.key));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-bg/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      {items.map((m) => {
        const active = pathname === m.href || (m.href !== "/" && pathname.startsWith(m.href));
        const Icon = m.icon;
        return (
          <Link
            key={m.key}
            href={m.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors",
              active ? "text-text" : "text-text-muted"
            )}
          >
            <span style={{ color: active ? m.accent : undefined }}>
              <Icon size={20} />
            </span>
            {m.label.split(" ")[0]}
          </Link>
        );
      })}
    </nav>
  );
}
