"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Target, RefreshCw, Wallet, Flame, ChevronRight, Droplets, CalendarClock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { StudyAreaChart } from "@/components/charts/study-area-chart";
import {
  totals, REVISIONS, SUBJECTS, GOALS, VESTIBULARES,
  STUDY_STREAK, WATER_GLASSES, daysUntil,
} from "@/lib/data";
import { formatCurrency, formatHours, formatHours as fh, pct } from "@/lib/utils";
import { DEFAULT_HABITS_BY_DAY, getTodayKey, type Habit } from "@/lib/habits";
import { todayLocalISO } from "@/lib/date-utils";

function getTodayDate() {
  return todayLocalISO();
}

type ExtraTask = { id: string; name: string; time: string; category: string };

export default function Dashboard() {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [extraTasks, setExtraTasks] = useState<ExtraTask[]>([]);
  // nextVest computed client-side to avoid SSR/client timezone mismatch
  const [nextVest, setNextVest] = useState(VESTIBULARES[0]);
  const [vestCountdowns, setVestCountdowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const dayKey = getTodayKey();
    const dateStr = getTodayDate();

    // Load habits (with day-specific overrides)
    const savedDefault = localStorage.getItem(`rotina-default-${dayKey}`);
    const baseHabits: Habit[] = savedDefault ? JSON.parse(savedDefault) : DEFAULT_HABITS_BY_DAY[dayKey] ?? [];
    const removedRaw = localStorage.getItem(`rotina-removed-${dayKey}`);
    const removed: string[] = removedRaw ? JSON.parse(removedRaw) : [];
    setTodayHabits(baseHabits.filter((h) => !removed.includes(h.id)));

    // Load extras
    const extrasRaw = localStorage.getItem(`rotina-extras-${dayKey}`);
    if (extrasRaw) setExtraTasks(JSON.parse(extrasRaw));

    // Load checked state (guard against non-array stored values)
    const checkedRaw = localStorage.getItem(`rotina-checked-${dayKey}`);
    if (checkedRaw) {
      try {
        const parsed = JSON.parse(checkedRaw);
        setChecked(new Set(Array.isArray(parsed) ? parsed : Object.keys(parsed).filter((k) => parsed[k])));
      } catch { /* ignore */ }
    }

    // Load water
    const savedWater = localStorage.getItem(`agua-${dateStr}`);
    if (savedWater !== null) setWaterGlasses(parseInt(savedWater, 10));
    else setWaterGlasses(WATER_GLASSES.current);

    // Compute date-dependent vestibular data client-side only
    const sorted = [...VESTIBULARES].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    setNextVest(sorted[0]);
    const counts: Record<string, number> = {};
    VESTIBULARES.forEach((v) => { counts[v.id] = daysUntil(v.date); });
    setVestCountdowns(counts);
  }, []);

  const toggleHabit = (id: string) => {
    const dayKey = getTodayKey();
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`rotina-checked-${dayKey}`, JSON.stringify([...next]));
      return next;
    });
  };

  const addWaterGlass = () => {
    setWaterGlasses((prev) => {
      const next = prev + 1;
      localStorage.setItem(`agua-${getTodayDate()}`, String(next));
      return next;
    });
  };

  const allItems = [
    ...todayHabits.map((h) => ({ id: h.id, name: h.name, time: h.time, category: h.category })),
    ...extraTasks,
  ].sort((a, b) => a.time.localeCompare(b.time));

  const topSubjects = [...SUBJECTS].sort((a, b) => b.questions - a.questions).slice(0, 6);
  const doneCount = allItems.filter((a) => checked.has(a.id)).length;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Horas esta semana" value={formatHours(totals.hoursWeek)} icon={<Clock size={18} />} accent="var(--primary)" trend={12} hint="Meta: 40h" />
        <StatCard index={1} label="Taxa de acerto" value={`${totals.accuracy}%`} icon={<Target size={18} />} accent="var(--success)" trend={4} hint={`${totals.totalCorrect}/${totals.totalQuestions} questões`} />
        <StatCard index={2} label="Revisões pendentes" value={totals.pendingRevisions} icon={<RefreshCw size={18} />} accent="var(--warning)" hint="Hoje" />
        <StatCard index={3} label="Saldo do mês" value={formatCurrency(totals.balance)} icon={<Wallet size={18} />} accent="var(--accent)" trend={-8} hint={`+${formatCurrency(totals.income)} / -${formatCurrency(totals.expenses)}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle action={<Badge color="var(--primary)">Últimos 7 dias</Badge>}>
              Evolução de estudo
            </SectionTitle>
            <StudyAreaChart />
          </Card>

          <Card>
            <SectionTitle
              action={
                <Link href="/rotina" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Ver rotina <ChevronRight size={14} />
                </Link>
              }
            >
              Rotina de hoje · {doneCount}/{allItems.length}
            </SectionTitle>
            <div className="space-y-2">
              {allItems.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted">Nenhuma tarefa para hoje</p>
              )}
              {allItems.map((a) => {
                const done = checked.has(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleHabit(a.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] transition-colors ${
                        done ? "border-success bg-success text-white" : "border-border-strong text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <span className="w-12 shrink-0 text-xs font-semibold text-text-muted">{a.time}</span>
                    <span className={`flex-1 text-sm ${done ? "text-text-muted line-through" : "font-medium"}`}>
                      {a.name}
                    </span>
                    <Badge color="var(--c-lilac)">{a.category}</Badge>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle
              action={
                <Link href="/estudos" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Ver estudos <ChevronRight size={14} />
                </Link>
              }
            >
              Acerto por matéria
            </SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topSubjects.map((s) => {
                const acc = pct(s.correct, s.questions);
                return (
                  <div key={s.key} className="rounded-xl border border-border bg-surface-2/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{acc}%</span>
                    </div>
                    <ProgressBar value={acc} color={s.color} />
                    <p className="mt-1.5 text-[11px] text-text-muted">{s.correct}/{s.questions} · {fh(s.hours)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          <Card glow>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-warning to-danger text-white">
                <Flame size={30} />
              </div>
              <div>
                <p className="text-3xl font-extrabold leading-none">{STUDY_STREAK}</p>
                <p className="text-sm text-text-secondary">dias de estudo seguidos</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-muted">Continue! Você está a 7 dias do seu recorde 🔥</p>
          </Card>

          <Card>
            <SectionTitle>Próximo vestibular</SectionTitle>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-secondary-soft text-secondary">
                <CalendarClock size={28} />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{vestCountdowns[nextVest.id] ?? "—"} dias</p>
                <p className="text-sm font-semibold">{nextVest.name}</p>
                <p className="text-xs text-text-muted" suppressHydrationWarning>
                  {new Date(nextVest.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {VESTIBULARES.slice(1).map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{v.name}</span>
                  <span className="font-semibold text-text-muted">{vestCountdowns[v.id] ?? "—"}d</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle action={<Badge color="var(--warning)">{REVISIONS.filter((r) => r.due).length} hoje</Badge>}>
              Revisões
            </SectionTitle>
            <div className="space-y-2">
              {REVISIONS.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-surface-2/40 px-3 py-2">
                  <span className={`h-2 w-2 rounded-full ${r.due ? "bg-warning" : "bg-border-strong"}`} />
                  <span className="flex-1 text-sm">{r.content}</span>
                  <Badge color={r.type === "Anki" ? "var(--accent)" : "var(--secondary)"}>{r.type}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle
              action={<Link href="/metas" className="text-xs font-semibold text-primary hover:underline">Ver metas</Link>}
            >
              Metas do mês
            </SectionTitle>
            <div className="space-y-3">
              {GOALS.slice(0, 3).map((g) => (
                <div key={g.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-text-muted">{pct(g.current, g.target)}%</span>
                  </div>
                  <ProgressBar value={pct(g.current, g.target)} color="var(--secondary)" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProgressRing
                  value={pct(waterGlasses, WATER_GLASSES.target)}
                  color="var(--c-blue)"
                  size={56}
                  label={`${waterGlasses}/${WATER_GLASSES.target}`}
                />
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    <Droplets size={15} className="text-c-blue" /> Hidratação
                  </p>
                  <p className="text-xs text-text-muted">{Math.max(0, WATER_GLASSES.target - waterGlasses)} copos restantes</p>
                </div>
              </div>
              <button
                onClick={addWaterGlass}
                className="rounded-xl bg-c-blue/15 px-3 py-2 text-sm font-bold text-c-blue transition-colors hover:bg-c-blue/25"
              >
                + Copo
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
