"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Scale, Utensils, Dumbbell, Plus, Trash2, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { BODY_MEASUREMENTS, DIET_GOALS } from "@/lib/data";
import { todayLocalISO } from "@/lib/date-utils";

const TABS = ["Corpo", "Nutrição", "Treino"] as const;
type Tab = typeof TABS[number];

const MEALS_TEMPLATE: {
  id: string; label: string; time: string; items: string[];
  calories: number; protein: number; carbs: number; fat: number;
}[] = [];

const WORKOUT_PLAN: { day: string; name: string; exercises: string[] }[] = [];

// ── Corpo ──
function CorpoTab() {
  const [measurements, setMeasurements] = useState(BODY_MEASUREMENTS);
  const [newWeight, setNewWeight] = useState("");
  const latest = measurements[measurements.length - 1];
  const first = measurements[0];

  const addMeasurement = () => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) return;
    const today = todayLocalISO();
    setMeasurements((prev) => [...prev, { date: today, weight: w }]);
    setNewWeight("");
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Peso atual", value: latest ? `${latest.weight} kg` : "—", color: "var(--c-rose)" },
          { label: "% Gordura", value: latest?.bodyFat != null ? `${latest.bodyFat}%` : "—", color: "var(--c-amber)" },
          { label: "Cintura", value: latest?.waist != null ? `${latest.waist} cm` : "—", color: "var(--secondary)" },
          { label: "Quadril", value: latest?.hip != null ? `${latest.hip} cm` : "—", color: "var(--c-lilac)" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Gráfico de peso */}
      <Card>
        <SectionTitle>Evolução de peso</SectionTitle>
        {measurements.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">Nenhuma medida registrada ainda.</p>
        )}
        <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 120 }}>
          {measurements.map((m, i) => {
            const weights = measurements.map((x) => x.weight);
            const min = Math.min(...weights) - 1;
            const max = Math.max(...weights) + 1;
            const pct = ((m.weight - min) / (max - min)) * 80 + 10;
            const isLast = i === measurements.length - 1;
            return (
              <div key={m.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: isLast ? "var(--primary)" : "var(--text-muted)" }}>{m.weight}</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${pct}%`,
                    background: isLast ? "var(--primary)" : "var(--surface-2)",
                    minHeight: 8,
                  }}
                />
                <span className="text-[9px] text-text-muted">{new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="Novo peso (kg)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMeasurement()}
            className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary/60"
          />
          <button
            onClick={addMeasurement}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={14} /> Registrar
          </button>
        </div>
      </Card>

      {/* Histórico */}
      <Card>
        <SectionTitle>Histórico de medidas</SectionTitle>
        <div className="mt-3 space-y-1.5">
          {[...measurements].reverse().map((m) => (
            <div key={m.date} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
              <Scale size={14} className="text-text-muted shrink-0" />
              <span className="flex-1 text-text-muted">{new Date(m.date).toLocaleDateString("pt-BR")}</span>
              <span className="font-bold">{m.weight} kg</span>
              {m.bodyFat && <span className="text-text-muted">{m.bodyFat}% G</span>}
              {m.waist && <span className="text-text-muted">{m.waist}cm C</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Nutrição ──
function NutricaoTab() {
  const [checkedMeals, setCheckedMeals] = useState<string[]>([]);
  const toggle = (id: string) =>
    setCheckedMeals((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const done = MEALS_TEMPLATE.filter((m) => checkedMeals.includes(m.id));
  const totalCal = done.reduce((s, m) => s + m.calories, 0);
  const totalProt = done.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = done.reduce((s, m) => s + m.carbs, 0);
  const totalFat = done.reduce((s, m) => s + m.fat, 0);

  return (
    <div className="space-y-5">
      {/* Macros do dia */}
      <Card glow>
        <SectionTitle>Macros de hoje</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Calorias", value: totalCal, max: DIET_GOALS.calories, color: "var(--c-amber)", suffix: " kcal" },
            { label: "Proteína", value: totalProt, max: DIET_GOALS.protein, color: "var(--c-rose)", suffix: "g" },
            { label: "Carboidratos", value: totalCarbs, max: DIET_GOALS.carbs, color: "var(--primary)", suffix: "g" },
            { label: "Gordura", value: totalFat, max: DIET_GOALS.fat, color: "var(--c-blue)", suffix: "g" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold">{item.label}</span>
                <span className="text-text-muted">{item.value}{item.suffix} / {item.max}{item.suffix}</span>
              </div>
              <ProgressBar value={item.max ? Math.min(100, (item.value / item.max) * 100) : 0} color={item.color} />
            </div>
          ))}
        </div>
      </Card>

      {/* Refeições */}
      <div className="space-y-3">
        {MEALS_TEMPLATE.length === 0 && (
          <p className="text-sm text-text-muted">Nenhuma refeição cadastrada ainda.</p>
        )}
        {MEALS_TEMPLATE.map((meal) => {
          const checked = checkedMeals.includes(meal.id);
          return (
            <Card key={meal.id}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(meal.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 transition-all"
                  style={{
                    borderColor: checked ? "var(--success)" : "var(--border-strong)",
                    background: checked ? "var(--success)" : "transparent",
                    color: "#fff",
                  }}
                >
                  {checked && <Check size={14} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{meal.label}</p>
                    <span className="text-xs text-text-muted">{meal.time}</span>
                  </div>
                  <p className="text-xs text-text-muted">{meal.calories} kcal · {meal.protein}g prot</p>
                </div>
                {checked && <Badge color="var(--success)">✓ Feito</Badge>}
              </div>
              <div className="mt-2.5 pl-11">
                <ul className="space-y-0.5">
                  {meal.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="h-1 w-1 rounded-full bg-border-strong shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Treino ──
function TreinoTab() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const todayIdx = new Date().getDay();
  const todayShort = days[todayIdx];
  const todayPlan = WORKOUT_PLAN.find((w) => w.day === todayShort.slice(0, 3)) ?? WORKOUT_PLAN.find((w) => w.day === todayShort);

  return (
    <div className="space-y-5">
      {/* Hoje */}
      {todayPlan && (
        <Card glow>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
              💪
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide">Hoje</p>
              <p className="font-extrabold">{todayPlan.name}</p>
            </div>
          </div>
          {todayPlan.exercises.length > 0 && (
            <div className="mt-3 grid gap-1.5 pl-2 sm:grid-cols-2">
              {todayPlan.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
                  {ex}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Plano semanal */}
      <Card>
        <SectionTitle>Plano semanal</SectionTitle>
        {WORKOUT_PLAN.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">Nenhum plano de treino cadastrado ainda.</p>
        )}
        <div className="mt-3 space-y-2">
          {WORKOUT_PLAN.map((plan) => {
            const isToday = plan.day === todayShort;
            return (
              <div
                key={plan.day}
                className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors"
                style={{
                  background: isToday ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
                  borderColor: isToday ? "color-mix(in srgb, var(--primary) 40%, transparent)" : undefined,
                }}
              >
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold"
                  style={{
                    background: isToday ? "var(--primary)" : "var(--surface-2)",
                    color: isToday ? "var(--primary-fg)" : "var(--text-muted)",
                  }}
                >
                  {plan.day}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{plan.name}</p>
                  {plan.exercises.length > 0 && (
                    <p className="text-xs text-text-muted">{plan.exercises.length} exercícios</p>
                  )}
                </div>
                {isToday && <Badge color="var(--primary)">hoje</Badge>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default function SaudePage() {
  const [tab, setTab] = useState<Tab>("Corpo");

  const TAB_ICONS: Record<Tab, React.ReactNode> = {
    Corpo: <Scale size={14} />,
    Nutrição: <Utensils size={14} />,
    Treino: <Dumbbell size={14} />,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Saúde"
        subtitle="Corpo, nutrição e treino"
        icon={<HeartPulse size={24} />}
        accent="var(--c-rose)"
      />

      <div className="flex gap-1 rounded-2xl border border-border bg-surface-2/40 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all"
            style={{ color: tab === t ? "var(--primary-fg)" : "var(--text-muted)" }}
          >
            {tab === t && (
              <motion.span layoutId="saude-tab" className="absolute inset-0 rounded-xl" style={{ background: "var(--primary)" }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{TAB_ICONS[t]}{t}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "Corpo" && <CorpoTab />}
          {tab === "Nutrição" && <NutricaoTab />}
          {tab === "Treino" && <TreinoTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
