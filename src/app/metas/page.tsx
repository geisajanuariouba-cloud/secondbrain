"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Target, Plus, X, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { GOALS } from "@/lib/data";
import { pct } from "@/lib/utils";

type Goal = {
  id: string;
  name: string;
  category: string;
  current: number;
  target: number;
  deadline?: string;
  emoji?: string;
};

const CAT_COLOR: Record<string, string> = {
  "Crescimento Pessoal": "var(--secondary)",
  Trabalho: "var(--success)",
  Viagens: "var(--c-pink)",
  Família: "var(--c-lilac)",
  Esporte: "var(--c-rose)",
  Estudos: "var(--primary)",
  Saúde: "var(--c-green)",
  Financeiro: "var(--c-amber)",
  Pessoal: "var(--c-cyan)",
};

const CATEGORIES = ["Estudos", "Saúde", "Financeiro", "Pessoal", "Trabalho"];

const STORAGE_KEY = "metas-data";

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === "undefined") return GOALS as Goal[];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : (GOALS as Goal[]);
    } catch {
      return GOALS as Goal[];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    category: "Estudos",
    target: "",
    current: "",
    deadline: "",
    emoji: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  function handleAddGoal() {
    if (!form.name.trim() || !form.target) return;
    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      target: Number(form.target),
      current: Number(form.current) || 0,
      deadline: form.deadline || undefined,
      emoji: form.emoji.slice(0, 2) || undefined,
    };
    setGoals((prev) => [...prev, newGoal]);
    setForm({ name: "", category: "Estudos", target: "", current: "", deadline: "", emoji: "" });
    setShowForm(false);
  }

  function handleUpdateCurrent(id: string) {
    const val = Number(editingValue);
    if (isNaN(val)) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, current: val } : g))
    );
    setEditingId(null);
    setEditingValue("");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Metas"
        subtitle="Seus objetivos de 2026"
        icon={<Target size={24} />}
        accent="var(--primary)"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> Nova meta
          </button>
        }
      />

      {/* Form de nova meta */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Nova meta</SectionTitle>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Título</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ex: Horas de estudo no mês"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Categoria</label>
                  <select
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Emoji (opcional)</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="🎯"
                    maxLength={2}
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Meta (valor alvo)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ex: 220"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Atual (progresso)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ex: 0"
                    value={form.current}
                    onChange={(e) => setForm({ ...form, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Prazo</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <Check size={15} /> Salvar meta
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {goals.map((g, i) => {
          const p = pct(g.current, g.target);
          const color = CAT_COLOR[g.category] ?? "var(--primary)";
          const isEditing = editingId === g.id;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card interactive>
                <div className="flex items-center gap-5">
                  <ProgressRing value={p} color={color} size={84} stroke={8} />
                  <div className="min-w-0 flex-1">
                    <Badge color={color}>{g.category}</Badge>
                    <p className="mt-2 text-base font-bold leading-tight">
                      {g.emoji && <span className="mr-1">{g.emoji}</span>}
                      {g.name}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {g.current.toLocaleString("pt-BR")} / {g.target.toLocaleString("pt-BR")}
                    </p>
                    {g.deadline && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        Prazo: {new Date(g.deadline + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {isEditing ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          className="w-28 rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateCurrent(g.id);
                            if (e.key === "Escape") { setEditingId(null); setEditingValue(""); }
                          }}
                        />
                        <button
                          onClick={() => handleUpdateCurrent(g.id)}
                          className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-white"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingValue(""); }}
                          className="text-text-muted hover:text-text"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(g.id); setEditingValue(String(g.current)); }}
                        className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
                      >
                        Atualizar progresso
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
