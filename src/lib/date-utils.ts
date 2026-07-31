/**
 * `new Date().toISOString()` always returns the UTC date, not the browser's
 * local date. In Brasília (UTC-3) that flips to "tomorrow" every day at
 * 21:00 local time. Use this instead wherever "today" means the user's
 * local calendar day.
 */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
