"use client";

export function Switch({
  on,
  onToggle,
  size = "md",
  ariaLabel,
}: {
  on: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const travel = size === "sm" ? 16 : 20;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative ${track} shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
      style={{ background: on ? "var(--primary)" : "var(--border-strong)" }}
    >
      <span
        className={`absolute top-0.5 left-0.5 ${knob} rounded-full bg-white shadow-sm transition-transform`}
        style={{ transform: on ? `translateX(${travel}px)` : "translateX(0px)" }}
      />
    </button>
  );
}
