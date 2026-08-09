"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Clock, DollarSign, CheckCircle2, Circle, AlertCircle, Plus, X, Settings } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { WORK_SESSIONS, WORK_TASKS, type WorkTask, type WorkSession } from "@/lib/data";
import { loadWorkProjects, type WorkProject } from "@/lib/work-projects";
import { todayLocalISO } from "@/lib/date-utils";

const PESSOAL_META = { id: "Pessoal", name: "Pessoal", color: "var(--c-amber)", emoji: "🙋‍♀️", description: "Tarefas pessoais" };

const PRIORITY_COLOR: Record<WorkTask["priority"], string> = {
  Alta: "var(--danger)",
  Média: "var(--c-amber)",
  Baixa: "var(--text-muted)",
};

const STATUS_CYCLE: WorkTask["status"][] = ["Não iniciada", "Em andamento", "Concluída"];

const STATUS_ICON: Record<WorkTask["status"], React.ReactNode> = {
  "Concluída": <CheckCircle2 size={16} style={{ color: "var(--success)" }} />,
  "Em andamento": <AlertCircle size={16} style={{ color: "var(--c-amber)" }} />,
  "Não iniciada": <Circle size={16} style={{ color: "var(--text-muted)" }} />,
};

function todayISO() {
  return todayLocalISO();
}

const inputClass = "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1";

// ── Formulário Nova Tarefa ──
interface TaskFormProps { projects: WorkProject[]; onAdd: (t: WorkTask) => void; onClose: () => void }
function TaskForm({ projects, onAdd, onClose }: TaskFormProps) {
  const [name, setName] = useState("");
  const [project, setProject] = useState(projects[0]?.id ?? "Pessoal");
  const [status, setStatus] = useState<WorkTask["status"]>("Não iniciada");
  const [due, setDue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: `wt-${Date.now()}`,
      name: name.trim(),
      project,
      status,
      priority: "Média",
      due: due || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-md)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-sm">Nova tarefa</p>
        <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Título</label>
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Finalizar relatório..." required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Projeto</label>
            <select className={inputClass} value={project} onChange={e => setProject(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option value="Pessoal">Pessoal</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status inicial</label>
            <select className={inputClass} value={status} onChange={e => setStatus(e.target.value as WorkTask["status"])}>
              <option>Não iniciada</option>
              <option>Em andamento</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Prazo (opcional)</label>
          <input className={inputClass} type="date" value={due} onChange={e => setDue(e.target.value)} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="flex-1 rounded-xl py-2 text-sm font-bold transition-transform hover:scale-[1.02]" style={{ background: "var(--primary)", color: "var(--primary-fg)" }}>
            Adicionar
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-hover transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Formulário Nova Sessão ──
interface SessionFormProps { projects: WorkProject[]; onAdd: (s: WorkSession) => void; onClose: () => void }
function SessionForm({ projects, onAdd, onClose }: SessionFormProps) {
  const [project, setProject] = useState(projects[0]?.id ?? "");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !description.trim() || !project) return;
    onAdd({
      id: `ws-${Date.now()}`,
      project,
      hours: parseFloat(hours),
      description: description.trim(),
      date,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-md)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-sm">Nova sessão de trabalho</p>
        <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Projeto</label>
          <select className={inputClass} value={project} onChange={e => setProject(e.target.value)}>
            {projects.length === 0 && <option value="">Nenhum projeto configurado</option>}
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Duração (horas)</label>
            <input className={inputClass} type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(e.target.value)} placeholder="Ex: 2" required />
          </div>
          <div>
            <label className={labelClass}>Data</label>
            <input className={inputClass} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Descrição</label>
          <input className={inputClass} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Reunião de estratégia..." required />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="flex-1 rounded-xl py-2 text-sm font-bold transition-transform hover:scale-[1.02]" style={{ background: "var(--primary)", color: "var(--primary-fg)" }}>
            Registrar
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-surface-hover transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function loadTasks(): WorkTask[] {
  if (typeof window === "undefined") return WORK_TASKS;
  try {
    const saved = localStorage.getItem("trabalho-tarefas");
    if (!saved) return WORK_TASKS;
    const savedList: WorkTask[] = JSON.parse(saved);
    const savedMap = new Map(savedList.map((t) => [t.id, t]));
    const baseIds = new Set(WORK_TASKS.map((t) => t.id));
    const merged = WORK_TASKS.map((t) => savedMap.get(t.id) ?? t);
    const userAdded = savedList.filter((t) => !baseIds.has(t.id));
    return [...merged, ...userAdded];
  } catch {
    return WORK_TASKS;
  }
}

function loadSessions(): WorkSession[] {
  if (typeof window === "undefined") return WORK_SESSIONS;
  try {
    const saved = localStorage.getItem("trabalho-sessoes");
    if (!saved) return WORK_SESSIONS;
    const savedList: WorkSession[] = JSON.parse(saved);
    const savedMap = new Map(savedList.map((s) => [s.id, s]));
    const baseIds = new Set(WORK_SESSIONS.map((s) => s.id));
    const merged = WORK_SESSIONS.map((s) => savedMap.get(s.id) ?? s);
    const userAdded = savedList.filter((s) => !baseIds.has(s.id));
    return [...merged, ...userAdded];
  } catch {
    return WORK_SESSIONS;
  }
}

export default function TrabalhoPage() {
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("Todos");
  const [tasks, setTasks] = useState(WORK_TASKS);
  const [sessions, setSessions] = useState(WORK_SESSIONS);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  useEffect(() => {
    setProjects(loadWorkProjects());
    setTasks(loadTasks());
    setSessions(loadSessions());
  }, []);

  const projectMeta = (id: string): WorkProject | typeof PESSOAL_META =>
    projects.find((p) => p.id === id) ?? PESSOAL_META;

  const saveTasks = (next: WorkTask[]) => {
    localStorage.setItem("trabalho-tarefas", JSON.stringify(next));
  };

  const saveSessions = (next: WorkSession[]) => {
    localStorage.setItem("trabalho-sessoes", JSON.stringify(next));
  };

  const toggleTask = (id: string) =>
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        const idx = STATUS_CYCLE.indexOf(t.status);
        const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        return { ...t, status: nextStatus };
      });
      saveTasks(next);
      return next;
    });

  const handleAddTask = (t: WorkTask) => {
    setTasks((prev) => {
      const next = [t, ...prev];
      saveTasks(next);
      return next;
    });
    setShowTaskForm(false);
  };

  const handleAddSession = (s: WorkSession) => {
    setSessions((prev) => {
      const next = [s, ...prev];
      saveSessions(next);
      return next;
    });
    setShowSessionForm(false);
  };

  const filteredSessions = selectedProject === "Todos"
    ? sessions
    : sessions.filter((s) => s.project === selectedProject);

  const filteredTasks = selectedProject === "Todos"
    ? tasks
    : tasks.filter((t) => t.project === selectedProject);

  // KPIs
  const totalRevenue = sessions.filter((s) => s.revenue).reduce((sum, s) => sum + (s.revenue ?? 0), 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const completedTasks = tasks.filter((t) => t.status === "Concluída").length;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Trabalho"
        subtitle={projects.length > 0 ? projects.map((p) => p.name).join(" · ") : "Configure seus projetos"}
        icon={<Briefcase size={24} />}
        accent="var(--c-blue)"
        action={
          <Link
            href="/configuracoes"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Settings size={13} /> Projetos
          </Link>
        }
      />

      {projects.length === 0 && (
        <Card>
          <p className="text-sm text-text-muted">
            Nenhum projeto de trabalho configurado ainda.{" "}
            <Link href="/configuracoes" className="font-semibold" style={{ color: "var(--primary)" }}>
              Adicione seus projetos em Configurações
            </Link>{" "}
            para começar a registrar tarefas e sessões.
          </p>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Receita total</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--success)" }}>R$ {totalRevenue.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--c-blue) 15%, transparent)", color: "var(--c-blue)" }}>
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Horas registradas</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--c-blue)" }}>{totalHours}h</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Tarefas concluídas</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>{completedTasks}/{tasks.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projetos */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ id: "Todos", name: "Todos", emoji: "", color: "" }, ...projects].map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p.id)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: selectedProject === p.id ? (p.id === "Todos" ? "var(--primary)" : p.color) : "var(--surface-2)",
                color: selectedProject === p.id ? (p.id === "Todos" ? "var(--primary-fg)" : "#fff") : "var(--text-secondary)",
                borderColor: selectedProject === p.id ? "transparent" : undefined,
              }}
            >
              {p.id !== "Todos" && <span>{p.emoji}</span>}
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Forms */}
      <AnimatePresence>
        {showTaskForm && <TaskForm projects={projects} onAdd={handleAddTask} onClose={() => setShowTaskForm(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSessionForm && <SessionForm projects={projects} onAdd={handleAddSession} onClose={() => setShowSessionForm(false)} />}
      </AnimatePresence>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setShowTaskForm(v => !v); setShowSessionForm(false); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
        >
          <Plus size={16} /> Nova tarefa
        </button>
        <button
          onClick={() => { setShowSessionForm(v => !v); setShowTaskForm(false); }}
          disabled={projects.length === 0}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-surface-hover disabled:opacity-40"
          style={{ color: "var(--c-blue)" }}
        >
          <Plus size={16} /> Nova sessão
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tarefas */}
        <Card>
          <SectionTitle>Tarefas</SectionTitle>
          <div className="mt-3 space-y-2">
            {filteredTasks.length === 0 && <p className="text-sm text-text-muted">Nenhuma tarefa.</p>}
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                onClick={() => toggleTask(task.id)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-surface-hover"
                style={{ opacity: task.status === "Concluída" ? 0.6 : 1 }}
              >
                {STATUS_ICON[task.status]}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${task.status === "Concluída" ? "line-through text-text-muted" : ""}`}>
                    {task.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[11px]">{projectMeta(task.project).emoji ?? "📌"}</span>
                    <span className="text-[11px] text-text-muted">{projectMeta(task.project).name ?? task.project}</span>
                    {task.due && (
                      <span className="text-[11px] text-text-muted">· até {new Date(task.due).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    )}
                  </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[task.priority] }} title={task.priority} />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Sessões */}
        <Card>
          <SectionTitle>Sessões de trabalho</SectionTitle>
          <div className="mt-3 space-y-2">
            {filteredSessions.length === 0 && <p className="text-sm text-text-muted">Nenhuma sessão registrada.</p>}
            {filteredSessions.map((s) => {
              const meta = projectMeta(s.project);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}>
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{s.description}</p>
                    <p className="text-[11px] text-text-muted">
                      {new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {s.hours}h
                    </p>
                  </div>
                  {s.revenue && (
                    <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: "var(--success)" }}>
                      +R${s.revenue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Cards de projeto */}
      {projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {projects.map((p) => {
            const pSessions = sessions.filter((s) => s.project === p.id);
            const hours = pSessions.reduce((sum, s) => sum + s.hours, 0);
            const revenue = pSessions.filter((s) => s.revenue).reduce((sum, s) => sum + (s.revenue ?? 0), 0);
            const pendingTasks = tasks.filter((t) => t.project === p.id && t.status !== "Concluída").length;
            return (
              <Card key={p.id}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)` }}>
                    {p.emoji}
                  </div>
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.description}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-extrabold" style={{ color: p.color }}>{hours}h</p>
                    <p className="text-[10px] text-text-muted">horas</p>
                  </div>
                  {revenue > 0 ? (
                    <div>
                      <p className="text-lg font-extrabold" style={{ color: "var(--success)" }}>R${revenue}</p>
                      <p className="text-[10px] text-text-muted">receita</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-extrabold text-text-muted">—</p>
                      <p className="text-[10px] text-text-muted">receita</p>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-extrabold" style={{ color: pendingTasks > 0 ? "var(--c-amber)" : "var(--success)" }}>{pendingTasks}</p>
                    <p className="text-[10px] text-text-muted">pendentes</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
