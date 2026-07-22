"use client";

import { useState, useEffect, useRef, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ChevronDown, ChevronUp, BookOpen, Star, Filter,
  Plus, Pencil, Trash2, X, Save, CalendarDays, Layers, FileText, Loader2,
  CheckCircle2, Circle, Zap, Brain, ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { VESTIBULARES_TARGETS } from "@/lib/data";
import { registrationStatus } from "@/lib/vestibulares-registrations";
import { VESTIBULAR_TOPICS, getTopicsBySubject } from "@/lib/vestibular-content";
import { daysUntil } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseEntry = {
  number: number;
  label: string; // "1ª Fase", "Módulo 1", "Ano 1", etc.
  date: string;
  content: string; // conteúdo programático desta fase
  subjects?: string[]; // matérias cobradas nesta fase (seriado)
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
  // Inscrições
  registered: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  registrationNote?: string;
  registrationUrl?: string;
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
  const isSeriado = v.type === "Seriado" || v.type === "PISM";
  const phaseEntries: PhaseEntry[] = Array.from({ length: v.phases }, (_, i) => ({
    number: i + 1,
    label: v.phaseLabels?.[i] ?? (v.phases === 1 ? "Prova única" : `${i + 1}ª Fase`),
    date: v.phaseDates?.[i] ?? (i === 0 ? v.date : i === 1 ? (v.secondDate ?? "") : ""),
    content: v.phaseContents?.[i] ?? "",
    subjects: v.phaseSubjects?.[i] ?? [],
  }));
  return {
    id: v.id, name: v.name, fullName: v.fullName, university: v.university,
    color: v.color, selected: v.selected, isSeriado,
    phaseEntries,
    subjects: v.subjects, programmaticContent: "", notes: "",
    medicineAvg: v.medicineAvg, medicineCutNote: v.medicineCutNote,
    date: v.date, secondDate: v.secondDate, phases: v.phases, type: v.type,
    registered: false,
    registrationOpensAt: v.registrationOpensAt,
    registrationClosesAt: v.registrationClosesAt,
    registrationNote: v.registrationNote,
    registrationUrl: v.registrationUrl,
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
    registered: false,
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [studiedTopics, setStudiedTopics] = useState<Set<string>>(new Set());
  const [topicMeta, setTopicMeta] = useState<Record<string, { urgency: number; difficulty: number }>>({});
  // currentPhases: vestibularId → phase index (0-based). -1 = manual override disabled auto
  const [currentPhases, setCurrentPhases] = useState<Record<string, number>>({});

  const todayStr = new Date().toISOString().slice(0, 10);

  // Auto-compute current phase for a seriado vestibular based on today's date
  function autoCurrentPhase(v: VestibularEntry): number {
    if (!v.isSeriado || v.phaseEntries.length === 0) return 0;
    // First phase whose date is today or in the future; if all passed, last phase
    const idx = v.phaseEntries.findIndex((ph) => !ph.date || ph.date >= todayStr);
    return idx === -1 ? v.phaseEntries.length - 1 : idx;
  }

  // Load from localStorage
  useEffect(() => {
    const base = VESTIBULARES_TARGETS.map(toEntry);
    let entries: VestibularEntry[];
    const saved = localStorage.getItem("vestibulares-data");
    if (saved) {
      const savedList: VestibularEntry[] = JSON.parse(saved);
      const savedMap = new Map(savedList.map(v => [v.id, v]));
      const baseIds = new Set(base.map(v => v.id));
      // Base entries: use saved version (user customizations) if exists, else fresh base.
      // Registration metadata always refreshes from base (data.ts) — it's maintained by the
      // system, not user-edited, so a stale localStorage snapshot must never mask a new date.
      const merged = base.map(v => {
        const s = savedMap.get(v.id);
        if (!s) return v;
        return {
          ...s,
          registrationOpensAt: v.registrationOpensAt,
          registrationClosesAt: v.registrationClosesAt,
          registrationNote: v.registrationNote,
          registrationUrl: v.registrationUrl,
        };
      });
      // User-added entries not in base
      const userAdded = savedList.filter(v => !baseIds.has(v.id));
      entries = [...merged, ...userAdded];
    } else {
      entries = base;
    }
    setVestibulares(entries);

    // Auto-advance current phases based on today's date
    const savedPhases: Record<string, number> = {};
    try { const cp = localStorage.getItem("vest-current-phases"); if (cp) Object.assign(savedPhases, JSON.parse(cp)); } catch { /* */ }
    const computed: Record<string, number> = {};
    entries.forEach((v) => {
      if (!v.isSeriado) return;
      const auto = autoCurrentPhase(v);
      // Only use saved value if it wasn't auto-set to a passed phase
      const saved = savedPhases[v.id];
      computed[v.id] = (saved !== undefined && saved >= auto) ? saved : auto;
    });
    setCurrentPhases(computed);

    try {
      const st = localStorage.getItem("vest-studied-topics");
      if (st) setStudiedTopics(new Set(JSON.parse(st)));
      const tm = localStorage.getItem("vest-topic-meta");
      if (tm) setTopicMeta(JSON.parse(tm));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCurrentPhase(vestId: string, phaseIdx: number) {
    setCurrentPhases((prev) => {
      const next = { ...prev, [vestId]: phaseIdx };
      localStorage.setItem("vest-current-phases", JSON.stringify(next));
      return next;
    });
  }

  const toggleStudied = (topicId: string) => {
    setStudiedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId); else next.add(topicId);
      localStorage.setItem("vest-studied-topics", JSON.stringify([...next]));
      return next;
    });
  };

  const setTopicUrgency = (topicId: string, urgency: number) => {
    setTopicMeta((prev) => {
      const next = { ...prev, [topicId]: { ...prev[topicId], urgency } };
      localStorage.setItem("vest-topic-meta", JSON.stringify(next));
      return next;
    });
  };

  const setTopicDifficulty = (topicId: string, difficulty: number) => {
    setTopicMeta((prev) => {
      const next = { ...prev, [topicId]: { ...prev[topicId], difficulty } };
      localStorage.setItem("vest-topic-meta", JSON.stringify(next));
      return next;
    });
  };

  const save = (updated: VestibularEntry[]) => {
    setVestibulares(updated);
    localStorage.setItem("vestibulares-data", JSON.stringify(updated));
  };

  const toggleSelected = (id: string) =>
    save(vestibulares.map((v) => v.id === id ? { ...v, selected: !v.selected } : v));

  const toggleRegistered = (id: string) =>
    save(vestibulares.map((v) => v.id === id ? { ...v, registered: !v.registered } : v));

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

  const handlePdfUpload = async (file: File) => {
    setPdfLoading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const res = await fetch("/api/vestibulares/analyze-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (data.content) {
        setForm((p) => ({ ...p, programmaticContent: data.content }));
      } else {
        alert(data.error ?? "Erro ao analisar o PDF.");
      }
    } catch {
      alert("Falha na conexão. Tente novamente.");
    } finally {
      setPdfLoading(false);
    }
  };

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

  // Build subject → vestibular IDs map from actual configured vestibulares
  // For seriado: use current phase's subjects if set; fallback to global subjects
  const subjectToVestIds: Record<string, string[]> = {};
  const relevantVests = showOnlySelected ? selected : vestibulares;
  relevantVests.forEach((v) => {
    let activeSubjects: string[];
    if (v.isSeriado && v.phaseEntries.length > 0) {
      const curIdx = currentPhases[v.id] ?? autoCurrentPhase(v);
      const curPhase = v.phaseEntries[curIdx];
      activeSubjects = (curPhase?.subjects && curPhase.subjects.length > 0)
        ? curPhase.subjects
        : v.subjects; // fallback to global if phase has no subjects set
    } else {
      activeSubjects = v.subjects;
    }
    activeSubjects.forEach((subj) => {
      if (!subjectToVestIds[subj]) subjectToVestIds[subj] = [];
      if (!subjectToVestIds[subj].includes(v.id)) subjectToVestIds[subj].push(v.id);
    });
  });

  // Compute topicsBySubject: only show topics whose subject is covered by at least one relevant vestibular
  const topicsBySubject = VESTIBULAR_TOPICS.reduce<Record<string, typeof VESTIBULAR_TOPICS>>((acc, t) => {
    const vestIds = subjectToVestIds[t.subject] ?? [];
    if (vestIds.length === 0 && showOnlySelected) return acc; // no vestibular covers this subject
    if (!acc[t.subject]) acc[t.subject] = [];
    acc[t.subject].push({ ...t, vestibulares: vestIds.length > 0 ? vestIds : t.vestibulares });
    return acc;
  }, {});

  const subjects = Object.keys(topicsBySubject);
  const filteredSubjects = filterSubject === "Todos" ? subjects : subjects.filter((s) => s === filterSubject);

  const nextVestibular = selected
    .filter((v) => entryDaysUntil(v) > 0)
    .sort((a, b) => entryDaysUntil(a) - entryDaysUntil(b))[0];

  const registrationsPending = selected.filter((v) => registrationStatus(v, todayStr) === "open");

  // ── Shared form JSX ─────────────────────────────────────────────────────────

  const formPanel = (
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
                {form.isSeriado && (
                  <div>
                    <label className="mb-1.5 block text-[11px] text-text-muted">Matérias cobradas nesta fase</label>
                    <div className="flex flex-wrap gap-1">
                      {SUBJECT_LIST.map((s) => {
                        const active = (ph.subjects ?? []).includes(s);
                        return (
                          <button key={s} type="button"
                            onClick={() => {
                              const cur = ph.subjects ?? [];
                              const next = active ? cur.filter(x => x !== s) : [...cur, s];
                              setForm(p => ({
                                ...p,
                                phaseEntries: p.phaseEntries.map((ph2, idx) =>
                                  idx === i ? { ...ph2, subjects: next } : ph2
                                ),
                              }));
                            }}
                            className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-all"
                            style={{
                              background: active ? `color-mix(in srgb, ${SUBJECT_COLORS[s] ?? "var(--primary)"} 20%, transparent)` : "transparent",
                              color: active ? (SUBJECT_COLORS[s] ?? "var(--primary)") : "var(--text-muted)",
                              borderColor: active ? (SUBJECT_COLORS[s] ?? "var(--primary)") : "var(--border)",
                            }}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-text-muted">Conteúdo programático geral (opcional)</label>
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 rounded-lg border border-c-amber/50 bg-c-amber/10 px-3 py-1 text-xs font-semibold text-c-amber transition-all hover:bg-c-amber/20 disabled:opacity-60"
            >
              {pdfLoading ? (
                <><Loader2 size={13} className="animate-spin" /> Analisando...</>
              ) : (
                <><FileText size={13} /> Analisar PDF</>
              )}
            </button>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePdfUpload(f);
                e.target.value = "";
              }}
            />
          </div>
          <textarea value={form.programmaticContent}
            onChange={(e) => setForm((p) => ({ ...p, programmaticContent: e.target.value }))}
            placeholder="Cole o edital ou clique em 'Analisar PDF' para extrair automaticamente os tópicos..."
            rows={5}
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
          <Switch on={form.selected} onToggle={() => setForm((p) => ({ ...p, selected: !p.selected }))} ariaLabel="Estou me preparando para este vestibular" />
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

      {/* Inscrições */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <ClipboardList size={16} style={{ color: "var(--c-amber)" }} />
            Inscrições
          </span>
        </SectionTitle>
        <p className="mt-1 text-xs text-text-muted">
          {registrationsPending.length === 0
            ? "Tudo certo — nenhuma inscrição pendente no momento."
            : `${registrationsPending.length} inscrição${registrationsPending.length > 1 ? "ões" : ""} pendente${registrationsPending.length > 1 ? "s" : ""}.`}
        </p>
        <div className="mt-3 space-y-2">
          {selected.map((v) => {
            const status = registrationStatus(v, todayStr);
            const statusMeta = {
              registered: { label: "Inscrita", color: "var(--success)", icon: CheckCircle2 },
              open: { label: "Inscrições abertas!", color: "var(--danger)", icon: Zap },
              upcoming: { label: `Abre em ${formatDate(v.registrationOpensAt!)}`, color: "var(--c-amber)", icon: CalendarDays },
              unknown: { label: v.registrationNote ?? "Ainda sem informação", color: "var(--text-muted)", icon: Circle },
            }[status];
            const Icon = statusMeta.icon;
            return (
              <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: v.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{v.name}</p>
                  <p className="flex items-center gap-1 text-xs" style={{ color: statusMeta.color }}>
                    <Icon size={12} /> {statusMeta.label}
                    {v.registrationUrl && status !== "registered" && (
                      <a href={v.registrationUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline underline-offset-2 hover:text-text">
                        site oficial
                      </a>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => toggleRegistered(v.id)}
                  className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={{
                    borderColor: v.registered ? "var(--success)" : "var(--border)",
                    color: v.registered ? "var(--success)" : "var(--text-muted)",
                    background: v.registered ? "color-mix(in srgb, var(--success) 12%, transparent)" : "transparent",
                  }}
                >
                  {v.registered ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  {v.registered ? "Inscrita" : "Marcar como feita"}
                </button>
              </div>
            );
          })}
          {selected.length === 0 && (
            <p className="text-sm text-text-muted">Nenhum vestibular selecionado ainda.</p>
          )}
        </div>
      </Card>

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
          {addingNew && cloneElement(formPanel, { key: "add-form" })}
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
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch on={v.selected} onToggle={() => toggleSelected(v.id)} ariaLabel={`Selecionar ${v.name}`} />
                  </div>

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
                      {cloneElement(formPanel, { key: `edit-${v.id}` })}
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

                        {/* Seletor de fase atual (só seriados) */}
                        {v.isSeriado && v.phaseEntries.length > 1 && (() => {
                          const curIdx = currentPhases[v.id] ?? autoCurrentPhase(v);
                          const curPhase = v.phaseEntries[curIdx];
                          return (
                            <div className="rounded-2xl border-2 px-4 py-3 space-y-3"
                              style={{ borderColor: v.color, background: `color-mix(in srgb, ${v.color} 6%, transparent)` }}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Fase em estudo</p>
                                  <p className="text-base font-extrabold mt-0.5">{curPhase?.label ?? "—"}</p>
                                  {curPhase?.date && (
                                    <p className="text-xs text-text-muted">Prova: {formatDate(curPhase.date)}</p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  {v.phaseEntries.map((ph, idx) => {
                                    const passed = ph.date && ph.date < todayStr;
                                    return (
                                      <button key={idx} onClick={() => setCurrentPhase(v.id, idx)}
                                        className="rounded-xl px-3 py-1 text-xs font-bold transition-all text-left"
                                        style={{
                                          background: idx === curIdx ? v.color : passed ? "var(--surface-2)" : "transparent",
                                          color: idx === curIdx ? "#fff" : passed ? "var(--text-muted)" : "var(--text-secondary)",
                                          border: `1px solid ${idx === curIdx ? v.color : "var(--border)"}`,
                                          textDecoration: passed && idx !== curIdx ? "line-through" : "none",
                                        }}>
                                        {ph.label} {passed && idx !== curIdx ? "✓" : ""}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {curPhase?.subjects && curPhase.subjects.length > 0 && (
                                <div>
                                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">Matérias desta fase</p>
                                  <div className="flex flex-wrap gap-1">
                                    {curPhase.subjects.map(s => (
                                      <Badge key={s} color={SUBJECT_COLORS[s] ?? "var(--text-muted)"}>{s}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {curPhase?.content && (
                                <p className="text-xs text-text-secondary border-t border-border/50 pt-2">{curPhase.content}</p>
                              )}
                            </div>
                          );
                        })()}

                        {/* Fases / datas */}
                        <div>
                          <p className="mb-2 text-xs font-bold text-text-muted uppercase flex items-center gap-1.5">
                            <CalendarDays size={12} /> Datas das provas
                          </p>
                          <div className="space-y-2">
                            {v.phaseEntries.map((ph, phIdx) => {
                              const isPast = ph.date && ph.date < todayStr;
                              const isCur = v.isSeriado && (currentPhases[v.id] ?? autoCurrentPhase(v)) === phIdx;
                              return (
                              <div key={ph.number} className="rounded-xl border px-4 py-3"
                                style={{
                                  borderColor: isCur ? v.color : "var(--border)",
                                  background: isCur ? `color-mix(in srgb, ${v.color} 5%, transparent)` : "color-mix(in srgb, var(--surface-2) 40%, transparent)",
                                }}>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold flex items-center gap-2">
                                    {ph.label}
                                    {isCur && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: v.color }}>em estudo</span>}
                                    {isPast && !isCur && <span className="text-[10px] text-text-muted">✓ realizada</span>}
                                  </p>
                                  <p className="text-sm text-text-secondary">{formatDate(ph.date)}</p>
                                </div>
                                {ph.content && (
                                  <p className="mt-1.5 text-xs text-text-muted">{ph.content}</p>
                                )}
                              </div>
                              );
                            })}
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
            <Switch on={showOnlySelected} onToggle={() => setShowOnlySelected(!showOnlySelected)} size="sm" ariaLabel="Só dos selecionados" />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredSubjects.map((subject) => {
            const topics = topicsBySubject[subject];
            const color = SUBJECT_COLORS[subject] ?? "var(--text-muted)";
            const studiedCount = topics.filter((t) => studiedTopics.has(t.id)).length;
            const studiedPct = Math.round((studiedCount / topics.length) * 100);
            return (
              <div key={subject}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-bold">{subject}</span>
                  <span className="text-xs text-text-muted">{topics.length} tópicos</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color }}>
                    {studiedCount}/{topics.length} estudados ({studiedPct}%)
                  </span>
                </div>
                {/* Barra de progresso por matéria */}
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${studiedPct}%`, background: color }} />
                </div>
                <div className="space-y-1.5 pl-2">
                  {topics.map((t) => {
                    const studied = studiedTopics.has(t.id);
                    const meta = topicMeta[t.id];
                    const urgency = meta?.urgency ?? t.weight;
                    const difficulty = meta?.difficulty ?? t.difficulty;
                    return (
                      <div key={t.id}
                        className="flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors"
                        style={{
                          borderColor: studied ? "color-mix(in srgb, var(--success) 30%, transparent)" : "var(--border)",
                          background: studied ? "color-mix(in srgb, var(--success) 5%, transparent)" : "color-mix(in srgb, var(--surface-2) 30%, transparent)",
                        }}
                      >
                        {/* Check estudado */}
                        <button onClick={() => toggleStudied(t.id)} className="mt-0.5 shrink-0 transition-colors hover:opacity-80">
                          {studied
                            ? <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                            : <Circle size={18} className="text-border-strong" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${studied ? "line-through text-text-muted" : ""}`}>{t.topic}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{t.subtopics.join(" · ")}</p>

                          {/* Urgência + Dificuldade */}
                          <div className="mt-1.5 flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Zap size={11} className="text-text-muted" />
                              <span className="text-[10px] text-text-muted">Urgência:</span>
                              {[1,2,3].map((lvl) => (
                                <button key={lvl} onClick={() => setTopicUrgency(t.id, lvl)}
                                  className="h-4 w-4 rounded text-[9px] font-bold transition-all"
                                  style={{
                                    background: urgency >= lvl ? (lvl === 3 ? "var(--danger)" : lvl === 2 ? "var(--c-amber)" : "var(--success)") : "var(--surface-2)",
                                    color: urgency >= lvl ? "#fff" : "var(--text-muted)",
                                  }}>
                                  {lvl}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1">
                              <Brain size={11} className="text-text-muted" />
                              <span className="text-[10px] text-text-muted">Dific.:</span>
                              {[1,2,3].map((lvl) => (
                                <button key={lvl} onClick={() => setTopicDifficulty(t.id, lvl)}
                                  className="h-4 w-4 rounded text-[9px] font-bold transition-all"
                                  style={{
                                    background: difficulty >= lvl ? "var(--c-lilac)" : "var(--surface-2)",
                                    color: difficulty >= lvl ? "#fff" : "var(--text-muted)",
                                  }}>
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
