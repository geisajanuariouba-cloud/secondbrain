"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ChevronDown, ChevronUp, BookOpen, Star, Filter,
  Plus, Pencil, Trash2, X, Save, CalendarDays, Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { VESTIBULARES_TARGETS } from "@/lib/data";
import { VESTIBULAR_TOPICS, getTopicsBySubject } from "@/lib/vestibular-content";
import { daysUntil } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseEntry = {
  number: number;
  label: string; // "1ª Fase", "Módulo 1", "Ano 1", etc.
  date: string;
  content: string; // conteúdo programático desta fase
};

type VestibularEntry = {
  id: string;
  name: string;
  fullName: string;
  university: string[];
  color: string;
  selected: boolean;
  isSeriado: boolean;
  phaseEntries: PhaseEntry[];
  subjects: string[];
  programmaticContent: string;
  notes: string;
  medicineAvg?: number;
  medicineCutNote?: string;
  // compat
  date: string;
  secondDate?: string;
  phases: number;
  type: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECT_LIST = [
  "Português", "Literatura", "Redação", "Matemática", "Física",
  "Química", "Biologia", "História", "Geografia", "Sociologia", "Filosofia", "Inglês",
];

const SUBJECT_COLORS: Record<string, string> = {
  Biologia: "var(--c-green)", Química: "var(--accent)", Física: "var(--c-blue)",
  Matemática: "var(--c-pink)", Português: "var(--c-amber)", Redação: "var(--c-lilac)",
  História: "var(--c-rose)", Geografia: "var(--success)", Literatura: "var(--secondary)",
  Sociologia: "var(--text-muted)", Filosofia: "var(--text-muted)", Inglês: "var(--c-cyan)",
};

const PRESET_COLORS = [
  "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899",
  "#f97316", "#10b981", "#ef4444", "#6366f1", "#84cc16",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toEntry(v: (typeof VESTIBULARES_TARGETS)[0]): VestibularEntry {
  const phaseDates = [v.date, ...(v.secondDate ? [v.secondDate] : [])];
  return {
    id: v.id,
    name: v.name,
    fullName: v.fullName,
    university: v.university,
    color: v.color,
    selected: v.selected,
    isSeriado: v.type === "PISM",
    phaseEntries: Array.from({ length: v.phases }, (_, i) => ({
      number: i + 1,
      label: v.phases === 1 ? "Prova única" : `${i + 1}ª Fase`,
      date: phaseDates[i] ?? "",
      content: "",
    })),
    subjects: v.subjects,
    programmaticContent: "",
    notes: "",
    medicineAvg: v.medicineAvg,
    medicineCutNote: v.medicineCutNote,
    date: v.date,
    secondDate: v.secondDate,
    phases: v.phases,
    type: v.type,
  };
}

function entryDaysUntil(v: VestibularEntry): number {
  const dates = v.phaseEntries.map((p) => p.date).filter(Boolean);
  if (!dates.length) return 9999;
  return Math.min(...dates.map((d) => daysUntil(d)));
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateShort(d: string) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function emptyForm(): Omit<VestibularEntry, "id"> {
  return {
    name: "", fullName: "", university: [], color: "#3b82f6",
    selected: true, isSeriado: false,
    phaseEntries: [{ number: 1, label: "Prova única", date: "", content: "" }],
    subjects: [], programmaticContent: "", notes: "",
    date: "", phases: 1, type: "Vestibular próprio",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VestibularesPage() {
  const [vestibulares, setVestibulares] = useState<VestibularEntry[]>([]);
  const [expandedVest, setExpandedVest] = useState<string | null>("enem");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<Omit<VestibularEntry, "id">>(emptyForm());
  const [filterSubject, setFilterSubject] = useState("Todos");
  const [showOnlySelected, setShowOnlySelected] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vestibulares-data");
    if (saved) {
      setVestibulares(JSON.parse(saved));
    } else {
      setVestibulares(VESTIBULARES_TARGETS.map(toEntry));
    }
  }, []);

  const save = (updated: VestibularEntry[]) => {
    setVestibulares(updated);
    localStorage.setItem("vestibulares-data", JSON.stringify(updated));
  };

  const toggleSelected = (id: string) =>
    save(vestibulares.map((v) => v.id === id ? { ...v, selected: !v.selected } : v));

  const deleteVest = (id: string) =>
    save(vestibulares.filter((v) => v.id !== id));

  // ── Form helpers ────────────────────────────────────────────────────────────

  const openEdit = (id: string) => {
    const v = vestibulares.find((v) => v.id === id)!;
    setForm({ ...v });
    setEditingId(id);
    setAddingNew(false);
    setExpandedVest(null);
  };

  const openAdd = () => {
    setForm(emptyForm());
    setAddingNew(true);
    setEditingId(null);
    setExpandedVest(null);
  };

  const setPhaseCount = (n: number) => {
    const existing = form.phaseEntries;
    const phases: PhaseEntry[] = Array.from({ length: n }, (_, i) => ({
      number: i + 1,
      label: existing[i]?.label ?? (n === 1 ? "Prova única" : `${i + 1}ª Fase`),
      date: existing[i]?.date ?? "",
      content: existing[i]?.content ?? "",
    }));
    setForm((p) => ({ ...p, phaseEntries: phases, phases: n }));
  };

  const updatePhase = (i: number, field: keyof PhaseEntry, val: string) =>
    setForm((p) => ({
      ...p,
      phaseEntries: p.phaseEntries.map((ph, idx) => idx === i ? { ...ph, [field]: val } : ph),
    }));

  const toggleSubject = (s: string) =>
    setForm((p) => ({
      ...p,
      subjects: p.subjects.includes(s) ? p.subjects.filter((x) => x !== s) : [...p.subjects, s],
    }));

  const saveForm = () => {
    const firstDate = form.phaseEntries[0]?.date ?? "";
    const entry: VestibularEntry = {
      ...form,
      id: editingId ?? `vest-${Date.now()}`,
      date: firstDate,
      secondDate: form.phaseEntries[1]?.date,
      phases: form.phaseEntries.length,
      type: form.isSeriado ? "Seriado" : "Vestibular próprio",
    };
    if (editingId) {
      save(vestibulares.map((v) => v.id === editingId ? entry : v));
    } else {
      save([...vestibulares, entry]);
    }
    setEditingId(null);
    setAddingNew(false);
    setExpandedVest(entry.id);
  };

  const cancelForm = () => {
    setEditingId(null);
    setAddingNew(false);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const selected = vestibulares.filter((v) => v.selected);
  const selectedIds = selected.map((v) => v.id);

  const topicsBySubject = getTopicsBySubject(showOnlySelected ? selectedIds : []);
  const subjects = Object.keys(topicsBySubject);
  const filteredSubjects = filterSubject === "Todos" ? subjects : subjects.filter((s) => s === filterSubject);

  const nextVestibular = selected
    .filter((v) => entryDaysUntil(v) > 0)
    .sort((a, b) => entryDaysUntil(a) - entryDaysUntil(b))[0];

  // ── Shared form JSX ─────────────────────────────────────────────────────────

  const FormPanel = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 space-y-4 rounded-2xl border border-c-amber/30 bg-surface-2/60 p-5">
        <p className="text-sm font-bold text-c-amber">
          {addingNew ? "Novo vestibular" : `Editando: ${form.name || "vestibular"}`}
        </p>

        {/* Nome + cor */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-text-muted">Nome (sigla) *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: FUVEST"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-c-amber/60" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-text-muted">Nome completo</label>
            <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Ex: Fundação Universitária..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-c-amber/60" />
          </div>
        </div>

        {/* Universidades */}
        <div>
          <label className="mb-1 block text-xs text-text-muted">Universidade(s) — separadas por vírgula</label>
          <input
            value={form.university.join(", ")}
            onChange={(e) => setForm((p) => ({ ...p, university: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))}
            placeholder="USP, UNICAMP..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-c-amber/60"
          />
        </div>

        {/* Estilo + cor */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Estilo de prova</label>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {[
                { val: false, label: "Não seriado" },
                { val: true, label: "Seriado" },
              ].map(({ val, label }) => (
                <button key={label} onClick={() => setForm((p) => ({ ...p, isSeriado: val }))}
                  className="px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    background: form.isSeriado === val ? "var(--c-amber)" : "transparent",
                    color: form.isSeriado === val ? "#fff" : "var(--text-secondary)",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Cor</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: form.color === c ? "#fff" : "transparent", outline: form.color === c ? `2px solid ${c}` : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Fases / datas */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <label className="text-xs text-text-muted">
              {form.isSeriado ? "Módulos / anos" : "Número de fases"}
            </label>
            <div className="flex items-center gap-1 rounded-lg border border-border">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => setPhaseCount(n)}
                  className="w-8 py-1 text-sm font-semibold transition-all"
                  style={{
                    background: form.phaseEntries.length === n ? "var(--c-amber)" : "transparent",
                    color: form.phaseEntries.length === n ? "#fff" : "var(--text-secondary)",
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {form.phaseEntries.map((ph, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-text-muted">Nome da fase/módulo</label>
                    <input value={ph.label} onChange={(e) => updatePhase(i, "label", e.target.value)}
                      placeholder={form.isSeriado ? `Módulo ${i + 1}` : `${i + 1}ª Fase`}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-c-amber/50" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-text-muted">Data da prova</label>
                    <input type="date" value={ph.date} onChange={(e) => updatePhase(i, "date", e.target.value)}
                      className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-c-amber/50" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-text-muted">Conteúdo programático desta fase (opcional)</label>
                  <textarea value={ph.content} onChange={(e) => updatePhase(i, "content", e.target.value)}
                    placeholder="Ex: Biologia — Genética, Ecologia · Química — Orgânica · Matemática — Funções..."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-c-amber/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matérias */}
        <div>
          <label className="mb-2 block text-xs text-text-muted">Matérias cobradas</label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_LIST.map((s) => {
              const selected = form.subjects.includes(s);
              return (
                <button key={s} onClick={() => toggleSubject(s)}
                  className="rounded-full border px-3 py-1 text-xs font-semibold transition-all"
                  style={{
                    background: selected ? `color-mix(in srgb, ${SUBJECT_COLORS[s] ?? "var(--primary)"} 20%, transparent)` : "transparent",
                    color: selected ? (SUBJECT_COLORS[s] ?? "var(--primary)") : "var(--text-muted)",
                    borderColor: selected ? (SUBJECT_COLORS[s] ?? "var(--primary)") : "var(--border)",
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo programático geral */}
        <div>
          <label className="mb-1 block text-xs text-text-muted">Conteúdo programático geral (opcional)</label>
          <textarea value={form.programmaticContent}
            onChange={(e) => setForm((p) => ({ ...p, programmaticContent: e.target.value }))}
            placeholder="Cole o edital ou descreva os tópicos cobrados no geral..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-c-amber/60" />
        </div>

        {/* Observações */}
        <div>
          <label className="mb-1 block text-xs text-text-muted">Observações / nota de corte</label>
          <textarea value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Ex: nota de corte para medicina ~820 pts, 2 fases presenciais..."
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-c-amber/60" />
        </div>

        {/* Selecionado toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Estou me preparando para este vestibular</span>
          <button onClick={() => setForm((p) => ({ ...p, selected: !p.selected }))}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            style={{ background: form.selected ? "var(--primary)" : "var(--border-strong)" }}>
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
              style={{ transform: form.selected ? "translateX(20px)" : "translateX(2px)" }} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={saveForm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--c-amber)" }}>
            <Save size={14} /> {editingId ? "Salvar alterações" : "Adicionar vestibular"}
          </button>
          <button onClick={cancelForm}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted hover:text-text">
            <X size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Vestibulares"
        subtitle="Sua rota para a medicina"
        icon={<Trophy size={24} />}
        accent="var(--c-amber)"
        action={<Badge color="var(--c-amber)">{selected.length} selecionados</Badge>}
      />

      {/* Próximo vestibular hero */}
      {nextVestibular && (
        <Card glow>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                style={{ background: `color-mix(in srgb, ${nextVestibular.color} 18%, transparent)` }}>
                🎯
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Próxima prova</p>
                <p className="text-xl font-extrabold">{nextVestibular.name}</p>
                <p className="text-sm text-text-secondary">{nextVestibular.fullName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-extrabold tabular-nums" style={{ color: "var(--c-amber)" }}>
                {entryDaysUntil(nextVestibular)}
              </p>
              <p className="text-xs text-text-muted">dias</p>
              <p className="mt-1 text-xs text-text-secondary">
                {formatDate(nextVestibular.phaseEntries[0]?.date ?? "")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de vestibulares */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Trophy size={16} style={{ color: "var(--c-amber)" }} />
              Vestibulares
            </span>
          </SectionTitle>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-c-amber/50 hover:text-c-amber"
          >
            <Plus size={13} /> Novo vestibular
          </button>
        </div>

        {/* Form de adicionar */}
        <AnimatePresence>
          {addingNew && <FormPanel key="add-form" />}
        </AnimatePresence>

        <div className="mt-3 space-y-2">
          {vestibulares.map((v) => {
            const days = entryDaysUntil(v);
            const isExpanded = expandedVest === v.id;
            const isEditing = editingId === v.id;

            return (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-border">
                {/* Row header */}
                <div
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
                  onClick={() => !isEditing && setExpandedVest(isExpanded ? null : v.id)}
                >
                  {/* Selected toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelected(v.id); }}
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ background: v.selected ? "var(--primary)" : "var(--border-strong)" }}
                  >
                    <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                      style={{ transform: v.selected ? "translateX(20px)" : "translateX(2px)" }} />
                  </button>

                  <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: v.color }} />

                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{v.name}</p>
                    <p className="text-xs text-text-muted">{v.university.join(", ")}</p>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{
                      color: days < 60 ? "var(--danger)" : days < 120 ? "var(--warning)" : "var(--success)"
                    }}>
                      {days < 9999 ? (days > 0 ? `${days} dias` : "Realizado") : "sem data"}
                    </p>
                    {v.phaseEntries[0]?.date && (
                      <p className="text-[11px] text-text-muted">
                        {formatDateShort(v.phaseEntries[0].date)}
                      </p>
                    )}
                  </div>

                  {/* Edit / delete */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(v.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-text-muted hover:text-c-amber">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteVest(v.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-text-muted hover:text-error">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {!isEditing && (isExpanded ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />)}
                </div>

                {/* Edit form inline */}
                <AnimatePresence>
                  {isEditing && (
                    <div className="border-t border-border px-4 pb-4">
                      <FormPanel key={`edit-${v.id}`} />
                    </div>
                  )}
                </AnimatePresence>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && !isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="space-y-4 p-4">

                        {/* Tipo + fases */}
                        <div className="flex flex-wrap gap-2">
                          <Badge color="var(--c-amber)">
                            {v.isSeriado ? "Seriado" : "Não seriado"}
                          </Badge>
                          <Badge color="var(--secondary)">
                            {v.phaseEntries.length} {v.phaseEntries.length === 1 ? "fase" : "fases"}
                          </Badge>
                          {v.medicineAvg && (
                            <Badge color="var(--c-green)">
                              Medicina: {v.medicineAvg}% aprovação
                            </Badge>
                          )}
                        </div>

                        {/* Fases / datas */}
                        <div>
                          <p className="mb-2 text-xs font-bold text-text-muted uppercase flex items-center gap-1.5">
                            <CalendarDays size={12} /> Datas das provas
                          </p>
                          <div className="space-y-2">
                            {v.phaseEntries.map((ph) => (
                              <div key={ph.number} className="rounded-xl border border-border bg-surface-2/40 px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">{ph.label}</p>
                                  <p className="text-sm text-text-secondary">{formatDate(ph.date)}</p>
                                </div>
                                {ph.content && (
                                  <p className="mt-1.5 text-xs text-text-muted">{ph.content}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Matérias */}
                        {v.subjects.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-bold text-text-muted uppercase">Disciplinas cobradas</p>
                            <div className="flex flex-wrap gap-1.5">
                              {v.subjects.map((s) => (
                                <Badge key={s} color={SUBJECT_COLORS[s] ?? "var(--text-muted)"}>{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Conteúdo programático geral */}
                        {v.programmaticContent && (
                          <div>
                            <p className="mb-2 text-xs font-bold text-text-muted uppercase flex items-center gap-1.5">
                              <Layers size={12} /> Conteúdo programático
                            </p>
                            <div className="rounded-xl border border-border bg-surface-2/40 px-4 py-3">
                              <p className="whitespace-pre-wrap text-sm text-text-secondary">{v.programmaticContent}</p>
                            </div>
                          </div>
                        )}

                        {/* Nota de corte / observações */}
                        {(v.medicineCutNote || v.notes) && (
                          <div className="rounded-xl border border-warning/30 bg-warning-soft/20 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Star size={14} style={{ color: "var(--c-amber)" }} />
                              <span className="text-xs font-bold" style={{ color: "var(--c-amber)" }}>
                                {v.medicineAvg ? `Média de aprovação: ${v.medicineAvg}%` : "Observações"}
                              </span>
                            </div>
                            {v.medicineCutNote && <p className="text-xs text-text-secondary">{v.medicineCutNote}</p>}
                            {v.notes && <p className="mt-1 text-xs text-text-secondary">{v.notes}</p>}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Conteúdo programático (tópicos do sistema) */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: "var(--secondary)" }} />
            Tópicos cobrados
            <Badge color="var(--secondary)">{Object.values(topicsBySubject).flat().length} tópicos</Badge>
          </span>
        </SectionTitle>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-text-muted" />
            <span className="text-xs text-text-muted">Matéria:</span>
          </div>
          {["Todos", ...Object.keys(SUBJECT_COLORS)].map((s) => (
            <button key={s} onClick={() => setFilterSubject(s)}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: filterSubject === s ? (SUBJECT_COLORS[s] ?? "var(--primary)") : "var(--surface-2)",
                color: filterSubject === s ? "#fff" : "var(--text-secondary)",
              }}>
              {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-text-muted">Só dos selecionados</span>
            <button onClick={() => setShowOnlySelected(!showOnlySelected)}
              className="relative h-5 w-10 rounded-full transition-colors"
              style={{ background: showOnlySelected ? "var(--primary)" : "var(--border-strong)" }}>
              <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                style={{ transform: showOnlySelected ? "translateX(20px)" : "translateX(2px)" }} />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredSubjects.map((subject) => {
            const topics = topicsBySubject[subject];
            const color = SUBJECT_COLORS[subject] ?? "var(--text-muted)";
            return (
              <div key={subject}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-bold">{subject}</span>
                  <span className="text-xs text-text-muted">{topics.length} tópicos</span>
                </div>
                <div className="space-y-1.5 pl-4">
                  {topics.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/30 px-3 py-2.5">
                      <div className="mt-0.5 shrink-0">
                        {t.weight === 3 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: color }}>!!!</span>
                        ) : t.weight === 2 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}>!!</span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] text-text-muted">!</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{t.topic}</p>
                        <p className="text-[11px] text-text-muted">{t.subtopics.join(" · ")}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 shrink-0">
                        {t.vestibulares
                          .filter((vid) => showOnlySelected ? selectedIds.includes(vid) : true)
                          .map((vid) => {
                            const vst = vestibulares.find((v) => v.id === vid);
                            if (!vst) return null;
                            return (
                              <span key={vid} className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                style={{ background: vst.color }}>
                                {vst.name}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
