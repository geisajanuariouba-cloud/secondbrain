"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Plus, Flame, X, Check, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { EXERCISES } from "@/lib/data";
import { todayLocalISO } from "@/lib/date-utils";

const CATEGORY_NAMES: Record<string, string> = {
  A: "Inferiores", B: "Costas & Bíceps", C: "Ombros & Tríceps", D: "Core", E: "Cardio",
};
const CATEGORY_COLORS: Record<string, string> = {
  A: "var(--c-rose)", B: "var(--secondary)", C: "var(--primary)", D: "var(--accent)", E: "var(--success)",
};

const TREINO_OPTIONS = ["A", "B", "C", "D", "E", "Livre"];

type WorkoutLog = {
  id: string;
  date: string;
  treino: string;
  notes: string;
};

function todayISO() {
  return todayLocalISO();
}

export default function AcademiaPage() {
  const categories = Array.from(new Set(EXERCISES.map((e) => e.category)));
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [form, setForm] = useState({ treino: "A", notes: "" });
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("academia-logs");
    if (saved) setLogs(JSON.parse(saved));
    const savedChecked = localStorage.getItem(`academia-checked-${todayISO()}`);
    if (savedChecked) setChecked(JSON.parse(savedChecked));
  }, []);

  const handleRegister = () => {
    const log: WorkoutLog = {
      id: `wl-${Date.now()}`,
      date: todayISO(),
      treino: form.treino,
      notes: form.notes.trim(),
    };
    const updated = [log, ...logs];
    setLogs(updated);
    localStorage.setItem("academia-logs", JSON.stringify(updated));
    setForm({ treino: "A", notes: "" });
    setShowForm(false);
  };

  const toggleExercise = (name: string) => {
    const next = { ...checked, [name]: !checked[name] };
    setChecked(next);
    localStorage.setItem(`academia-checked-${todayISO()}`, JSON.stringify(next));
  };

  const thisMonthLogs = logs.filter((l) => l.date.startsWith(todayISO().slice(0, 7)));
  const streak = (() => {
    const dates = new Set(logs.map((l) => l.date));
    let count = 0;
    const d = new Date();
    while (dates.has(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Academia"
        subtitle="Treinos, fichas e evolução"
        icon={<Dumbbell size={24} />}
        accent="var(--c-rose)"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-c-rose px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> Registrar treino
          </button>
        }
      />

      {/* Modal de registro */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>Registrar treino de hoje</SectionTitle>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-muted">Treino</label>
                  <div className="flex flex-wrap gap-2">
                    {TREINO_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, treino: t }))}
                        className="rounded-xl border px-4 py-2 text-sm font-bold transition-all"
                        style={{
                          borderColor: form.treino === t ? "var(--c-rose)" : "var(--border)",
                          background: form.treino === t ? "color-mix(in srgb, var(--c-rose) 15%, transparent)" : "transparent",
                          color: form.treino === t ? "var(--c-rose)" : "var(--text-secondary)",
                        }}
                      >
                        {t === "Livre" ? "Livre" : `Treino ${t} — ${CATEGORY_NAMES[t] ?? ""}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-muted">Observações (opcional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Ex: PR no supino, cardio 20min..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-c-rose/60 focus:ring-1 focus:ring-c-rose/20"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--c-rose)" }}
                  >
                    <Check size={15} /> Salvar treino
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Treinos no mês" value={thisMonthLogs.length} icon={<Dumbbell size={18} />} accent="var(--c-rose)" trend={6} />
        <StatCard index={1} label="Sequência" value={`${streak} dia${streak !== 1 ? "s" : ""}`} icon={<Flame size={18} />} accent="var(--warning)" />
        <StatCard index={2} label="Fichas ativas" value={categories.length} icon={<Dumbbell size={18} />} accent="var(--secondary)" />
        <StatCard index={3} label="Exercícios" value={EXERCISES.length} icon={<Dumbbell size={18} />} accent="var(--primary)" />
      </div>

      {/* Histórico recente */}
      {logs.length > 0 && (
        <Card>
          <SectionTitle>Histórico recente</SectionTitle>
          <div className="mt-3 space-y-2">
            {logs.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                <CheckCircle2 size={16} style={{ color: "var(--c-rose)" }} />
                <span className="text-sm font-semibold">Treino {l.treino}</span>
                {l.notes && <span className="flex-1 truncate text-xs text-text-muted">{l.notes}</span>}
                <span className="shrink-0 text-xs text-text-muted">{new Date(l.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const exercises = EXERCISES.filter((e) => e.category === cat);
          const color = CATEGORY_COLORS[cat];
          const doneCat = exercises.filter((e) => checked[e.name]).length;
          return (
            <Card key={cat}>
              <SectionTitle
                action={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{doneCat}/{exercises.length}</span>
                    <Badge color={color} soft={false}>Treino {cat}</Badge>
                  </div>
                }
              >
                {CATEGORY_NAMES[cat]}
              </SectionTitle>
              <div className="space-y-2">
                {exercises.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => toggleExercise(e.name)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      checked[e.name] ? "border-c-rose/30 bg-surface-2/20 opacity-60" : "border-border bg-surface-2/40 hover:border-c-rose/30"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                      {checked[e.name] ? <CheckCircle2 size={15} /> : <Dumbbell size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${checked[e.name] ? "line-through text-text-muted" : ""}`}>{e.name}</p>
                      <p className="truncate text-[11px] text-text-muted">{e.muscle.join(", ")}</p>
                    </div>
                    <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-bold">{e.sets}</span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
