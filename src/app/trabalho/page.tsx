"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Clock, DollarSign, CheckCircle2, Circle, AlertCircle, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { WORK_SESSIONS, WORK_TASKS, type WorkTask, type WorkSession } from "@/lib/data";

const PROJECTS = ["Salão", "Sypoza", "Optimio", "Pessoal"] as const;
type Project = typeof PROJECTS[number];

const PROJECT_META: Record<string, { color: string; emoji: string; desc: string }> = {
  Salão: { color: "var(--c-lilac)", emoji: "💇‍♀️", desc: "Salão de beleza — atendimentos" },
  Sypoza: { color: "var(--c-blue)", emoji: "🚀", desc: "Startup — estratégia & pitch" },
  Optimio: { color: "var(--primary)", emoji: "⚙️", desc: "Produto digital — desenvolvimento" },
  Pessoal: { color: "var(--c-amber)", emoji: "🙋‍♀️", desc: "Tarefas pessoais" },
};

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
  return new Date().toISOString().slice(0, 10);
}

const inputClass = "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1";

// ── Formulário Nova Tarefa ──
interface TaskFormProps { onAdd: (t: WorkTask) => void; onClose: () => void }
function TaskForm({ onAdd, onClose }: TaskFormProps) {
  const [name, setName] = useState("");
  const [project, setProject] = useState<Project>("Sypoza");
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
            <select className={inputClass} value={project} onChange={e => setProject(e.target.value as Project)}>
              {PROJECTS.map(p => <option key={p}>{p}</option>)}
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
interface SessionFormProps { onAdd: (s: WorkSession) => void; onClose: () => void }
function SessionForm({ onAdd, onClose }: SessionFormProps) {
  const [project, setProject] = useState<"Salão" | "Sypoza" | "Optimio">("Salão");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !description.trim()) return;
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
          <select className={inputClass} value={project} onChange={e => setProject(e.target.value as "Salão" | "Sypoza" | "Optimio")}>
            <option>Salão</option>
            <option>Sypoza</option>
            <option>Optimio</option>
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

export default function TrabalhoPage() {
  const [selectedProject, setSelectedProject] = useState<"Salão" | "Sypoza" | "Optimio" | "Todos">("Todos");
  const [tasks, setTasks] = useState(WORK_TASKS);
  const [sessions, setSessions] = useState(WORK_SESSIONS);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("trabalho-tarefas");
    if (savedTasks) {
      const localTasks: WorkTask[] = JSON.parse(savedTasks);
      const localIds = new Set(localTasks.map(t => t.id));
      setTasks([...WORK_TASKS.filter(t => !localIds.has(t.id)), ...localTasks]);
    }
    const savedSessions = localStorage.getItem("trabalho-sessoes");
    if (savedSessions) {
      const localSessions: WorkSession[] = JSON.parse(savedSessions);
      const localIds = new Set(localSessions.map(s => s.id));
      setSessions([...WORK_SESSIONS.filter(s => !localIds.has(s.id)), ...localSessions]);
    }
  }, []);

  const saveTasks = (next: WorkTask[]) => {
    const mockIds = new Set(WORK_TASKS.map(t => t.id));
    localStorage.setItem("trabalho-tarefas", JSON.stringify(next.filter(t => !mockIds.has(t.id))));
  };

  const saveSessions = (next: WorkSession[]) => {
    const mockIds = new Set(WORK_SESSIONS.map(s => s.id));
    localStorage.setItem("trabalho-sessoes", JSON.stringify(next.filter(s => !mockIds.has(s.id))));
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
        subtitle="Salão · Sypoza · Optimio"
        icon={<Briefcase size={24} />}
        accent="var(--c-blue)"
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Receita (Salão)</p>
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
      <div className="flex flex-wrap gap-2">
        {(["Todos", "Salão", "Sypoza", "Optimio"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setSelectedProject(p)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: selectedProject === p ? (p === "Todos" ? "var(--primary)" : PROJECT_META[p].color) : "var(--surface-2)",
              color: selectedProject === p ? (p === "Todos" ? "var(--primary-fg)" : "#fff") : "var(--text-secondary)",
              borderColor: selectedProject === p ? "transparent" : undefined,
            }}
          >
            {p !== "Todos" && <span>{PROJECT_META[p].emoji}</span>}
            {p}
          </button>
        ))}
      </div>

      {/* Forms */}
      <AnimatePresence>
        {showTaskForm && <TaskForm onAdd={handleAddTask} onClose={() => setShowTaskForm(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSessionForm && <SessionForm onAdd={handleAddSession} onClose={() => setShowSessionForm(false)} />}
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
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-surface-hover"
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
                    <span className="text-[11px]">{PROJECT_META[task.project]?.emoji ?? "📌"}</span>
                    <span className="text-[11px] text-text-muted">{task.project}</span>
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
              const meta = PROJECT_META[s.project];
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
      <div className="grid gap-4 sm:grid-cols-3">
        {(["Salão", "Sypoza", "Optimio"] as const).map((p) => {
          const pSessions = sessions.filter((s) => s.project === p);
          const hours = pSessions.reduce((sum, s) => sum + s.hours, 0);
          const revenue = pSessions.filter((s) => s.revenue).reduce((sum, s) => sum + (s.revenue ?? 0), 0);
          const pendingTasks = tasks.filter((t) => t.project === p && t.status !== "Concluída").length;
          const meta = PROJECT_META[p];
          return (
            <Card key={p}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="font-bold">{p}</p>
                  <p className="text-xs text-text-muted">{meta.desc}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-extrabold" style={{ color: meta.color }}>{hours}h</p>
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
    </div>
  );
}
