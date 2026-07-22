import { VESTIBULARES_TARGETS } from "@/lib/data";

export type VestibularRegistration = {
  id: string;
  name: string;
  color: string;
  selected: boolean;
  registered: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  registrationNote?: string;
  registrationUrl?: string;
};

export type RegistrationStatus = "registered" | "open" | "upcoming" | "unknown";

export function registrationStatus(v: VestibularRegistration, today: string): RegistrationStatus {
  if (v.registered) return "registered";
  if (v.registrationOpensAt && v.registrationOpensAt <= today && (!v.registrationClosesAt || v.registrationClosesAt >= today)) return "open";
  if (v.registrationOpensAt && v.registrationOpensAt > today) return "upcoming";
  return "unknown";
}

/**
 * Reads registration status for every vestibular, merging the "registered" checkbox
 * the user set on the Vestibulares page (persisted in localStorage) with the
 * registrationOpensAt/Note/Url fields that always come fresh from data.ts — so a
 * stale localStorage snapshot never masks a newly-discovered registration date.
 */
export function loadVestibularRegistrations(): VestibularRegistration[] {
  const base: VestibularRegistration[] = VESTIBULARES_TARGETS.map((v) => ({
    id: v.id, name: v.name, color: v.color, selected: v.selected,
    registered: false,
    registrationOpensAt: v.registrationOpensAt,
    registrationClosesAt: v.registrationClosesAt,
    registrationNote: v.registrationNote,
    registrationUrl: v.registrationUrl,
  }));

  if (typeof window === "undefined") return base;

  try {
    const saved = localStorage.getItem("vestibulares-data");
    if (!saved) return base;
    const savedList: { id: string; selected?: boolean; registered?: boolean }[] = JSON.parse(saved);
    const savedMap = new Map(savedList.map((v) => [v.id, v]));
    return base.map((v) => {
      const s = savedMap.get(v.id);
      if (!s) return v;
      return { ...v, selected: s.selected ?? v.selected, registered: s.registered ?? false };
    });
  } catch {
    return base;
  }
}

/** Vestibulares the user is preparing for, whose registration is currently open and not yet done. */
export function pendingOpenRegistrations(): VestibularRegistration[] {
  const today = new Date().toISOString().slice(0, 10);
  return loadVestibularRegistrations().filter((v) => v.selected && registrationStatus(v, today) === "open");
}
