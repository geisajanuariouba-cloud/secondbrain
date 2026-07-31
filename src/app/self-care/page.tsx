"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Heart, BookOpen, CheckCircle2, Circle, Plus, X, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { SKINCARE_MORNING, SKINCARE_EVENING, WEEKLY_CARE, MOOD_LOG, GRATITUDE_LOG, type SkinStep, type WeeklyCareItem, type MoodEntry } from "@/lib/data";
import { loadSkincareSteps, toggleSkincareStep } from "@/lib/skincare-store";
import { todayLocalISO } from "@/lib/date-utils";

const WEEKLY_CARE_KEY = "self-care-weekly";

const MOOD_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: "Mal", emoji: "😞", color: "var(--danger)" },
  2: { label: "Regular", emoji: "😐", color: "var(--c-amber)" },
  3: { label: "Ok", emoji: "🙂", color: "var(--warning)" },
  4: { label: "Bem", emoji: "😊", color: "var(--c-green)" },
  5: { label: "Ótimo", emoji: "🤩", color: "var(--c-lilac)" },
};

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getTodayISO() {
  return todayLocalISO();
}

export default function SelfCarePage() {
  const today = getTodayISO();
  const [morning, setMorning] = useState<SkinStep[]>(SKINCARE_MORNING);
  const [evening, setEvening] = useState<SkinStep[]>(SKINCARE_EVENING);
  const [weekly, setWeekly] = useState<WeeklyCareItem[]>(WEEKLY_CARE);
  const [moodLog, setMoodLog] = useState<MoodEntry[]>(MOOD_LOG);
  const [gratitude, setGratitude] = useState(GRATITUDE_LOG);
  const [newGratitude, setNewGratitude] = useState("");
  const [addingGratitude, setAddingGratitude] = useState(false);

  useEffect(() => {
    const steps = loadSkincareSteps(today);
    setMorning(steps.morning);
    setEvening(steps.evening);
    try {
      const saved = localStorage.getItem(WEEKLY_CARE_KEY);
      if (saved) setWeekly(JSON.parse(saved));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMorning = (id: string) => {
    toggleSkincareStep(today, "morning", id);
    setMorning((prev) => prev.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  };
  const toggleEvening = (id: string) => {
    toggleSkincareStep(today, "evening", id);
    setEvening((prev) => prev.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  };
  const toggleWeekly = (id: string) =>
    setWeekly((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, done: !w.done } : w);
      localStorage.setItem(WEEKLY_CARE_KEY, JSON.stringify(next));
      return next;
    });

  const setTodayMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    setMoodLog((prev) => {
      const last = prev[prev.length - 1];
      if (last?.date === today) {
        return [...prev.slice(0, -1), { ...last, mood }];
      }
      return [...prev, { date: today, mood }];
    });
  };

  const addGratitude = () => {
    if (!newGratitude.trim()) return;
    setGratitude((prev) => {
      const entry = prev.find((e) => e.date === today);
      if (entry) {
        return prev.map((e) =>
          e.date === today ? { ...e, items: [...e.items, newGratitude.trim()] } : e
        );
      }
      return [{ date: today, items: [newGratitude.trim()] }, ...prev];
    });
    setNewGratitude("");
    setAddingGratitude(false);
  };

  const todayMood = moodLog[moodLog.length - 1]?.mood ?? 3;
  const morningDone = morning.filter((s) => s.done).length;
  const eveningDone = evening.filter((s) => s.done).length;
  const weeklyDone = weekly.filter((w) => w.done).length;
  const todayGratitude = gratitude.find((e) => e.date === today);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Self Care"
        subtitle="Cuide de você para dar o seu melhor"
        icon={<Sparkles size={24} />}
        accent="var(--c-lilac)"
        action={<Badge color="var(--c-lilac)">{MOOD_LABELS[todayMood].emoji} {MOOD_LABELS[todayMood].label} hoje</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skincare manhã */}
        <Card>
          <SectionTitle
            action={<span className="text-xs text-text-muted">{morningDone}/{morning.length}</span>}
          >
            <span className="flex items-center gap-2">
              <Sun size={16} style={{ color: "var(--c-amber)" }} /> Skincare Manhã
            </span>
          </SectionTitle>
          <div className="mt-3 space-y-2">
            {morning.map((step, i) => (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => toggleMorning(step.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-c-lilac/40 ${
                  step.done ? "border-c-lilac/30 bg-surface-2/30 opacity-70" : "border-border bg-surface-2/40"
                }`}
              >
                {step.done
                  ? <CheckCircle2 size={18} style={{ color: "var(--c-lilac)" }} />
                  : <Circle size={18} className="text-text-muted" />}
                <span className={`text-sm ${step.done ? "line-through text-text-muted" : "font-medium"}`}>
                  {step.name}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Skincare noite */}
        <Card>
          <SectionTitle
            action={<span className="text-xs text-text-muted">{eveningDone}/{evening.length}</span>}
          >
            <span className="flex items-center gap-2">
              <Moon size={16} style={{ color: "var(--secondary)" }} /> Skincare Noite
            </span>
          </SectionTitle>
          <div className="mt-3 space-y-2">
            {evening.map((step, i) => (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => toggleEvening(step.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-secondary/40 ${
                  step.done ? "border-secondary/30 bg-surface-2/30 opacity-70" : "border-border bg-surface-2/40"
                }`}
              >
                {step.done
                  ? <CheckCircle2 size={18} style={{ color: "var(--secondary)" }} />
                  : <Circle size={18} className="text-text-muted" />}
                <span className={`text-sm ${step.done ? "line-through text-text-muted" : "font-medium"}`}>
                  {step.name}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>
      </div>

      {/* Cuidados semanais */}
      <Card>
        <SectionTitle
          action={<span className="text-xs text-text-muted">{weeklyDone}/{weekly.length}</span>}
        >
          <span className="flex items-center gap-2">
            <CalendarClock size={16} style={{ color: "var(--c-rose)" }} /> Cuidados semanais
          </span>
        </SectionTitle>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {weekly.map((w, i) => (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggleWeekly(w.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-c-rose/40 ${
                w.done ? "border-c-rose/30 bg-surface-2/30 opacity-70" : "border-border bg-surface-2/40"
              }`}
            >
              {w.done
                ? <CheckCircle2 size={18} style={{ color: "var(--c-rose)" }} />
                : <Circle size={18} className="text-text-muted" />}
              <span className="flex-1 min-w-0">
                <span className={`block text-sm ${w.done ? "line-through text-text-muted" : "font-medium"}`}>
                  {w.name}
                </span>
                <span className="text-[11px] text-text-muted">{w.frequency}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Humor do dia */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <Heart size={16} style={{ color: "var(--c-rose)" }} /> Como você está hoje?
          </span>
        </SectionTitle>
        <div className="mt-4 flex justify-around">
          {([1, 2, 3, 4, 5] as const).map((mood) => {
            const m = MOOD_LABELS[mood];
            const active = todayMood === mood;
            return (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTodayMood(mood)}
                className="flex flex-col items-center gap-2 rounded-2xl px-4 py-3 transition-all"
                style={{
                  background: active ? `color-mix(in srgb, ${m.color} 15%, transparent)` : "transparent",
                  border: active ? `1px solid color-mix(in srgb, ${m.color} 40%, transparent)` : "1px solid transparent",
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: active ? m.color : "var(--text-muted)" }}>
                  {m.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Histórico de humor */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Últimos 7 dias</p>
          <div className="flex justify-between">
            {moodLog.map((entry, i) => {
              const m = MOOD_LABELS[entry.mood];
              return (
                <div key={entry.date} className="flex flex-col items-center gap-1">
                  <span className="text-xl" title={entry.note}>{m.emoji}</span>
                  <span className="text-[10px] text-text-muted">{DAY_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Gratidão */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: "var(--c-lilac)" }} /> Gratidão de hoje
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-2">
          {(todayGratitude?.items ?? []).map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5 text-sm"
            >
              <span style={{ color: "var(--c-lilac)" }}>✦</span>
              {item}
            </motion.div>
          ))}

          {addingGratitude ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGratitude()}
                placeholder="Pelo que você é grata hoje?"
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-c-lilac/60"
              />
              <button
                onClick={addGratitude}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-white"
                style={{ background: "var(--c-lilac)" }}
              >
                Salvar
              </button>
              <button
                onClick={() => setAddingGratitude(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingGratitude(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-text-muted transition-colors hover:border-c-lilac/50 hover:text-c-lilac"
            >
              <Plus size={14} /> Adicionar gratidão
            </button>
          )}
        </div>

        {/* Histórico de gratidão */}
        {gratitude.slice(1, 3).map((entry) => (
          <div key={entry.date} className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-text-muted">{entry.date === "2026-06-27" ? "Ontem" : entry.date}</p>
            <div className="flex flex-wrap gap-1.5">
              {entry.items.map((item) => (
                <span key={item} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
