"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Target, RefreshCw, Wallet, Flame, ChevronRight, Droplets, CalendarClock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { StudyAreaChart } from "@/components/charts/study-area-chart";
import {
  totals, ACTIVITIES, REVISIONS, SUBJECTS, GOALS, VESTIBULARES,
  STUDY_STREAK, WATER_GLASSES, daysUntil,
} from "@/lib/data";
import { formatCurrency, formatHours, formatHours as fh, pct } from "@/lib/utils";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [waterGlasses, setWaterGlasses] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`agua-${getTodayDate()}`);
    if (saved !== null) setWaterGlasses(parseInt(saved, 10));
    else setWaterGlasses(WATER_GLASSES.current);
  }, []);

  const addWaterGlass = () => {
    setWaterGlasses((prev) => {
      const next = prev + 1;
      localStorage.setItem(`agua-${getTodayDate()}`, String(next));
      return next;
    });
  };
  const nextVest = [...VESTIBULARES].sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0];
  const topSubjects = [...SUBJECTS].sort((a, b) => b.questions - a.questions).slice(0, 6);
  const todayActivities = ACTIVITIES;
  const doneCount = todayActivities.filter((a) => a.done).length;

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
              Rotina de hoje · {doneCount}/{todayActivities.length}
            </SectionTitle>
            <div className="space-y-2">
              {todayActivities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 transition-colors hover:bg-surface-hover"
                >
                  <div
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] ${
                      a.done ? "border-success bg-success text-white" : "border-border-strong text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                  <span className="w-12 shrink-0 text-xs font-semibold text-text-muted">{a.time}</span>
                  <span className={`flex-1 text-sm ${a.done ? "text-text-muted line-through" : "font-medium"}`}>
                    {a.name}
                  </span>
                  <Badge color="var(--c-lilac)">{a.category}</Badge>
                </div>
              ))}
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
                <p className="text-2xl font-extrabold">{daysUntil(nextVest.date)} dias</p>
                <p className="text-sm font-semibold">{nextVest.name}</p>
                <p className="text-xs text-text-muted">
                  {new Date(nextVest.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {VESTIBULARES.slice(1).map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{v.name}</span>
                  <span className="font-semibold text-text-muted">{daysUntil(v.date)}d</span>
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
