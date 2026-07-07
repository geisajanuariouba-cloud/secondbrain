"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, BookOpen, DollarSign, Apple, TrendingUp, TrendingDown, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { SUBJECTS, TRANSACTIONS, BODY_MEASUREMENTS, DIET_GOALS } from "@/lib/data";

const TABS = ["Estudos", "Financeiro", "Saúde"] as const;
type Tab = typeof TABS[number];

function MetricRow({ label, value, max, color, suffix = "" }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-text-muted">{value}{suffix} / {max}{suffix}</span>
      </div>
      <ProgressBar value={max ? Math.min(100, (value / max) * 100) : 0} color={color} />
    </div>
  );
}

function EstudosTab() {
  const totalHours = SUBJECTS.reduce((s, sub) => s + sub.hours, 0);
  const totalQuestions = SUBJECTS.reduce((s, sub) => s + sub.questions, 0);
  const totalCorrect = SUBJECTS.reduce((s, sub) => s + sub.correct, 0);
  const avgMastery = Math.round(SUBJECTS.reduce((s, sub) => s + sub.mastery, 0) / SUBJECTS.length);
  const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100);

  const weakest = [...SUBJECTS].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const strongest = [...SUBJECTS].sort((a, b) => b.mastery - a.mastery).slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Horas totais", value: `${totalHours.toFixed(0)}h`, color: "var(--secondary)" },
          { label: "Questões", value: totalQuestions.toLocaleString("pt-BR"), color: "var(--c-blue)" },
          { label: "Taxa de acerto", value: `${avgAccuracy}%`, color: "var(--primary)" },
          { label: "Domínio médio", value: `${avgMastery}%`, color: "var(--c-amber)" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle>Domínio por matéria</SectionTitle>
          <div className="mt-3 space-y-3">
            {SUBJECTS.map((sub) => (
              <div key={sub.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: sub.color }}>{sub.name}</span>
                  <span className="text-text-muted">{sub.mastery}%</span>
                </div>
                <ProgressBar value={sub.mastery} color={sub.color} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <TrendingDown size={14} style={{ color: "var(--danger)" }} />
                Precisa de atenção
              </span>
            </SectionTitle>
            <div className="mt-3 space-y-3">
              {weakest.map((sub) => (
                <div key={sub.key} className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger-soft/10 px-3 py-2.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: sub.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{sub.name}</p>
                    <p className="text-xs text-text-muted">{sub.pendingRevisions} revisão{sub.pendingRevisions !== 1 ? "ões" : ""} pendente{sub.pendingRevisions !== 1 ? "s" : ""}</p>
                  </div>
                  <Badge color="var(--danger)">{sub.mastery}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "var(--success)" }} />
                Pontos fortes
              </span>
            </SectionTitle>
            <div className="mt-3 space-y-3">
              {strongest.map((sub) => (
                <div key={sub.key} className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-soft/10 px-3 py-2.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: sub.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{sub.name}</p>
                    <p className="text-xs text-text-muted">{sub.hours}h estudadas</p>
                  </div>
                  <Badge color="var(--success)">{sub.mastery}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Taxa de acerto por matéria</SectionTitle>
            <div className="mt-3 space-y-3">
              {[...SUBJECTS].sort((a, b) => (b.correct / b.questions) - (a.correct / a.questions)).slice(0, 5).map((sub) => {
                const acc = Math.round((sub.correct / sub.questions) * 100);
                return (
                  <MetricRow key={sub.key} label={sub.name} value={sub.correct} max={sub.questions} color={sub.color} />
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FinanceiroTab() {
  const income = TRANSACTIONS.filter((t) => t.type === "Receita").reduce((s, t) => s + t.value, 0);
  const expenses = TRANSACTIONS.filter((t) => t.type !== "Receita").reduce((s, t) => s + t.value, 0);
  const savingsRate = Math.round(((income - expenses) / income) * 100);

  const byCategory = TRANSACTIONS.filter((t) => t.type !== "Receita").reduce<Record<string, number>>((acc, t) => {
    const cat = t.category ?? "Outros";
    acc[cat] = (acc[cat] ?? 0) + t.value;
    return acc;
  }, {});
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Receita", value: `R$ ${income.toFixed(0)}`, color: "var(--success)" },
          { label: "Gastos", value: `R$ ${expenses.toFixed(0)}`, color: "var(--danger)" },
          { label: "Taxa de poupança", value: `${savingsRate}%`, color: "var(--primary)" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>Distribuição de gastos</SectionTitle>
        <div className="mt-3 space-y-3">
          {categories.map(([cat, val]) => (
            <div key={cat}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold">{cat}</span>
                <span className="text-text-muted">R$ {val.toFixed(2)} · {Math.round((val / expenses) * 100)}%</span>
              </div>
              <ProgressBar value={expenses ? Math.min(100, (val / expenses) * 100) : 0} color="var(--primary)" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SaudeTab() {
  const latest = BODY_MEASUREMENTS[BODY_MEASUREMENTS.length - 1];
  const first = BODY_MEASUREMENTS[0];
  const weightDelta = latest.weight - first.weight;
  const fatDelta = (latest.bodyFat ?? 0) - (first.bodyFat ?? 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Peso atual", value: `${latest.weight} kg`, color: "var(--c-rose)", delta: `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg no mês` },
          { label: "Gordura", value: `${latest.bodyFat}%`, color: "var(--c-amber)", delta: `${fatDelta > 0 ? "+" : ""}${fatDelta.toFixed(1)}% no mês` },
          { label: "Cintura", value: `${latest.waist} cm`, color: "var(--secondary)", delta: "" },
          { label: "Quadril", value: `${latest.hip} cm`, color: "var(--c-lilac)", delta: "" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
            {kpi.delta && <p className="mt-1 text-xs" style={{ color: kpi.delta.startsWith("-") ? "var(--success)" : "var(--danger)" }}>{kpi.delta}</p>}
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>Evolução de peso (último mês)</SectionTitle>
        <div className="mt-4 flex items-end justify-between gap-2 h-32">
          {BODY_MEASUREMENTS.map((m, i) => {
            const min = Math.min(...BODY_MEASUREMENTS.map((x) => x.weight));
            const max = Math.max(...BODY_MEASUREMENTS.map((x) => x.weight));
            const pct = max === min ? 50 : ((m.weight - min) / (max - min)) * 100;
            const h = Math.max(20, pct);
            return (
              <div key={m.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-text-muted">{m.weight}</span>
                <div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: i === BODY_MEASUREMENTS.length - 1 ? "var(--primary)" : "var(--surface-2)", minHeight: 8 }} />
                <span className="text-[9px] text-text-muted">{new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>Metas nutricionais (diárias)</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Calorias", value: 1620, max: DIET_GOALS.calories, color: "var(--c-amber)", suffix: " kcal" },
            { label: "Proteína", value: 95, max: DIET_GOALS.protein, color: "var(--c-rose)", suffix: "g" },
            { label: "Carboidratos", value: 180, max: DIET_GOALS.carbs, color: "var(--primary)", suffix: "g" },
            { label: "Gordura", value: 48, max: DIET_GOALS.fat, color: "var(--c-blue)", suffix: "g" },
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
    </div>
  );
}

export default function MetricasPage() {
  const [tab, setTab] = useState<Tab>("Estudos");

  const TAB_ICONS: Record<Tab, React.ReactNode> = {
    Estudos: <BookOpen size={14} />,
    Financeiro: <DollarSign size={14} />,
    Saúde: <Apple size={14} />,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        title="Métricas"
        subtitle="Dados para tomar melhores decisões"
        icon={<BarChart3 size={24} />}
        accent="var(--c-blue)"
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
              <motion.span layoutId="metrics-tab" className="absolute inset-0 rounded-xl" style={{ background: "var(--primary)" }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{TAB_ICONS[t]}{t}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "Estudos" && <EstudosTab />}
          {tab === "Financeiro" && <FinanceiroTab />}
          {tab === "Saúde" && <SaudeTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
