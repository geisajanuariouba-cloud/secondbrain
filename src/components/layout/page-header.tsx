import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
  accent = "var(--primary)",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
