"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarHeart, Sunrise, Sun, Moon, Flame, CheckCircle2,
  Plus, X, Trash2, Clock, Settings, ChevronLeft, Pencil, Save,
  BookOpen, GraduationCap, RotateCcw, Zap, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { WATER_GLASSES, STUDY_STREAK, REVISIONS } from "@/lib/data";
import { pendingOpenRegistrations, type VestibularRegistration } from "@/lib/vestibulares-registrations";
import { isSkincareComplete, setSkincarePeriodComplete } from "@/lib/skincare-store";
import { CalendarClock } from "lucide-react";
import {
  DEFAULT_HABITS_BY_DAY, ALL_DAYS, DAY_ABBR, getTodayKey,
  type DayKey, type Habit, type HabitCategory, type TimeOfDay,
} from "@/lib/habits";
import { pct } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Estudos: "var(--secondary)",
  "Self care": "var(--c-lilac)",
  "Meter o shape": "var(--c-rose)",
  "Aproximar de Deus": "var(--c-amber)",
  Trabalho: "var(--success)",
  Lazer: "var(--c-cyan)",
  Alimentação: "var(--c-amber)",
  Rotina: "var(--text-muted)",
};

const PERIODS = [
  { key: "Manhã" as const, icon: Sunrise, color: "var(--c-amber)" },
  { key: "Tarde" as const, icon: Sun, color: "var(--accent)" },
  { key: "Noite" as const, icon: Moon, color: "var(--secondary)" },
];

const CATEGORIES: HabitCategory[] = [
  "Estudos", "Self care", "Meter o shape", "Aproximar de Deus",
  "Trabalho", "Lazer", "Alimentação", "Rotina",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtraTask = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  done: boolean;
};

type Tab = "rotina" | "configuracoes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

const WEEKDAY_BY_INDEX: Record<number, DayKey> = {
  0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
};

function weekdayKeyFromISO(iso: string): DayKey {
  return WEEKDAY_BY_INDEX[new Date(iso + "T12:00:00").getDay()];
}

function shiftDateISO(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Segunda-feira da semana que contém a data dada. */
function mondayOfWeek(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay(); // 0=Dom..6=Sáb
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return shiftDateISO(iso, diffToMonday);
}

function formatDateShort(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// Sempre que a rotina padrão (DEFAULT_HABITS_BY_DAY) for reestruturada, incrementar esta versão.
// Isso descarta customizações antigas salvas no navegador para que a nova rotina padrão apareça
// de fato, em vez de ficar presa atrás de uma versão anterior salva em localStorage.
const HABITS_SCHEMA_VERSION = "2026-07-30.4";

function loadDefaultHabits(day: DayKey): Habit[] {
  try {
    const storedVersion = localStorage.getItem("rotina-default-version");
    if (storedVersion !== HABITS_SCHEMA_VERSION) {
      ALL_DAYS.forEach((d) => localStorage.removeItem(`rotina-default-${d}`));
      localStorage.setItem("rotina-default-version", HABITS_SCHEMA_VERSION);
      return DEFAULT_HABITS_BY_DAY[day];
    }
    const saved = localStorage.getItem(`rotina-default-${day}`);
    if (saved) return JSON.parse(saved) as Habit[];
  } catch { /* ignore */ }
  return DEFAULT_HABITS_BY_DAY[day];
}

function saveDefaultHabits(day: DayKey, habits: Habit[]) {
  localStorage.setItem(`rotina-default-${day}`, JSON.stringify(habits));
}

function loadRemovedIds(date: string): string[] {
  try {
    const saved = localStorage.getItem(`rotina-removed-${date}`);
    if (saved) return JSON.parse(saved) as string[];
  } catch { /* ignore */ }
  return [];
}

// ─── Study types ──────────────────────────────────────────────────────────────

const STUDY_STEPS = ["Aula", "Leitura", "Exercícios", "Revisão", "Domínio"] as const;
type StudyStep = typeof STUDY_STEPS[number];

const SUBJECT_COLORS_ROTINA: Record<string, string> = {
  Biologia: "var(--c-green)", Química: "var(--accent)", Física: "var(--c-blue)",
  Matemática: "var(--c-pink)", Português: "var(--c-amber)", Redação: "var(--c-lilac)",
  História: "var(--c-rose)", Geografia: "var(--success)", Literatura: "var(--secondary)",
  Sociologia: "var(--text-muted)", Filosofia: "var(--text-muted)", Inglês: "var(--c-cyan)",
  Atualidades: "var(--c-cyan)",
};

const SUBJECTS_LIST = Object.keys(SUBJECT_COLORS_ROTINA);

type StudyTask = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  step: StudyStep;
  done: boolean;
  isRevision?: boolean; // true = revisão de dia anterior
  ankiCards?: number;
};

function prevDateISO(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStudyTasks(date: string): StudyTask[] {
  try {
    const raw = localStorage.getItem(`study-tasks-${date}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveStudyTasks(date: string, tasks: StudyTask[]) {
  localStorage.setItem(`study-tasks-${date}`, JSON.stringify(tasks));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RotinaPage() {
  const todayKey = getTodayKey();
  const todayDate = getTodayDate();

  const [tab, setTab] = useState<Tab>("rotina");
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const selectedDay = weekdayKeyFromISO(selectedDate);
  const [jumpDate, setJumpDate] = useState(todayDate);
  const [openRegistrations, setOpenRegistrations] = useState<VestibularRegistration[]>([]);
  useEffect(() => { setOpenRegistrations(pendingOpenRegistrations()); }, []);

  // Rotina view state
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [extras, setExtras] = useState<ExtraTask[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", timeOfDay: "Manhã" as TimeOfDay, time: "" });

  // Configurações view state
  const [configDay, setConfigDay] = useState<DayKey>(todayKey);
  const [configHabits, setConfigHabits] = useState<Habit[]>([]);
  const [configDirty, setConfigDirty] = useState(false);
  const [addingConfig, setAddingConfig] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState<Omit<Habit, "id">>({
    name: "", timeOfDay: "Manhã", category: "Rotina", time: "06:00",
  });

  // Study block state
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [newStudy, setNewStudy] = useState({ subject: SUBJECTS_LIST[0], topic: "", step: "Aula" as StudyStep });

  // Load rotina state when the selected date changes. Cada data real (não cada dia da
  // semana genérico) tem seu próprio progresso agora, então navegar pra semana passada ou
  // futura mostra o estado daquele dia específico.
  useEffect(() => {
    // Migração leve: se a data de hoje ainda não tem nada salvo na chave nova (por data), mas
    // existe progresso salvo na chave antiga (por dia da semana), aproveita pra não perder o
    // que já tinha sido marcado antes dessa mudança.
    const oldChecked = selectedDate === todayDate ? localStorage.getItem(`rotina-checked-${selectedDay}`) : null;
    const savedChecked = localStorage.getItem(`rotina-checked-${selectedDate}`) ?? oldChecked;
    const parsedChecked = savedChecked ? JSON.parse(savedChecked) : {};
    // Skincare manhã/noite espelham o passo a passo da tela Self Care (só faz sentido para o dia real de hoje)
    if (selectedDate === todayDate) {
      parsedChecked["skincare-manha"] = isSkincareComplete(todayDate, "morning");
      parsedChecked["skincare-noite"] = isSkincareComplete(todayDate, "evening");
    }
    setChecked(parsedChecked);
    const oldExtras = selectedDate === todayDate ? localStorage.getItem(`rotina-extras-${selectedDay}`) : null;
    const savedExtras = localStorage.getItem(`rotina-extras-${selectedDate}`) ?? oldExtras;
    setExtras(savedExtras ? JSON.parse(savedExtras) : []);
    const oldRemoved = selectedDate === todayDate ? localStorage.getItem(`rotina-removed-${selectedDay}`) : null;
    const savedRemoved = localStorage.getItem(`rotina-removed-${selectedDate}`) ?? oldRemoved;
    setRemoved(savedRemoved ? JSON.parse(savedRemoved) : []);
    setStudyTasks(loadStudyTasks(todayDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, todayDate]);

  useEffect(() => {
    localStorage.setItem(`rotina-checked-${selectedDate}`, JSON.stringify(checked));
  }, [checked, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`rotina-extras-${selectedDate}`, JSON.stringify(extras));
  }, [extras, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`rotina-removed-${selectedDate}`, JSON.stringify(removed));
  }, [removed, selectedDate]);

  // Load config habits when configDay changes
  useEffect(() => {
    setConfigHabits(loadDefaultHabits(configDay));
    setConfigDirty(false);
    setEditingId(null);
    setAddingConfig(false);
  }, [configDay]);

  const habits = loadDefaultHabits(selectedDay).filter((h) => !removed.includes(h.id));

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = !prev[id];
      if (selectedDate === todayDate && (id === "skincare-manha" || id === "skincare-noite")) {
        setSkincarePeriodComplete(todayDate, id === "skincare-manha" ? "morning" : "evening", next);
      }
      return { ...prev, [id]: next };
    });

  const toggleExtra = (id: string) =>
    setExtras((prev) => prev.map((e) => e.id === id ? { ...e, done: !e.done } : e));

  const addExtra = () => {
    if (!newTask.name.trim()) return;
    setExtras((prev) => [
      ...prev,
      { id: `extra-${Date.now()}`, name: newTask.name.trim(), timeOfDay: newTask.timeOfDay, done: false },
    ]);
    setNewTask({ name: "", timeOfDay: "Manhã", time: "" });
    setAdding(false);
  };

  const removeExtra = (id: string) =>
    setExtras((prev) => prev.filter((e) => e.id !== id));

  const removeFromDay = (habitId: string) =>
    setRemoved((prev) => [...prev, habitId]);

  const restoreAll = () => setRemoved([]);

  const allDone = habits.filter((h) => checked[h.id]).length;
  const extrasDone = extras.filter((e) => e.done).length;
  const totalDone = allDone + extrasDone;
  const totalTasks = habits.length + extras.length;
  const isToday = selectedDate === todayDate;

  // ─── Study actions ────────────────────────────────────────────────────────

  const addStudyTask = () => {
    if (!newStudy.topic.trim()) return;
    const task: StudyTask = {
      id: `st-${Date.now()}`,
      date: todayDate,
      subject: newStudy.subject,
      topic: newStudy.topic.trim(),
      step: newStudy.step,
      done: false,
    };
    const updated = [...studyTasks, task];
    setStudyTasks(updated);
    saveStudyTasks(todayDate, updated);
    setNewStudy({ subject: SUBJECTS_LIST[0], topic: "", step: "Aula" });
    setShowAddStudy(false);
  };

  const toggleStudyTask = (id: string) => {
    const updated = studyTasks.map((t) => t.id === id ? { ...t, done: !t.done } : t);
    setStudyTasks(updated);
    saveStudyTasks(todayDate, updated);
  };

  const removeStudyTask = (id: string) => {
    const updated = studyTasks.filter((t) => t.id !== id);
    setStudyTasks(updated);
    saveStudyTasks(todayDate, updated);
  };

  const advanceStep = (id: string) => {
    const updated = studyTasks.map((t) => {
      if (t.id !== id) return t;
      const idx = STUDY_STEPS.indexOf(t.step);
      const nextStep = STUDY_STEPS[Math.min(idx + 1, STUDY_STEPS.length - 1)];
      return { ...t, step: nextStep };
    });
    setStudyTasks(updated);
    saveStudyTasks(todayDate, updated);
  };

  const yesterdayTasks = loadStudyTasks(prevDateISO(todayDate));
  const revisionsFromYesterday = yesterdayTasks.filter((t) => t.done);
  const isSaturday = new Date().getDay() === 6;

  // ─── Config actions ────────────────────────────────────────────────────────

  const saveConfig = () => {
    saveDefaultHabits(configDay, configHabits);
    setConfigDirty(false);
  };

  const resetConfigDay = () => {
    const defaults = DEFAULT_HABITS_BY_DAY[configDay];
    setConfigHabits(defaults);
    setConfigDirty(true);
  };

  const addConfigHabit = () => {
    if (!newHabit.name.trim()) return;
    const habit: Habit = {
      id: `custom-${configDay.toLowerCase()}-${Date.now()}`,
      ...newHabit,
      name: newHabit.name.trim(),
    };
    const updated = [...configHabits, habit].sort((a, b) => a.time.localeCompare(b.time));
    setConfigHabits(updated);
    setConfigDirty(true);
    setNewHabit({ name: "", timeOfDay: "Manhã", category: "Rotina", time: "06:00" });
    setAddingConfig(false);
  };

  const deleteConfigHabit = (id: string) => {
    setConfigHabits((prev) => prev.filter((h) => h.id !== id));
    setConfigDirty(true);
  };

  const updateConfigHabit = (id: string, field: keyof Habit, value: string) => {
    setConfigHabits((prev) =>
      prev.map((h) => h.id === id ? { ...h, [field]: value } : h)
    );
    setConfigDirty(true);
  };

  const finishEdit = () => {
    const sorted = [...configHabits].sort((a, b) => a.time.localeCompare(b.time));
    setConfigHabits(sorted);
    setEditingId(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Rotina"
        subtitle="Central de execução do dia"
        icon={<CalendarHeart size={24} />}
        accent="var(--c-pink)"
        action={
          <div className="flex items-center gap-2">
            {tab === "rotina" && (
              <Badge color="var(--c-pink)">{totalDone}/{totalTasks} concluídas</Badge>
            )}
            <button
              onClick={() => setTab(tab === "rotina" ? "configuracoes" : "rotina")}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-c-pink/50 hover:text-c-pink"
            >
              {tab === "rotina" ? (
                <><Settings size={13} /> Configurações</>
              ) : (
                <><ChevronLeft size={13} /> Voltar</>
              )}
            </button>
          </div>
        }
      />

      {/* ─── ROTINA VIEW ─────────────────────────────────────────────── */}
      {tab === "rotina" && (
        <>
          {/* Inscrições abertas — lembrete automático */}
          {openRegistrations.length > 0 && (
            <Card glow>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}>
                  <CalendarClock size={20} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">
                    {openRegistrations.length === 1
                      ? `Inscrição aberta: ${openRegistrations[0].name}!`
                      : `${openRegistrations.length} inscrições abertas!`}
                  </p>
                  <p className="text-xs text-text-muted">
                    {openRegistrations.map((v) => v.name).join(", ")} — não esqueça de se inscrever.
                  </p>
                </div>
                <a
                  href="/vestibulares"
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--danger)" }}
                >
                  Ver e marcar
                </a>
              </div>
            </Card>
          )}

          {/* Seletor de semana/dia */}
          <Card>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate((d) => shiftDateISO(d, -7))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-text-muted transition-colors hover:border-c-pink/40 hover:text-c-pink"
                title="Semana anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
                {ALL_DAYS.map((day, i) => {
                  const dateForDay = shiftDateISO(mondayOfWeek(selectedDate), i);
                  const active = dateForDay === selectedDate;
                  const isCurrentDay = dateForDay === todayDate;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateForDay)}
                      className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background: active ? "color-mix(in srgb, var(--c-pink) 18%, transparent)" : "transparent",
                        color: active ? "var(--c-pink)" : "var(--text-secondary)",
                        border: active ? "1px solid color-mix(in srgb, var(--c-pink) 35%, transparent)" : "1px solid transparent",
                      }}
                    >
                      <span>{DAY_ABBR[day]}</span>
                      <span className="text-[10px] font-normal text-text-muted">{formatDateShort(dateForDay)}</span>
                      {isCurrentDay && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: active ? "var(--c-pink)" : "var(--text-muted)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setSelectedDate((d) => shiftDateISO(d, 7))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-text-muted transition-colors hover:border-c-pink/40 hover:text-c-pink"
                title="Próxima semana"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs text-text-muted">
                {isToday ? "📍 Hoje" : `Planejando ${selectedDay}, ${formatDateShort(selectedDate)}`}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {selectedDate !== todayDate && (
                  <button
                    onClick={() => { setSelectedDate(todayDate); setJumpDate(todayDate); }}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-muted transition-colors hover:border-c-pink/40 hover:text-c-pink"
                  >
                    Voltar para hoje
                  </button>
                )}
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  Ir para data:
                  <input
                    type="date"
                    value={jumpDate}
                    onChange={(e) => {
                      setJumpDate(e.target.value);
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs outline-none focus:border-c-pink/50"
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <ProgressRing value={pct(totalDone, totalTasks)} color="var(--c-pink)" />
                <div>
                  <p className="text-sm font-bold">Progresso</p>
                  <p className="text-xs text-text-muted">do dia</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                  <Flame size={22} />
                </span>
                <div>
                  <p className="text-xl font-extrabold">{STUDY_STREAK}</p>
                  <p className="text-xs text-text-muted">dias seguidos</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <ProgressRing
                  value={pct(WATER_GLASSES.current, WATER_GLASSES.target)}
                  color="var(--c-blue)"
                  label={`${WATER_GLASSES.current}/${WATER_GLASSES.target}`}
                />
                <div>
                  <p className="text-sm font-bold">Água</p>
                  <p className="text-xs text-text-muted">copos hoje</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--secondary) 14%, transparent)", color: "var(--secondary)" }}>
                  <CheckCircle2 size={22} />
                </span>
                <div>
                  <p className="text-xl font-extrabold">{REVISIONS.filter((r) => r.due).length}</p>
                  <p className="text-xs text-text-muted">revisões hoje</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Timeline por período */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PERIODS.map((p) => {
              const habitItems = habits.filter((h) => h.timeOfDay === p.key);
              const extraItems = extras.filter((e) => e.timeOfDay === p.key);
              const periodDone =
                habitItems.filter((h) => checked[h.id]).length +
                extraItems.filter((e) => e.done).length;
              const periodTotal = habitItems.length + extraItems.length;
              const Icon = p.icon;

              return (
                <Card key={p.key} className="flex flex-col gap-4">
                  <SectionTitle
                    action={
                      <span className="text-xs text-text-muted">{periodDone}/{periodTotal}</span>
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} style={{ color: p.color }} />
                      {p.key}
                    </span>
                  </SectionTitle>

                  <div className="space-y-2">
                    {habitItems.map((h) => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        checked={!!checked[h.id]}
                        onToggle={() => toggle(h.id)}
                        onRemove={() => removeFromDay(h.id)}
                        categoryColor={CATEGORY_COLORS[h.category] ?? "var(--text-muted)"}
                      />
                    ))}

                    <AnimatePresence>
                      {extraItems.map((e) => (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/30 px-3 py-2.5"
                        >
                          <button
                            onClick={() => toggleExtra(e.id)}
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] transition-all ${
                              e.done ? "border-success bg-success text-white" : "border-border-strong text-transparent"
                            }`}
                          >
                            ✓
                          </button>
                          <div className="min-w-0 flex-1">
                            <p title={e.name} className={`text-sm ${e.done ? "text-text-muted line-through" : "font-medium"}`}>
                              {e.name}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-text-muted">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                              Tarefa do dia
                            </p>
                          </div>
                          <button onClick={() => removeExtra(e.id)} className="text-text-muted opacity-50 hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {habitItems.length === 0 && extraItems.length === 0 && (
                      <p className="py-3 text-center text-xs text-text-muted">Nada planejado</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ─── Bloco de Estudos do Dia ─────────────────────────────── */}
          {isToday && (
            <div className="space-y-4">
              {/* Técnica TAB — só sábado */}
              {isSaturday && (
                <Card glow>
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                      style={{ background: "color-mix(in srgb, var(--c-amber) 18%, transparent)" }}>
                      ⚡
                    </div>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: "var(--c-amber)" }}>Técnica TAB — Sábado</p>
                      <p className="text-xs text-text-muted mt-0.5">Resolva 15 questões de simulado de qualquer conteúdo hoje.</p>
                    </div>
                    <Zap size={20} style={{ color: "var(--c-amber)" }} className="ml-auto shrink-0" />
                  </div>
                </Card>
              )}

              {/* Revisões do dia anterior */}
              {revisionsFromYesterday.length > 0 && (
                <Card>
                  <SectionTitle>
                    <span className="flex items-center gap-2">
                      <RotateCcw size={15} style={{ color: "var(--secondary)" }} />
                      Revisões de ontem ({revisionsFromYesterday.length})
                    </span>
                  </SectionTitle>
                  <div className="mt-2 space-y-1.5">
                    {revisionsFromYesterday.map((t) => {
                      const color = SUBJECT_COLORS_ROTINA[t.subject] ?? "var(--text-muted)";
                      return (
                        <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/30 px-3 py-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                          <span className="flex-1 text-sm"><b>{t.subject}</b> — {t.topic}</span>
                          <Badge color="var(--secondary)">Revisar hoje</Badge>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-text-muted">💡 Faça Anki + exercícios de cada um desses conteúdos.</p>
                </Card>
              )}

              {/* Conteúdos do dia */}
              <Card>
                <div className="flex items-center justify-between">
                  <SectionTitle>
                    <span className="flex items-center gap-2">
                      <GraduationCap size={15} style={{ color: "var(--primary)" }} />
                      Estudos do dia
                    </span>
                  </SectionTitle>
                  <button
                    onClick={() => setShowAddStudy((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Plus size={13} /> Adicionar
                  </button>
                </div>

                <AnimatePresence>
                  {showAddStudy && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold text-text-muted">Matéria</label>
                          <select
                            className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                            value={newStudy.subject}
                            onChange={(e) => setNewStudy((p) => ({ ...p, subject: e.target.value }))}
                          >
                            {SUBJECTS_LIST.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold text-text-muted">Conteúdo / Tópico</label>
                          <input
                            className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                            placeholder="Ex: Citologia"
                            value={newStudy.topic}
                            onChange={(e) => setNewStudy((p) => ({ ...p, topic: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && addStudyTask()}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold text-text-muted">Passo atual</label>
                          <select
                            className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                            value={newStudy.step}
                            onChange={(e) => setNewStudy((p) => ({ ...p, step: e.target.value as StudyStep }))}
                          >
                            {STUDY_STEPS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2 sm:col-span-3">
                          <button onClick={addStudyTask} className="flex-1 rounded-lg py-1.5 text-xs font-bold text-white" style={{ background: "var(--primary)" }}>Salvar</button>
                          <button onClick={() => setShowAddStudy(false)} className="rounded-lg border border-border px-3 text-xs text-text-muted hover:text-text">Cancelar</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-3 space-y-2">
                  {studyTasks.length === 0 && (
                    <p className="py-4 text-center text-xs text-text-muted">Nenhum conteúdo adicionado ainda. Clique em "+ Adicionar".</p>
                  )}
                  {studyTasks.map((t) => {
                    const color = SUBJECT_COLORS_ROTINA[t.subject] ?? "var(--text-muted)";
                    const stepIdx = STUDY_STEPS.indexOf(t.step);
                    return (
                      <div key={t.id}
                        className="rounded-xl border px-3 py-2.5 transition-colors"
                        style={{
                          borderColor: t.done ? "color-mix(in srgb, var(--success) 30%, transparent)" : "var(--border)",
                          background: t.done ? "color-mix(in srgb, var(--success) 5%, transparent)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleStudyTask(t.id)}
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] transition-all"
                            style={{ borderColor: t.done ? "var(--success)" : "var(--border-strong)", background: t.done ? "var(--success)" : "transparent", color: "#fff" }}
                          >
                            {t.done && "✓"}
                          </button>
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${t.done ? "line-through text-text-muted" : ""}`}>
                              <span style={{ color }}>{t.subject}</span> — {t.topic}
                            </p>
                            {/* Trilha do método */}
                            <div className="mt-1.5 flex items-center gap-1">
                              {STUDY_STEPS.map((step, i) => (
                                <span key={step} className="flex items-center gap-1">
                                  <span
                                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                    style={{
                                      background: i < stepIdx ? "color-mix(in srgb, var(--success) 18%, transparent)" : i === stepIdx ? color : "var(--surface-2)",
                                      color: i < stepIdx ? "var(--success)" : i === stepIdx ? color : "var(--text-muted)",
                                    }}
                                  >
                                    {step}
                                  </span>
                                  {i < STUDY_STEPS.length - 1 && <ChevronRight size={9} className="text-border-strong" />}
                                </span>
                              ))}
                            </div>
                          </div>
                          {!t.done && stepIdx < STUDY_STEPS.length - 1 && (
                            <button onClick={() => advanceStep(t.id)}
                              className="shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-text-muted hover:border-primary/50 hover:text-primary transition-colors">
                              Avançar →
                            </button>
                          )}
                          <button onClick={() => removeStudyTask(t.id)} className="shrink-0 text-text-muted opacity-50 hover:opacity-100">
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {studyTasks.length > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-2/40 px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <BookOpen size={13} /> {studyTasks.filter((t) => t.done).length}/{studyTasks.length} conteúdos concluídos hoje
                    </span>
                    <span className="text-text-muted">→ Revisão amanhã</span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Adicionar tarefa do dia */}
          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>Adicionar tarefa de {isToday ? "hoje" : selectedDay}</SectionTitle>
              {removed.length > 0 && (
                <button
                  onClick={restoreAll}
                  className="text-xs text-text-muted underline hover:text-c-pink"
                >
                  Restaurar {removed.length} removida{removed.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
            <AnimatePresence>
              {adding ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nome da tarefa..."
                    value={newTask.name}
                    onChange={(e) => setNewTask((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addExtra()}
                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-c-pink/60 focus:ring-2 focus:ring-c-pink/20"
                  />
                  <select
                    value={newTask.timeOfDay}
                    onChange={(e) => setNewTask((p) => ({ ...p, timeOfDay: e.target.value as TimeOfDay }))}
                    className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                  </select>
                  <button
                    onClick={addExtra}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--c-pink)" }}
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => setAdding(false)}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted hover:text-text"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted transition-colors hover:border-c-pink/50 hover:text-c-pink"
                >
                  <Plus size={16} /> Nova tarefa específica para {isToday ? "hoje" : selectedDay}
                </button>
              )}
            </AnimatePresence>
          </Card>

          {/* Matérias do dia */}
          <Card>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <Clock size={16} style={{ color: "var(--secondary)" }} />
                Estudos de {selectedDay}
              </span>
            </SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {habits
                .filter((h) => h.category === "Estudos")
                .map((h) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--secondary) 12%, transparent)",
                      color: "var(--secondary)",
                    }}
                  >
                    {checked[h.id] ? "✓" : "○"} {h.name} <span className="opacity-60">{h.time}</span>
                  </span>
                ))}
              {habits.filter((h) => h.category === "Estudos").length === 0 && (
                <span className="text-sm text-text-muted">Sem estudos hoje</span>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ─── CONFIGURAÇÕES VIEW ──────────────────────────────────────── */}
      {tab === "configuracoes" && (
        <>
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = day === configDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setConfigDay(day)}
                      className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                      style={{
                        background: active ? "color-mix(in srgb, var(--c-pink) 18%, transparent)" : "transparent",
                        color: active ? "var(--c-pink)" : "var(--text-secondary)",
                        border: active ? "1px solid color-mix(in srgb, var(--c-pink) 35%, transparent)" : "1px solid color-mix(in srgb, var(--border) 100%, transparent)",
                      }}
                    >
                      {DAY_ABBR[day]}
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={resetConfigDay}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text"
                >
                  Restaurar padrão
                </button>
                <button
                  onClick={saveConfig}
                  disabled={!configDirty}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: "var(--c-pink)" }}
                >
                  <Save size={13} /> Salvar {configDay}
                </button>
              </div>
            </div>
            {configDirty && (
              <p className="mt-2 text-xs text-warning">● Alterações não salvas</p>
            )}
          </Card>

          <p className="px-1 text-xs text-text-muted">
            Editar aqui muda o padrão de toda semana. Para remover um item só de um dia específico, vá em Rotina e use o botão de remover na tarefa.
          </p>

          {/* Lista de hábitos configuráveis por período */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PERIODS.map((p) => {
              const items = configHabits.filter((h) => h.timeOfDay === p.key);
              const Icon = p.icon;
              return (
                <Card key={p.key} className="flex flex-col gap-3">
                  <SectionTitle>
                    <span className="flex items-center gap-2">
                      <Icon size={16} style={{ color: p.color }} />
                      {p.key}
                    </span>
                  </SectionTitle>

                  <div className="space-y-2">
                    {items.map((h) =>
                      editingId === h.id ? (
                        <div key={h.id} className="space-y-2 rounded-xl border border-c-pink/30 bg-surface-2/60 p-3">
                          <input
                            autoFocus
                            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-c-pink/60"
                            value={h.name}
                            onChange={(e) => updateConfigHabit(h.id, "name", e.target.value)}
                          />
                          <div className="flex gap-2">
                            <input
                              type="time"
                              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none"
                              value={h.time}
                              onChange={(e) => updateConfigHabit(h.id, "time", e.target.value)}
                            />
                            <select
                              className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none"
                              value={h.timeOfDay}
                              onChange={(e) => updateConfigHabit(h.id, "timeOfDay", e.target.value)}
                            >
                              <option>Manhã</option>
                              <option>Tarde</option>
                              <option>Noite</option>
                            </select>
                          </div>
                          <select
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none"
                            value={h.category}
                            onChange={(e) => updateConfigHabit(h.id, "category", e.target.value)}
                          >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={finishEdit}
                              className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white"
                              style={{ background: "var(--c-pink)" }}
                            >
                              Pronto
                            </button>
                            <button
                              onClick={() => deleteConfigHabit(h.id)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs text-error hover:bg-error/10"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={h.id}
                          className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5"
                        >
                          <span className="text-xs tabular-nums text-text-muted w-10 shrink-0">{h.time}</span>
                          <div className="min-w-0 flex-1">
                            <p title={h.name} className="text-sm font-medium">{h.name}</p>
                            <Badge color={CATEGORY_COLORS[h.category] ?? "var(--text-muted)"}>{h.category}</Badge>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingId(h.id)}
                              className="grid h-7 w-7 place-items-center rounded-lg text-text-muted hover:text-c-pink"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => deleteConfigHabit(h.id)}
                              className="grid h-7 w-7 place-items-center rounded-lg text-text-muted hover:text-error"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {items.length === 0 && (
                      <p className="py-2 text-center text-xs text-text-muted">Sem itens</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Adicionar hábito padrão */}
          <Card>
            <SectionTitle>Adicionar ao padrão de {configDay}</SectionTitle>
            <AnimatePresence>
              {addingConfig ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <input
                    autoFocus
                    placeholder="Nome da tarefa..."
                    value={newHabit.name}
                    onChange={(e) => setNewHabit((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-c-pink/60"
                  />
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newHabit.time}
                      onChange={(e) => setNewHabit((p) => ({ ...p, time: e.target.value }))}
                      className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none"
                    />
                    <select
                      value={newHabit.timeOfDay}
                      onChange={(e) => setNewHabit((p) => ({ ...p, timeOfDay: e.target.value as TimeOfDay }))}
                      className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none"
                    >
                      <option>Manhã</option>
                      <option>Tarde</option>
                      <option>Noite</option>
                    </select>
                    <select
                      value={newHabit.category}
                      onChange={(e) => setNewHabit((p) => ({ ...p, category: e.target.value as HabitCategory }))}
                      className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addConfigHabit}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                      style={{ background: "var(--c-pink)" }}
                    >
                      Adicionar ao padrão
                    </button>
                    <button
                      onClick={() => setAddingConfig(false)}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted hover:text-text"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setAddingConfig(true)}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted hover:border-c-pink/50 hover:text-c-pink transition-colors"
                >
                  <Plus size={16} /> Nova tarefa padrão para {configDay}
                </button>
              )}
            </AnimatePresence>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── HabitRow Component ───────────────────────────────────────────────────────

function HabitRow({
  habit, checked, onToggle, onRemove, categoryColor,
}: {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  categoryColor: string;
}) {
  return (
    <motion.div
      layout
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5"
    >
      <button
        onClick={onToggle}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] transition-all ${
          checked
            ? "border-success bg-success text-white"
            : "border-border-strong text-transparent hover:border-text-muted"
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p title={habit.name} className={`text-sm ${checked ? "text-text-muted line-through" : "font-medium"}`}>
          {habit.name}
        </p>
        <p className="text-[11px] text-text-muted">{habit.time}</p>
      </div>
      <Badge color={categoryColor}>{habit.category}</Badge>
      <button
        onClick={onRemove}
        title="Remover só de hoje"
        className="ml-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}
