import { SKINCARE_MORNING, SKINCARE_EVENING, type SkinStep } from "@/lib/data";

// Estado do skincare de um dia específico (data real, não dia da semana), compartilhado
// entre a tela de Self Care (passo a passo) e a Rotina (um único check "Skincare manhã/noite").
type SkincareDay = {
  morning: Record<string, boolean>;
  evening: Record<string, boolean>;
};

function keyFor(dateISO: string) {
  return `skincare-${dateISO}`;
}

function loadDay(dateISO: string): SkincareDay {
  if (typeof window === "undefined") return { morning: {}, evening: {} };
  try {
    const saved = localStorage.getItem(keyFor(dateISO));
    if (saved) return JSON.parse(saved) as SkincareDay;
  } catch { /* ignore */ }
  return { morning: {}, evening: {} };
}

function saveDay(dateISO: string, day: SkincareDay) {
  localStorage.setItem(keyFor(dateISO), JSON.stringify(day));
}

export function loadSkincareSteps(dateISO: string): { morning: SkinStep[]; evening: SkinStep[] } {
  const day = loadDay(dateISO);
  return {
    morning: SKINCARE_MORNING.map((s) => ({ ...s, done: day.morning[s.id] ?? s.done })),
    evening: SKINCARE_EVENING.map((s) => ({ ...s, done: day.evening[s.id] ?? s.done })),
  };
}

export function toggleSkincareStep(dateISO: string, period: "morning" | "evening", stepId: string) {
  const day = loadDay(dateISO);
  const current = day[period][stepId] ?? false;
  day[period] = { ...day[period], [stepId]: !current };
  saveDay(dateISO, day);
  return day;
}

export function isSkincareComplete(dateISO: string, period: "morning" | "evening"): boolean {
  const day = loadDay(dateISO);
  const steps = period === "morning" ? SKINCARE_MORNING : SKINCARE_EVENING;
  return steps.every((s) => day[period][s.id] ?? s.done);
}

/** Marca (ou desmarca) todos os passos do período de uma vez — usado pelo check único da Rotina. */
export function setSkincarePeriodComplete(dateISO: string, period: "morning" | "evening", complete: boolean) {
  const day = loadDay(dateISO);
  const steps = period === "morning" ? SKINCARE_MORNING : SKINCARE_EVENING;
  const next: Record<string, boolean> = {};
  steps.forEach((s) => { next[s.id] = complete; });
  day[period] = next;
  saveDay(dateISO, day);
  return day;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
