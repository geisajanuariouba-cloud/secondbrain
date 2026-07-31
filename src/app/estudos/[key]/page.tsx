"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Target, RefreshCw, BookOpen, Plus, X, Check,
  Trash2, ChevronRight, GraduationCap, Layers, ClipboardList, Brain,
  Pencil, Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { SUBJECTS, CONTENTS, type SubjectKey } from "@/lib/data";
import { formatHours, pct } from "@/lib/utils";
import { todayLocalISO } from "@/lib/date-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SchoolTask = {
  id: string;
  title: string;
  type: "Trabalho" | "Apresentação" | "Prova" | "Lista" | "Projeto" | "Outro";
  deadline: string;
  done: boolean;
  notes?: string;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
  nextReview: string; // ISO date
  interval: number;  // days
  ease: number;      // 1-3
};

type ExamGrade = {
  id: string;
  name: string;
  grade: number;
  maxGrade: number;
  date: string;
  notes?: string;
};

type Tab = "conteudos" | "tarefas" | "flashcards" | "notas";

const STEP_LABELS = ["Aula", "Leitura", "Exercícios", "Revisão", "Domínio"];
const STEP_KEYS = ["aula", "leitura", "exercicios", "revisao", "dominio"] as const;
const TASK_TYPES: SchoolTask["type"][] = ["Trabalho", "Apresentação", "Prova", "Lista", "Projeto", "Outro"];

function todayISO() { return todayLocalISO(); }
function addDays(date: string, n: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TasksTab({ subjectKey, color }: { subjectKey: string; color: string }) {
  const storageKey = `school-tasks-${subjectKey}`;
  const [tasks, setTasks] = useState<SchoolTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Trabalho" as SchoolTask["type"], deadline: todayISO(), notes: "" });

  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); if (s) setTasks(JSON.parse(s)); } catch { /* */ }
  }, [storageKey]);

  function save(data: SchoolTask[]) { setTasks(data); localStorage.setItem(storageKey, JSON.stringify(data)); }

  function add() {
    if (!form.title.trim()) return;
    save([...tasks, { id: `task-${Date.now()}`, ...form, done: false }]);
    setForm({ title: "", type: "Trabalho", deadline: todayISO(), notes: "" });
    setShowForm(false);
  }

  const pending = tasks.filter((t) => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const done = tasks.filter((t) => t.done);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text">
          <Plus size={13} /> Nova tarefa
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <div className="space-y-3">
                <input className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-secondary"
                  placeholder="Título da tarefa..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                    value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SchoolTask["type"] })}>
                    {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input type="date" className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                    value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <input className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Observações (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={add} className="flex-1 rounded-xl py-2 text-sm font-bold text-white" style={{ background: color }}>Salvar</button>
                  <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 text-sm text-text-muted">Cancelar</button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <SectionTitle>Pendentes ({pending.length})</SectionTitle>
        {pending.length === 0 && <p className="py-4 text-center text-xs text-text-muted">Nenhuma tarefa pendente</p>}
        <div className="mt-2 space-y-2">
          {pending.map((t) => {
            const daysLeft = Math.ceil((new Date(t.deadline + "T12:00:00").getTime() - new Date().getTime()) / 86400000);
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <button onClick={() => save(tasks.map((x) => x.id === t.id ? { ...x, done: true } : x))}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-border-strong transition-all hover:border-success" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-text-muted">{t.notes}</p>
                </div>
                <Badge color={daysLeft <= 3 ? "var(--danger)" : daysLeft <= 7 ? "var(--c-amber)" : "var(--success)"}>{t.type}</Badge>
                <span className="shrink-0 text-xs font-bold" style={{ color: daysLeft <= 3 ? "var(--danger)" : "var(--text-muted)" }}>
                  {daysLeft <= 0 ? "Vencida" : `${daysLeft}d`}
                </span>
                <button onClick={() => save(tasks.filter((x) => x.id !== t.id))} className="text-text-muted opacity-50 hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {done.length > 0 && (
        <Card>
          <SectionTitle>Concluídas ({done.length})</SectionTitle>
          <div className="mt-2 space-y-1.5">
            {done.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-surface-2/40 px-3 py-2 opacity-60">
                <Check size={14} style={{ color: "var(--success)" }} />
                <span className="flex-1 text-sm line-through text-text-muted">{t.title}</span>
                <Badge color="var(--text-muted)">{t.type}</Badge>
                <button onClick={() => save(tasks.filter((x) => x.id !== t.id))} className="text-text-muted opacity-50 hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function FlashcardsTab({ subjectKey, color }: { subjectKey: string; color: string }) {
  const storageKey = `flashcards-${subjectKey}`;
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ front: "", back: "" });
  const [reviewing, setReviewing] = useState<Flashcard | null>(null);
  const [showBack, setShowBack] = useState(false);

  const today = todayISO();

  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); if (s) setCards(JSON.parse(s)); } catch { /* */ }
  }, [storageKey]);

  function save(data: Flashcard[]) { setCards(data); localStorage.setItem(storageKey, JSON.stringify(data)); }

  function add() {
    if (!form.front.trim() || !form.back.trim()) return;
    save([...cards, { id: `fc-${Date.now()}`, ...form, nextReview: today, interval: 1, ease: 2 }]);
    setForm({ front: "", back: "" });
    setShowForm(false);
  }

  function answer(card: Flashcard, quality: 1 | 2 | 3) {
    const newEase = Math.max(1, Math.min(3, card.ease + (quality - 2)));
    const newInterval = quality === 1 ? 1 : quality === 2 ? card.interval * 2 : card.interval * 3;
    const updated = cards.map((c) => c.id === card.id
      ? { ...c, ease: newEase, interval: newInterval, nextReview: addDays(today, newInterval) }
      : c
    );
    save(updated);
    const dueCards = updated.filter((c) => c.nextReview <= today);
    setReviewing(dueCards.length > 0 ? dueCards[0] : null);
    setShowBack(false);
  }

  const dueToday = cards.filter((c) => c.nextReview <= today);
  const dueThisWeek = cards.filter((c) => c.nextReview > today && c.nextReview <= addDays(today, 7));
  const pending = cards.filter((c) => c.nextReview > addDays(today, 7));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Para hoje", value: dueToday.length, c: "var(--danger)" },
          { label: "Esta semana", value: dueThisWeek.length, c: "var(--c-amber)" },
          { label: "Futuros", value: pending.length, c: "var(--success)" },
        ].map((k) => (
          <Card key={k.label}>
            <p className="text-2xl font-extrabold" style={{ color: k.c }}>{k.value}</p>
            <p className="text-xs text-text-muted">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Revisar agora */}
      {dueToday.length > 0 && !reviewing && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{dueToday.length} cards para revisar hoje</p>
            <button onClick={() => { setReviewing(dueToday[0]); setShowBack(false); }}
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: color }}>
              Revisar agora
            </button>
          </div>
        </Card>
      )}

      {/* Modo de revisão */}
      {reviewing && (
        <Card glow>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">Flashcard</p>
          <div className="min-h-[100px] rounded-xl border border-border bg-surface-2/40 p-4 text-center">
            <p className="text-sm font-semibold">{reviewing.front}</p>
            {showBack && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-text-secondary border-t border-border pt-3">
                {reviewing.back}
              </motion.p>
            )}
          </div>
          {!showBack ? (
            <button onClick={() => setShowBack(true)} className="mt-3 w-full rounded-xl border border-border py-2 text-sm font-semibold text-text-muted hover:text-text">
              Mostrar resposta
            </button>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={() => answer(reviewing, 1)} className="rounded-xl py-2 text-xs font-bold text-white" style={{ background: "var(--danger)" }}>Difícil</button>
              <button onClick={() => answer(reviewing, 2)} className="rounded-xl py-2 text-xs font-bold text-white" style={{ background: "var(--c-amber)" }}>Médio</button>
              <button onClick={() => answer(reviewing, 3)} className="rounded-xl py-2 text-xs font-bold text-white" style={{ background: "var(--success)" }}>Fácil</button>
            </div>
          )}
          <button onClick={() => setReviewing(null)} className="mt-2 w-full text-center text-xs text-text-muted hover:text-text">Sair da revisão</button>
        </Card>
      )}

      {/* Adicionar */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
          <Plus size={13} /> Novo flashcard
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <div className="space-y-2">
                <textarea rows={2} className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Frente (pergunta)" value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} />
                <textarea rows={2} className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Verso (resposta)" value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={add} className="flex-1 rounded-xl py-2 text-sm font-bold text-white" style={{ background: color }}>Salvar</button>
                  <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 text-sm text-text-muted">Cancelar</button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {cards.length > 0 && (
        <Card>
          <SectionTitle>Todos os flashcards ({cards.length})</SectionTitle>
          <div className="mt-2 space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/30 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold">{c.front}</p>
                  <p className="truncate text-[11px] text-text-muted">{c.back}</p>
                </div>
                <span className="shrink-0 text-[10px] text-text-muted">
                  Rev. {c.nextReview <= today ? "hoje" : c.nextReview}
                </span>
                <button onClick={() => save(cards.filter((x) => x.id !== c.id))} className="text-text-muted opacity-50 hover:opacity-100">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function NotasTab({ subjectKey, color }: { subjectKey: string; color: string }) {
  const storageKey = `exam-grades-${subjectKey}`;
  const [grades, setGrades] = useState<ExamGrade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", maxGrade: "10", date: todayISO(), notes: "" });

  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); if (s) setGrades(JSON.parse(s)); } catch { /* */ }
  }, [storageKey]);

  function save(data: ExamGrade[]) { setGrades(data); localStorage.setItem(storageKey, JSON.stringify(data)); }

  function add() {
    if (!form.name.trim() || !form.grade) return;
    save([...grades, { id: `gr-${Date.now()}`, name: form.name.trim(), grade: Number(form.grade), maxGrade: Number(form.maxGrade), date: form.date, notes: form.notes }]);
    setForm({ name: "", grade: "", maxGrade: "10", date: todayISO(), notes: "" });
    setShowForm(false);
  }

  const avg = grades.length ? grades.reduce((s, g) => s + (g.grade / g.maxGrade) * 10, 0) / grades.length : 0;

  return (
    <div className="space-y-4">
      {grades.length > 0 && (
        <Card glow>
          <div className="flex items-center gap-4">
            <Trophy size={28} style={{ color }} />
            <div>
              <p className="text-3xl font-extrabold tabular-nums" style={{ color }}>{avg.toFixed(1)}</p>
              <p className="text-xs text-text-muted">média geral em {grades.length} prova{grades.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
          <Plus size={13} /> Registrar nota
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                    placeholder="Nome da prova/avaliação" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <input type="number" step="0.1" className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Nota obtida" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
                <input type="number" step="0.1" className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Nota máxima" value={form.maxGrade} onChange={(e) => setForm({ ...form, maxGrade: e.target.value })} />
                <input type="date" className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <input className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
                  placeholder="Observações (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={add} className="flex-1 rounded-xl py-2 text-sm font-bold text-white" style={{ background: color }}>Salvar</button>
                <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 text-sm text-text-muted">Cancelar</button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {grades.length === 0 && !showForm && (
        <Card><p className="py-8 text-center text-sm text-text-muted">Nenhuma nota registrada ainda.</p></Card>
      )}

      <div className="space-y-3">
        {grades.map((g) => {
          const pctVal = (g.grade / g.maxGrade) * 100;
          const gradeColor = pctVal >= 70 ? "var(--success)" : pctVal >= 50 ? "var(--c-amber)" : "var(--danger)";
          return (
            <Card key={g.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold">{g.name}</p>
                  {g.notes && <p className="text-xs text-text-muted mt-0.5">{g.notes}</p>}
                  <p className="text-xs text-text-muted">{new Date(g.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold tabular-nums" style={{ color: gradeColor }}>{g.grade}</span>
                  <span className="text-sm text-text-muted">/{g.maxGrade}</span>
                  <button onClick={() => save(grades.filter((x) => x.id !== g.id))} className="text-text-muted opacity-50 hover:opacity-100 ml-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <ProgressBar value={pctVal} color={gradeColor} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubjectPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const subject = SUBJECTS.find((s) => s.key === (key as SubjectKey));

  const [tab, setTab] = useState<Tab>("conteudos");
  const [contents, setContents] = useState(CONTENTS.filter((c) => c.subject === key));
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  if (!subject) return <div className="p-8 text-center text-text-muted">Matéria não encontrada.</div>;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "conteudos", label: "Conteúdos", icon: <Layers size={14} /> },
    { key: "tarefas", label: "Tarefas", icon: <ClipboardList size={14} /> },
    { key: "flashcards", label: "Flashcards", icon: <Brain size={14} /> },
    { key: "notas", label: "Notas", icon: <Trophy size={14} /> },
  ];

  const totalSteps = contents.length * 5;
  const doneSteps = contents.reduce((s, c) => s + Object.values(c.steps).filter(Boolean).length, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Link href="/estudos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-text">
        <ArrowLeft size={16} /> Voltar para Estudos
      </Link>

      <PageHeader
        title={subject.name}
        subtitle={`${formatHours(subject.hours)} estudadas · ${subject.questions} questões`}
        icon={<span className="text-lg font-extrabold" style={{ color: subject.color }}>{subject.name.slice(0, 2)}</span>}
        accent={subject.color}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Horas" value={formatHours(subject.hours)} icon={<Clock size={18} />} accent={subject.color} />
        <StatCard index={1} label="Acerto" value={`${pct(subject.correct, subject.questions)}%`} icon={<Target size={18} />} accent="var(--success)" hint={`${subject.correct}/${subject.questions}`} />
        <StatCard index={2} label="Domínio" value={`${subject.mastery}%`} icon={<GraduationCap size={18} />} accent={subject.color} />
        <StatCard index={3} label="Revisões" value={subject.pendingRevisions} icon={<RefreshCw size={18} />} accent="var(--warning)" />
      </div>

      {/* Progresso geral */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold">Progresso geral da trilha</p>
          <span className="text-sm font-extrabold" style={{ color: subject.color }}>{Math.round((doneSteps / Math.max(totalSteps, 1)) * 100)}%</span>
        </div>
        <ProgressBar value={(doneSteps / Math.max(totalSteps, 1)) * 100} color={subject.color} />
        <p className="mt-1.5 text-xs text-text-muted">{doneSteps} de {totalSteps} etapas concluídas em {contents.length} conteúdos</p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-border bg-surface-2/40 p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all"
            style={{ color: tab === t.key ? "var(--primary-fg)" : "var(--text-muted)" }}>
            {tab === t.key && (
              <motion.span layoutId="subj-tab" className="absolute inset-0 rounded-xl" style={{ background: subject.color }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ── Conteúdos ── */}
          {tab === "conteudos" && (
            <div className="space-y-3">
              {contents.length === 0 && (
                <Card><p className="py-8 text-center text-sm text-text-muted">Nenhum conteúdo registrado.</p></Card>
              )}
              {contents.map((c) => {
                const steps = STEP_KEYS.map((k) => ({ key: k, label: STEP_LABELS[STEP_KEYS.indexOf(k)], done: c.steps[k] }));
                const doneCount = steps.filter((s) => s.done).length;
                const expanded = expandedContent === c.id;
                return (
                  <Card key={c.id} interactive>
                    <button className="flex w-full items-center gap-3 text-left" onClick={() => setExpandedContent(expanded ? null : c.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{c.name}</p>
                        <div className="mt-2">
                          <ProgressBar value={(doneCount / 5) * 100} color={subject.color} />
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">{doneCount}/5 etapas · {c.questions > 0 ? `${pct(c.correct, c.questions)}% acerto` : "sem questões"}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-text-muted transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }} />
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 border-t border-border pt-4">
                            <p className="mb-3 text-xs font-bold text-text-muted uppercase">Trilha do método</p>
                            <div className="space-y-2">
                              {steps.map((s, i) => (
                                <div key={s.key} className="flex items-center gap-3 rounded-xl border px-3 py-2"
                                  style={{ borderColor: s.done ? `color-mix(in srgb, ${subject.color} 30%, transparent)` : "var(--border)", background: s.done ? `color-mix(in srgb, ${subject.color} 5%, transparent)` : "transparent" }}>
                                  <div className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold"
                                    style={{ background: s.done ? subject.color : "var(--surface-2)", color: s.done ? "#fff" : "var(--text-muted)" }}>
                                    {s.done ? "✓" : i + 1}
                                  </div>
                                  <span className={`flex-1 text-sm font-semibold ${s.done ? "text-text-muted line-through" : ""}`}>{s.label}</span>
                                  {s.done && <Badge color="var(--success)">Concluído</Badge>}
                                </div>
                              ))}
                            </div>
                            {c.questions > 0 && (
                              <div className="mt-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2">
                                <p className="text-xs text-text-muted">Questões: <b className="text-text">{c.correct}/{c.questions}</b> ({pct(c.correct, c.questions)}% acerto)</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}

          {tab === "tarefas" && <TasksTab subjectKey={key} color={subject.color} />}
          {tab === "flashcards" && <FlashcardsTab subjectKey={key} color={subject.color} />}
          {tab === "notas" && <NotasTab subjectKey={key} color={subject.color} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
