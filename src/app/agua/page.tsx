"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Trophy, TrendingUp, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { WATER_HISTORY } from "@/lib/data";
import { pct } from "@/lib/utils";
import { todayLocalISO } from "@/lib/date-utils";

const GOAL = 8;
const TIPS = [
  "Beba um copo ao acordar — acelera o metabolismo.",
  "Água melhora a cognição: hidratação é combustível mental.",
  "Um copo antes de cada refeição facilita a digestão.",
  "Sinal de sede = já está desidratada. Não espere!",
  "Água de coco hidrata e repõe eletrólitos após treino.",
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getTodayDate() {
  return todayLocalISO();
}

function getGlassesForDate(date: string): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(`agua-${date}`);
  return saved !== null ? parseInt(saved, 10) : 0;
}

export default function AguaPage() {
  const [glasses, setGlasses] = useState(0);
  const [history, setHistory] = useState(WATER_HISTORY);

  // Load today's glasses from localStorage on mount
  useEffect(() => {
    const today = getTodayDate();
    setGlasses(getGlassesForDate(today));

    // Load history: override each day's glasses with localStorage if available
    const updatedHistory = WATER_HISTORY.map((d) => {
      const saved = localStorage.getItem(`agua-${d.date}`);
      return saved !== null ? { ...d, glasses: parseInt(saved, 10) } : d;
    });
    setHistory(updatedHistory);
  }, []);

  // Save glasses to localStorage whenever it changes
  useEffect(() => {
    const today = getTodayDate();
    localStorage.setItem(`agua-${today}`, String(glasses));
    // Update today's entry in history
    setHistory((prev) =>
      prev.map((d) => (d.date === today ? { ...d, glasses } : d))
    );
  }, [glasses]);

  const add = () => setGlasses((g) => Math.min(g + 1, 16));
  const remove = () => setGlasses((g) => Math.max(g - 1, 0));

  const streak = history.filter((d) => d.glasses >= d.goal).length;
  const avg = Math.round(history.reduce((a, b) => a + b.glasses, 0) / history.length);
  const todayPct = pct(glasses, GOAL);

  const message =
    glasses === 0 ? "Hora de começar! 💧"
    : glasses < 3 ? "Só no começo... beba mais!"
    : glasses < GOAL ? `${GOAL - glasses} copo${GOAL - glasses > 1 ? "s" : ""} para a meta!`
    : glasses === GOAL ? "Meta batida! Parabéns 🎉"
    : "Superou a meta! Incrível! 🏆";

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Ingestão de Água"
        subtitle="Hidratação é essencial para a cognição"
        icon={<Droplets size={24} />}
        accent="var(--c-blue)"
        action={<Badge color="var(--c-blue)">{glasses}/{GOAL} copos hoje</Badge>}
      />

      {/* Hero tracker */}
      <Card glow>
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative flex items-center justify-center">
            <ProgressRing value={todayPct} size={160} stroke={12} color="var(--c-blue)" />
            <div className="absolute flex flex-col items-center">
              <Droplets size={32} style={{ color: "var(--c-blue)" }} />
              <p className="mt-1 text-3xl font-extrabold" style={{ color: "var(--c-blue)" }}>{glasses}</p>
              <p className="text-xs text-text-muted">de {GOAL} copos</p>
            </div>
          </div>

          <p className="text-sm font-medium text-text-secondary">{message}</p>

          <div className="flex items-center gap-4">
            <button
              onClick={remove}
              className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-surface-2 text-text-secondary transition-all hover:border-border-strong hover:text-text active:scale-95"
            >
              <Minus size={20} />
            </button>

            <div className="flex flex-wrap justify-center gap-2 px-2" style={{ maxWidth: 300 }}>
              {Array.from({ length: GOAL }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setGlasses(i < glasses ? i : i + 1)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-2xl transition-all"
                  title={`${i + 1} copos`}
                >
                  <AnimatePresence mode="wait">
                    {i < glasses ? (
                      <motion.span
                        key="full"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                      >
                        🥤
                      </motion.span>
                    ) : (
                      <motion.span
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                      >
                        🥤
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>

            <button
              onClick={add}
              className="grid h-12 w-12 place-items-center rounded-2xl text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--c-blue)" }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--c-amber) 14%, transparent)", color: "var(--c-amber)" }}>
              <Trophy size={20} />
            </span>
            <div>
              <p className="text-xl font-extrabold">{streak}/7</p>
              <p className="text-xs text-text-muted">dias na meta</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--c-blue) 14%, transparent)", color: "var(--c-blue)" }}>
              <TrendingUp size={20} />
            </span>
            <div>
              <p className="text-xl font-extrabold">{avg}</p>
              <p className="text-xs text-text-muted">média semanal</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--c-green) 14%, transparent)", color: "var(--c-green)" }}>
              <Target size={20} />
            </span>
            <div>
              <p className="text-xl font-extrabold">{GOAL}</p>
              <p className="text-xs text-text-muted">meta diária</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Histórico visual */}
        <Card>
          <SectionTitle>Histórico — 7 dias</SectionTitle>
          <div className="mt-4 flex items-end justify-between gap-2" style={{ height: 100 }}>
            {history.map((d, i) => {
              const h = d.date === getTodayDate() ? glasses : d.glasses;
              const hit = h >= d.goal;
              const barH = Math.max(8, Math.round((h / 10) * 80));
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <p className="text-xs font-bold" style={{ color: hit ? "var(--c-blue)" : "var(--text-muted)" }}>{h}</p>
                  <div className="flex w-full flex-col justify-end" style={{ height: 68 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: barH }}
                      transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-lg"
                      style={{ background: hit ? "var(--c-blue)" : "color-mix(in srgb, var(--c-blue) 30%, transparent)" }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted">{DAY_LABELS[i]}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Dicas */}
        <Card>
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Droplets size={16} style={{ color: "var(--c-blue)" }} /> Dicas
            </span>
          </SectionTitle>
          <div className="mt-3 space-y-2">
            {TIPS.map((tip, i) => (
              <motion.div
                key={tip}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5 text-sm"
              >
                <span>💧</span>
                <span>{tip}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
