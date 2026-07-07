"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarHeart, Sunrise, Sun, Moon, Flame, CheckCircle2,
  Plus, X, Trash2, Clock, Settings, ChevronLeft, Pencil, Save,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { WATER_GLASSES, STUDY_STREAK, REVISIONS } from "@/lib/data";
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

function loadDefaultHabits(day: DayKey): Habit[] {
  try {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RotinaPage() {
  const todayKey = getTodayKey();
  const todayDate = getTodayDate();

  const [tab, setTab] = useState<Tab>("rotina");
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);

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

  // Load rotina state when day changes
  useEffect(() => {
    const savedChecked = localStorage.getItem(`rotina-checked-${selectedDay}`);
    setChecked(savedChecked ? JSON.parse(savedChecked) : {});
    const savedExtras = localStorage.getItem(`rotina-extras-${selectedDay}`);
    setExtras(savedExtras ? JSON.parse(savedExtras) : []);
    // removed is per date (today only makes sense, but track per day label for planning)
    const savedRemoved = localStorage.getItem(`rotina-removed-${selectedDay}`);
    setRemoved(savedRemoved ? JSON.parse(savedRemoved) : []);
  }, [selectedDay]);

  useEffect(() => {
    localStorage.setItem(`rotina-checked-${selectedDay}`, JSON.stringify(checked));
  }, [checked, selectedDay]);

  useEffect(() => {
    localStorage.setItem(`rotina-extras-${selectedDay}`, JSON.stringify(extras));
  }, [extras, selectedDay]);

  useEffect(() => {
    localStorage.setItem(`rotina-removed-${selectedDay}`, JSON.stringify(removed));
  }, [removed, selectedDay]);

  // Load config habits when configDay changes
  useEffect(() => {
    setConfigHabits(loadDefaultHabits(configDay));
    setConfigDirty(false);
    setEditingId(null);
    setAddingConfig(false);
  }, [configDay]);

  const habits = loadDefaultHabits(selectedDay).filter((h) => !removed.includes(h.id));

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

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
  const isToday = selectedDay === todayKey;

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
          {/* Seletor de dia */}
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              {ALL_DAYS.map((day) => {
                const active = day === selectedDay;
                const isCurrentDay = day === todayKey;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                    style={{
                      background: active ? "color-mix(in srgb, var(--c-pink) 18%, transparent)" : "transparent",
                      color: active ? "var(--c-pink)" : "var(--text-secondary)",
                      border: active ? "1px solid color-mix(in srgb, var(--c-pink) 35%, transparent)" : "1px solid transparent",
                    }}
                  >
                    <span>{DAY_ABBR[day]}</span>
                    {isCurrentDay && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: active ? "var(--c-pink)" : "var(--text-muted)" }}
                      />
                    )}
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-text-muted">
                {isToday ? "📍 Hoje" : `Planejando ${selectedDay}`}
              </span>
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
                            <p className={`truncate text-sm ${e.done ? "text-text-muted line-through" : "font-medium"}`}>
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
                            <p className="truncate text-sm font-medium">{h.name}</p>
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
        <p className={`truncate text-sm ${checked ? "text-text-muted line-through" : "font-medium"}`}>
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
