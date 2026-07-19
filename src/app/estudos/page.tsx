"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Clock, Target, RefreshCw, FileBarChart, Plus,
  BookMarked, Newspaper, ClipboardList, ChevronRight, X,
  Trash2, ExternalLink, Check, ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import {
  SUBJECTS, CONTENTS, SIMULATIONS, WEEKLY_SCHEDULE, REVISIONS,
  LITERARY_WORKS, ARTICLES, totals, type Content, type SubjectKey,
  type Simulation, type LiteraryWork, type Article,
} from "@/lib/data";
import { formatHours, pct } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  aula: "Aula", leitura: "Leitura", exercicios: "Exercícios", revisao: "Revisão", dominio: "Domínio",
};

const inputClass = "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-secondary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1";

// ─── Extended types (localStorage-only extras) ────────────────────────────────

type RichLiteraryWork = LiteraryWork & {
  link?: string;
  rating?: number; // 1-5
  redacaoTheme?: string;
  notes?: string;
};

type RichArticle = Article & {
  category?: string;
  link?: string;
  summary?: string;
  criticalAnalysis?: string;
  relatedRedacao?: string;
};

type ExtSimulation = Simulation & {
  notes?: string;
  subjectBreakdown?: Record<string, { correct: number; total: number }>;
};

const SIM_TYPES: Simulation["type"][] = ["ENEM", "FUVEST", "PISM", "PLATAFORMA ASSAAD", "POLIEDRO", "SAS"];

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={`text-sm transition-colors ${n <= value ? "text-c-amber" : "text-border-strong"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EstudosPage() {
  const [contents, setContents] = useState<Content[]>(CONTENTS);
  const [showContentForm, setShowContentForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState<SubjectKey>(SUBJECTS[0].key);
  const [formStep, setFormStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Simulados
  const [simulations, setSimulations] = useState<ExtSimulation[]>(SIMULATIONS);
  const [showSimForm, setShowSimForm] = useState(false);
  const [simForm, setSimForm] = useState({ name: "", type: "ENEM" as Simulation["type"], date: new Date().toISOString().slice(0, 10), total: "", correct: "", notes: "" });

  // Obras literárias
  const [works, setWorks] = useState<RichLiteraryWork[]>(LITERARY_WORKS);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [expandedWork, setExpandedWork] = useState<string | null>(null);
  const [workForm, setWorkForm] = useState({ name: "", author: "", school: "", vestibular: "", link: "", rating: 0, redacaoTheme: "", notes: "" });

  // Artigos
  const [articles, setArticles] = useState<RichArticle[]>(ARTICLES);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({ title: "", category: "", link: "", summary: "", criticalAnalysis: "", relatedRedacao: "" });

  useEffect(() => {
    try {
      const s = localStorage.getItem("estudos-conteudos");
      if (s) { const local: Content[] = JSON.parse(s); const ids = new Set(local.map(c => c.id)); setContents([...CONTENTS.filter(c => !ids.has(c.id)), ...local]); }
    } catch { /* */ }
    try { const s = localStorage.getItem("estudos-simulations"); if (s) setSimulations(JSON.parse(s)); } catch { /* */ }
    try { const s = localStorage.getItem("estudos-works"); if (s) setWorks(JSON.parse(s)); } catch { /* */ }
    try { const s = localStorage.getItem("estudos-articles"); if (s) setArticles(JSON.parse(s)); } catch { /* */ }
  }, []);

  function saveSimulations(data: ExtSimulation[]) { setSimulations(data); localStorage.setItem("estudos-simulations", JSON.stringify(data)); }
  function saveWorks(data: RichLiteraryWork[]) { setWorks(data); localStorage.setItem("estudos-works", JSON.stringify(data)); }
  function saveArticles(data: RichArticle[]) { setArticles(data); localStorage.setItem("estudos-articles", JSON.stringify(data)); }

  const simAvg = simulations.length
    ? Math.round((simulations.reduce((a, s) => a + s.correct / s.total, 0) / simulations.length) * 100)
    : 0;

  function handleAddContent(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const steps: Content["steps"] = { aula: formStep >= 1, leitura: formStep >= 2, exercicios: formStep >= 3, revisao: formStep >= 4, dominio: false };
    const newContent: Content = { id: `c-${Date.now()}`, name: formTitle.trim(), subject: formSubject, steps, questions: 0, correct: 0, week: `Sem ${Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}` };
    setContents(prev => { const next = [newContent, ...prev]; const mockIds = new Set(CONTENTS.map(c => c.id)); localStorage.setItem("estudos-conteudos", JSON.stringify(next.filter(c => !mockIds.has(c.id)))); return next; });
    setFormTitle(""); setFormSubject(SUBJECTS[0].key); setFormStep(0); setShowContentForm(false);
  }

  function addSimulation() {
    if (!simForm.name.trim() || !simForm.total || !simForm.correct) return;
    saveSimulations([{ id: `sim-${Date.now()}`, name: simForm.name.trim(), type: simForm.type, date: simForm.date, total: Number(simForm.total), correct: Number(simForm.correct), notes: simForm.notes }, ...simulations]);
    setSimForm({ name: "", type: "ENEM", date: new Date().toISOString().slice(0, 10), total: "", correct: "", notes: "" });
    setShowSimForm(false);
  }

  function deleteSimulation(id: string) { saveSimulations(simulations.filter(s => s.id !== id)); }

  function addWork() {
    if (!workForm.name.trim()) return;
    saveWorks([{ id: `w-${Date.now()}`, name: workForm.name.trim(), author: workForm.author, school: workForm.school, read: false, vestibular: workForm.vestibular.split(",").map(v => v.trim()).filter(Boolean), link: workForm.link, rating: workForm.rating, redacaoTheme: workForm.redacaoTheme, notes: workForm.notes }, ...works]);
    setWorkForm({ name: "", author: "", school: "", vestibular: "", link: "", rating: 0, redacaoTheme: "", notes: "" });
    setShowWorkForm(false);
  }

  function toggleWorkRead(id: string) { saveWorks(works.map(w => w.id === id ? { ...w, read: !w.read } : w)); }
  function deleteWork(id: string) { saveWorks(works.filter(w => w.id !== id)); }

  function addArticle() {
    if (!articleForm.title.trim()) return;
    saveArticles([{ id: `a-${Date.now()}`, title: articleForm.title.trim(), read: false, rating: 0, category: articleForm.category, link: articleForm.link, summary: articleForm.summary, criticalAnalysis: articleForm.criticalAnalysis, relatedRedacao: articleForm.relatedRedacao }, ...articles]);
    setArticleForm({ title: "", category: "", link: "", summary: "", criticalAnalysis: "", relatedRedacao: "" });
    setShowArticleForm(false);
  }

  function toggleArticleRead(id: string) { saveArticles(articles.map(a => a.id === id ? { ...a, read: !a.read } : a)); }
  function deleteArticle(id: string) { saveArticles(articles.filter(a => a.id !== id)); }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Estudos"
        subtitle="Seu núcleo de aprovação em medicina"
        icon={<GraduationCap size={24} />}
        accent="var(--secondary)"
        action={
          <button onClick={() => setShowContentForm(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]">
            <Plus size={16} /> Novo conteúdo
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Horas totais" value={formatHours(SUBJECTS.reduce((a, s) => a + s.hours, 0))} icon={<Clock size={18} />} accent="var(--secondary)" />
        <StatCard index={1} label="Taxa de acerto" value={`${totals.accuracy}%`} icon={<Target size={18} />} accent="var(--success)" hint={`${totals.totalCorrect}/${totals.totalQuestions}`} />
        <StatCard index={2} label="Média simulados" value={`${simAvg}%`} icon={<FileBarChart size={18} />} accent="var(--primary)" hint={`${simulations.length} realizados`} />
        <StatCard index={3} label="Revisões pendentes" value={REVISIONS.filter(r => r.due).length} icon={<RefreshCw size={18} />} accent="var(--warning)" />
      </div>

      {/* Matérias */}
      <Card>
        <SectionTitle action={<Badge color="var(--secondary)">{SUBJECTS.length} matérias</Badge>}>Matérias</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SUBJECTS.map(s => (
            <Link key={s.key} href={`/estudos/${s.key}`}
              className="group rounded-2xl border border-border bg-surface-2/40 p-4 transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-md)]">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold"
                  style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 16%, transparent)` }}>
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
        {/* LEFT: Conteúdos + Simulados */}
        <div className="space-y-6 lg:col-span-2">

          {/* Conteúdos */}
          <Card>
            <SectionTitle action={<Badge color="var(--primary)">{contents.length}</Badge>}>
              Conteúdos · trilha do método
            </SectionTitle>

            {showContentForm && (
              <form onSubmit={handleAddContent} className="mb-4 rounded-2xl border border-secondary/40 bg-secondary/5 p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "var(--secondary)" }}>Novo conteúdo</p>
                  <button type="button" onClick={() => setShowContentForm(false)} className="text-text-muted hover:text-text"><X size={16} /></button>
                </div>
                <div>
                  <label className={labelClass}>Título</label>
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
                    <select className={inputClass} value={formStep} onChange={e => setFormStep(Number(e.target.value) as 0|1|2|3|4)}>
                      <option value={0}>0 — Não iniciado</option>
                      <option value={1}>1 — Aula concluída</option>
                      <option value={2}>2 — Leitura concluída</option>
                      <option value={3}>3 — Exercícios feitos</option>
                      <option value={4}>4 — Revisão feita</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 rounded-xl py-2 text-sm font-bold text-white" style={{ background: "var(--secondary)" }}>Adicionar</button>
                  <button type="button" onClick={() => setShowContentForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted">Cancelar</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {contents.map(c => {
                const subject = SUBJECTS.find(s => s.key === c.subject) ?? SUBJECTS[0];
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
                        {c.questions > 0 && <Badge color="var(--success)">{pct(c.correct, c.questions)}%</Badge>}
                        <span className="text-xs font-semibold text-text-muted">{doneSteps}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {steps.map(([key, val], i) => (
                        <div key={key} className="flex flex-1 items-center gap-1">
                          <div className="flex flex-1 flex-col items-center gap-1">
                            <div className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition-colors ${val ? "text-white" : "border-2 border-border-strong text-text-muted"}`}
                              style={val ? { background: subject.color } : undefined}>
                              {val ? "✓" : i + 1}
                            </div>
                            <span className="text-[9px] font-medium text-text-muted">{STEP_LABELS[key]}</span>
                          </div>
                          {i < steps.length - 1 && <div className="mb-4 h-0.5 flex-1" style={{ background: val ? subject.color : "var(--border)" }} />}
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
            <SectionTitle action={
              <button onClick={() => setShowSimForm(v => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
                <Plus size={13} /> Novo simulado
              </button>
            }>
              Simulados & Provas
            </SectionTitle>

            {showSimForm && (
              <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={labelClass}>Nome</label>
                    <input className={inputClass} placeholder="Ex: Simulado ENEM #5" value={simForm.name} onChange={e => setSimForm({ ...simForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Tipo</label>
                    <select className={inputClass} value={simForm.type} onChange={e => setSimForm({ ...simForm, type: e.target.value as Simulation["type"] })}>
                      {SIM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Data</label>
                    <input type="date" className={inputClass} value={simForm.date} onChange={e => setSimForm({ ...simForm, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Total de questões</label>
                    <input type="number" className={inputClass} placeholder="180" value={simForm.total} onChange={e => setSimForm({ ...simForm, total: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Acertos</label>
                    <input type="number" className={inputClass} placeholder="142" value={simForm.correct} onChange={e => setSimForm({ ...simForm, correct: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Observações</label>
                    <input className={inputClass} placeholder="Pontos a melhorar, áreas fracas..." value={simForm.notes} onChange={e => setSimForm({ ...simForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addSimulation} className="flex-1 rounded-xl py-2 text-sm font-bold text-white" style={{ background: "var(--primary)" }}>Salvar</button>
                  <button onClick={() => setShowSimForm(false)} className="rounded-xl border border-border px-4 text-sm text-text-muted">Cancelar</button>
                </div>
              </div>
            )}

            {/* Resumo */}
            {simulations.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-surface-2/40 p-3 text-center">
                  <p className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>{simAvg}%</p>
                  <p className="text-[11px] text-text-muted">média geral</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-2/40 p-3 text-center">
                  <p className="text-xl font-extrabold">{simulations.length}</p>
                  <p className="text-[11px] text-text-muted">simulados</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-2/40 p-3 text-center">
                  <p className="text-xl font-extrabold" style={{ color: simAvg >= 75 ? "var(--success)" : simAvg >= 60 ? "var(--c-amber)" : "var(--danger)" }}>
                    {simAvg >= 75 ? "Ótimo" : simAvg >= 60 ? "Bom" : "Atenção"}
                  </p>
                  <p className="text-[11px] text-text-muted">desempenho</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {simulations.map(s => {
                const acc = pct(s.correct, s.total);
                return (
                  <div key={s.id} className="rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-4">
                      <Badge color="var(--primary)" soft={false}>{s.type}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        <ProgressBar value={acc} color={acc >= 75 ? "var(--success)" : acc >= 60 ? "var(--warning)" : "var(--danger)"} className="mt-1.5" />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold">{acc}%</p>
                        <p className="text-[11px] text-text-muted">{s.correct}/{s.total}</p>
                      </div>
                      <button onClick={() => deleteSimulation(s.id)} className="text-text-muted opacity-50 hover:opacity-100 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {s.notes && <p className="mt-2 text-[11px] text-text-muted border-t border-border pt-2">{s.notes}</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT: Cronograma + Obras + Artigos + Atalhos */}
        <div className="space-y-6">
          {/* Cronograma */}
          <Card>
            <SectionTitle>Cronograma semanal</SectionTitle>
            <div className="space-y-2">
              {Object.entries(WEEKLY_SCHEDULE).map(([day, subs]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-bold text-text-secondary">{day}</span>
                  <div className="flex flex-wrap gap-1">
                    {subs.map(s => <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Obras literárias */}
          <Card>
            <SectionTitle action={
              <div className="flex items-center gap-2">
                <BookMarked size={15} className="text-c-amber" />
                <button onClick={() => setShowWorkForm(v => !v)}
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-text-muted hover:text-text">
                  <Plus size={11} />
                </button>
              </div>
            }>
              Obras literárias
            </SectionTitle>

            {showWorkForm && (
              <div className="mb-3 rounded-xl border border-c-amber/30 bg-c-amber/5 p-3 space-y-2">
                <input className={inputClass} placeholder="Título da obra" value={workForm.name} onChange={e => setWorkForm({ ...workForm, name: e.target.value })} />
                <input className={inputClass} placeholder="Autor" value={workForm.author} onChange={e => setWorkForm({ ...workForm, author: e.target.value })} />
                <input className={inputClass} placeholder="Escola literária / movimento" value={workForm.school} onChange={e => setWorkForm({ ...workForm, school: e.target.value })} />
                <input className={inputClass} placeholder="Vestibulares (separe por vírgula)" value={workForm.vestibular} onChange={e => setWorkForm({ ...workForm, vestibular: e.target.value })} />
                <input className={inputClass} placeholder="Link (opcional)" value={workForm.link} onChange={e => setWorkForm({ ...workForm, link: e.target.value })} />
                <input className={inputClass} placeholder="Conexão com tema de redação" value={workForm.redacaoTheme} onChange={e => setWorkForm({ ...workForm, redacaoTheme: e.target.value })} />
                <input className={inputClass} placeholder="Observações" value={workForm.notes} onChange={e => setWorkForm({ ...workForm, notes: e.target.value })} />
                <div className="flex items-center gap-2">
                  <p className="text-xs text-text-muted">Rating:</p>
                  <StarRating value={workForm.rating} onChange={r => setWorkForm({ ...workForm, rating: r })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={addWork} className="flex-1 rounded-xl py-2 text-xs font-bold text-white" style={{ background: "var(--c-amber)" }}>Salvar</button>
                  <button onClick={() => setShowWorkForm(false)} className="rounded-xl border border-border px-3 text-xs text-text-muted">Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {works.map(o => {
                const expanded = expandedWork === o.id;
                return (
                  <div key={o.id} className="rounded-xl border border-border bg-surface-2/40">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <button onClick={() => toggleWorkRead(o.id)}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${o.read ? "border-success bg-success" : "border-border-strong"}`}>
                        {o.read && <Check size={10} className="text-white" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{o.name}</p>
                        <p className="truncate text-[11px] text-text-muted">{o.author} · <span className="italic">{(o as RichLiteraryWork).school}</span></p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(o as RichLiteraryWork).rating ? <span className="text-xs text-c-amber">{"★".repeat((o as RichLiteraryWork).rating!)}</span> : null}
                        <button onClick={() => setExpandedWork(expanded ? null : o.id)} className="text-text-muted hover:text-text">
                          <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <button onClick={() => deleteWork(o.id)} className="text-text-muted opacity-50 hover:opacity-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="border-t border-border px-3 py-2 space-y-1">
                        {o.vestibular?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {o.vestibular.map(v => <Badge key={v} color="var(--c-amber)">{v}</Badge>)}
                          </div>
                        )}
                        {(o as RichLiteraryWork).redacaoTheme && (
                          <p className="text-[11px] text-text-muted"><b className="text-text">Redação:</b> {(o as RichLiteraryWork).redacaoTheme}</p>
                        )}
                        {(o as RichLiteraryWork).notes && <p className="text-[11px] text-text-muted">{(o as RichLiteraryWork).notes}</p>}
                        {(o as RichLiteraryWork).link && (
                          <a href={(o as RichLiteraryWork).link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-secondary hover:underline">
                            <ExternalLink size={11} /> Ver lista de provas
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Artigos & Atualidades */}
          <Card>
            <SectionTitle action={
              <div className="flex items-center gap-2">
                <Newspaper size={15} className="text-c-cyan" />
                <button onClick={() => setShowArticleForm(v => !v)}
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-text-muted hover:text-text">
                  <Plus size={11} />
                </button>
              </div>
            }>
              Atualidades & Artigos
            </SectionTitle>

            {showArticleForm && (
              <div className="mb-3 rounded-xl border border-c-cyan/30 bg-c-cyan/5 p-3 space-y-2">
                <input className={inputClass} placeholder="Título do artigo" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} />
                <input className={inputClass} placeholder="Categoria (Saúde, Política, Tecnologia...)" value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })} />
                <input className={inputClass} placeholder="Link (opcional)" value={articleForm.link} onChange={e => setArticleForm({ ...articleForm, link: e.target.value })} />
                <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Resumo" value={articleForm.summary} onChange={e => setArticleForm({ ...articleForm, summary: e.target.value })} />
                <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Análise crítica" value={articleForm.criticalAnalysis} onChange={e => setArticleForm({ ...articleForm, criticalAnalysis: e.target.value })} />
                <input className={inputClass} placeholder="Redação relacionada" value={articleForm.relatedRedacao} onChange={e => setArticleForm({ ...articleForm, relatedRedacao: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={addArticle} className="flex-1 rounded-xl py-2 text-xs font-bold text-white" style={{ background: "var(--c-cyan)" }}>Salvar</button>
                  <button onClick={() => setShowArticleForm(false)} className="rounded-xl border border-border px-3 text-xs text-text-muted">Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {articles.map(a => {
                const expanded = expandedArticle === a.id;
                const rich = a as RichArticle;
                return (
                  <div key={a.id} className="rounded-xl border border-border bg-surface-2/40">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <button onClick={() => toggleArticleRead(a.id)}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${a.read ? "border-success bg-success" : "border-c-amber"}`}>
                        {a.read && <Check size={10} className="text-white" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{a.title}</p>
                        {rich.category && <p className="text-[11px] text-text-muted">{rich.category}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {a.rating > 0 && <span className="text-xs">{"⭐".repeat(a.rating)}</span>}
                        {(rich.summary || rich.criticalAnalysis || rich.link) && (
                          <button onClick={() => setExpandedArticle(expanded ? null : a.id)} className="text-text-muted hover:text-text">
                            <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                        <button onClick={() => deleteArticle(a.id)} className="text-text-muted opacity-50 hover:opacity-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="border-t border-border px-3 py-2 space-y-1.5">
                        {rich.summary && <p className="text-[11px] text-text-secondary"><b className="text-text">Resumo:</b> {rich.summary}</p>}
                        {rich.criticalAnalysis && <p className="text-[11px] text-text-secondary"><b className="text-text">Análise crítica:</b> {rich.criticalAnalysis}</p>}
                        {rich.relatedRedacao && <p className="text-[11px] text-text-secondary"><b className="text-text">Redação:</b> {rich.relatedRedacao}</p>}
                        {rich.link && (
                          <a href={rich.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-secondary hover:underline">
                            <ExternalLink size={11} /> Ver artigo completo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
              ].map(s => (
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
