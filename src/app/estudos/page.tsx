"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Clock, Target, RefreshCw, FileBarChart, Plus,
  BookMarked, Newspaper, ClipboardList, Sparkles, ChevronRight, X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import {
  SUBJECTS, CONTENTS, SIMULATIONS, WEEKLY_SCHEDULE, REVISIONS,
  LITERARY_WORKS, ARTICLES, totals, type Content, type SubjectKey,
} from "@/lib/data";
import { formatHours, pct } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  aula: "Aula", leitura: "Leitura", exercicios: "Exercícios", revisao: "Revisão", dominio: "Domínio",
};

const inputClass = "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-secondary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1";

export default function EstudosPage() {
  const [contents, setContents] = useState<Content[]>(CONTENTS);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState<SubjectKey>(SUBJECTS[0].key);
  const [formStep, setFormStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    const saved = localStorage.getItem("estudos-conteudos");
    if (saved) {
      const local: Content[] = JSON.parse(saved);
      const localIds = new Set(local.map(c => c.id));
      setContents([...CONTENTS.filter(c => !localIds.has(c.id)), ...local]);
    }
  }, []);

  const simAvg = Math.round(
    (SIMULATIONS.reduce((a, s) => a + s.correct / s.total, 0) / SIMULATIONS.length) * 100
  );

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const steps: Content["steps"] = {
      aula: formStep >= 1,
      leitura: formStep >= 2,
      exercicios: formStep >= 3,
      revisao: formStep >= 4,
      dominio: false,
    };

    const newContent: Content = {
      id: `c-${Date.now()}`,
      name: formTitle.trim(),
      subject: formSubject,
      steps,
      questions: 0,
      correct: 0,
      week: `Sem ${Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`,
    };

    setContents(prev => {
      const next = [newContent, ...prev];
      const mockIds = new Set(CONTENTS.map(c => c.id));
      localStorage.setItem("estudos-conteudos", JSON.stringify(next.filter(c => !mockIds.has(c.id))));
      return next;
    });

    // Reset form
    setFormTitle("");
    setFormSubject(SUBJECTS[0].key);
    setFormStep(0);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Estudos"
        subtitle="Seu núcleo de aprovação em medicina"
        icon={<GraduationCap size={24} />}
        accent="var(--secondary)"
        action={
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> Novo conteúdo
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Horas totais" value={formatHours(SUBJECTS.reduce((a, s) => a + s.hours, 0))} icon={<Clock size={18} />} accent="var(--secondary)" />
        <StatCard index={1} label="Taxa de acerto" value={`${totals.accuracy}%`} icon={<Target size={18} />} accent="var(--success)" hint={`${totals.totalCorrect}/${totals.totalQuestions}`} />
        <StatCard index={2} label="Média simulados" value={`${simAvg}%`} icon={<FileBarChart size={18} />} accent="var(--primary)" hint={`${SIMULATIONS.length} realizados`} />
        <StatCard index={3} label="Revisões pendentes" value={REVISIONS.filter((r) => r.due).length} icon={<RefreshCw size={18} />} accent="var(--warning)" />
      </div>

      {/* Matérias */}
      <Card>
        <SectionTitle action={<Badge color="var(--secondary)">{SUBJECTS.length} matérias</Badge>}>
          Matérias
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SUBJECTS.map((s) => (
            <Link
              key={s.key}
              href={`/estudos/${s.key}`}
              className="group rounded-2xl border border-border bg-surface-2/40 p-4 transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 16%, transparent)` }}>
                  {s.name.slice(0, 2)}
                </span>
                <ProgressRing value={s.mastery} size={40} stroke={4} color={s.color} />
              </div>
              <p className="mt-3 truncate text-sm font-bold">{s.name}</p>
              <p className="text-[11px] text-text-muted">{formatHours(s.hours)} · {s.questions}q</p>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conteúdos com trilha de etapas */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle action={<Badge color="var(--primary)">{contents.length}</Badge>}>
              Conteúdos · trilha do método
            </SectionTitle>

            {/* Form inline expandível */}
            {showForm && (
              <form onSubmit={handleAddContent} className="mb-4 rounded-2xl border border-secondary/40 bg-secondary/5 p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "var(--secondary)" }}>Novo conteúdo</p>
                  <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Título do conteúdo</label>
                  <input className={inputClass} value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Termodinâmica, Romantismo..." required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Matéria</label>
                    <select className={inputClass} value={formSubject} onChange={e => setFormSubject(e.target.value as SubjectKey)}>
                      {SUBJECTS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Etapa atual</label>
                    <select className={inputClass} value={formStep} onChange={e => setFormStep(Number(e.target.value) as 0 | 1 | 2 | 3 | 4)}>
                      <option value={0}>0 — Não iniciado</option>
                      <option value={1}>1 — Aula concluída</option>
                      <option value={2}>2 — Leitura concluída</option>
                      <option value={3}>3 — Exercícios feitos</option>
                      <option value={4}>4 — Revisão feita</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 rounded-xl py-2 text-sm font-bold transition-transform hover:scale-[1.02]" style={{ background: "var(--secondary)", color: "#fff" }}>
                    Adicionar
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-hover transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {contents.map((c) => {
                const subject = SUBJECTS.find((s) => s.key === c.subject) ?? SUBJECTS[0];
                const steps = Object.entries(c.steps);
                const doneSteps = steps.filter(([, v]) => v).length;
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-surface-2/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{c.name}</p>
                        <span className="text-[11px]" style={{ color: subject.color }}>{subject.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {c.questions > 0 && (
                          <Badge color="var(--success)">{pct(c.correct, c.questions)}% acerto</Badge>
                        )}
                        <span className="text-xs font-semibold text-text-muted">{doneSteps}/5</span>
                      </div>
                    </div>
                    {/* Trilha */}
                    <div className="flex items-center gap-1">
                      {steps.map(([key, val], i) => (
                        <div key={key} className="flex flex-1 items-center gap-1">
                          <div className="flex flex-1 flex-col items-center gap-1">
                            <div
                              className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                                val ? "text-white" : "border-2 border-border-strong text-text-muted"
                              }`}
                              style={val ? { background: subject.color } : undefined}
                            >
                              {val ? "✓" : i + 1}
                            </div>
                            <span className="text-[9px] font-medium text-text-muted">{STEP_LABELS[key]}</span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className="mb-4 h-0.5 flex-1" style={{ background: val ? subject.color : "var(--border)" }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Simulados */}
          <Card>
            <SectionTitle
              action={
                <button className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
                  <Sparkles size={13} /> Analisar com IA
                </button>
              }
            >
              Simulados & Provas
            </SectionTitle>
            <div className="space-y-3">
              {SIMULATIONS.map((s) => {
                const acc = pct(s.correct, s.total);
                return (
                  <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface-2/40 p-3">
                    <Badge color="var(--primary)" soft={false}>{s.type}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <ProgressBar value={acc} color={acc >= 75 ? "var(--success)" : acc >= 60 ? "var(--warning)" : "var(--danger)"} className="mt-1.5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold">{acc}%</p>
                      <p className="text-[11px] text-text-muted">{s.correct}/{s.total}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-surface-2/50 p-3">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-text-muted" />
              <p className="text-xs text-text-secondary">
                Configure a IA em <b className="text-text">Configurações</b> para receber insights personalizados sobre seu desempenho nos simulados.
              </p>
            </div>
          </Card>
        </div>

        {/* Lateral */}
        <div className="space-y-6">
          {/* Cronograma */}
          <Card>
            <SectionTitle>Cronograma semanal</SectionTitle>
            <div className="space-y-2">
              {Object.entries(WEEKLY_SCHEDULE).map(([day, subs]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-bold text-text-secondary">{day}</span>
                  <div className="flex flex-wrap gap-1">
                    {subs.map((s) => (
                      <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Obras literárias */}
          <Card>
            <SectionTitle action={<BookMarked size={16} className="text-c-amber" />}>
              Obras literárias
            </SectionTitle>
            <div className="space-y-2">
              {LITERARY_WORKS.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl bg-surface-2/40 px-3 py-2">
                  <div className={`h-2 w-2 rounded-full ${o.read ? "bg-success" : "bg-border-strong"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.name}</p>
                    <p className="truncate text-[11px] text-text-muted">{o.author}</p>
                  </div>
                  <Badge color="var(--c-amber)">{o.vestibular[0]}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Artigos */}
          <Card>
            <SectionTitle action={<Newspaper size={16} className="text-c-cyan" />}>
              Atualidades
            </SectionTitle>
            <div className="space-y-2">
              {ARTICLES.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-surface-2/40 px-3 py-2">
                  <div className={`h-2 w-2 rounded-full ${a.read ? "bg-success" : "bg-warning"}`} />
                  <span className="flex-1 truncate text-sm">{a.title}</span>
                  {a.rating > 0 && <span className="text-xs">{"⭐".repeat(a.rating)}</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Atalhos */}
          <Card>
            <SectionTitle>Atalhos</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Redações", icon: ClipboardList, color: "var(--c-blue)", href: "/estudos/redacoes" },
                { label: "Notas", icon: FileBarChart, color: "var(--success)", href: "/estudos/notas" },
                { label: "Revisões", icon: RefreshCw, color: "var(--warning)", href: "/estudos/revisoes" },
                { label: "Vestibulares", icon: GraduationCap, color: "var(--secondary)", href: "/vestibulares" },
              ].map((s) => (
                <Link key={s.label} href={s.href} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover">
                  <s.icon size={15} style={{ color: s.color }} />
                  <span className="flex-1 text-left">{s.label}</span>
                  <ChevronRight size={14} className="text-text-muted" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
