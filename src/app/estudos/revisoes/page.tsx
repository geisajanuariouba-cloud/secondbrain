"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ChevronLeft, Check, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { REVISIONS, SUBJECTS } from "@/lib/data";

type RevisionLocal = {
  id: string;
  content: string;
  subject: string;
  date: string;
  type: "TAB" | "Anki";
  done: boolean;
  completedAt?: string;
};

// Mapeia REVISIONS (due=true significa pendente, logo done = !due)
const REVISIONS_INITIAL: RevisionLocal[] = REVISIONS.map((r) => ({
  ...r,
  done: !r.due,
}));

export default function RevisoesPage() {
  const [revisions, setRevisions] = useState<RevisionLocal[]>(REVISIONS_INITIAL);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "agendadas">("pendentes");

  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem("revisoes-data");
    if (saved) setRevisions(JSON.parse(saved));
  }, []);

  // Salvar ao mudar
  useEffect(() => {
    localStorage.setItem("revisoes-data", JSON.stringify(revisions));
  }, [revisions]);

  const toggleDone = (id: string) =>
    setRevisions((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, done: !r.done, completedAt: !r.done ? new Date().toISOString() : undefined }
          : r
      )
    );

  const filtered = filter === "pendentes"
    ? revisions.filter((r) => !r.done)
    : filter === "agendadas"
    ? revisions.filter((r) => r.done)
    : revisions;

  const pendingCount = revisions.filter((r) => !r.done).length;

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        title="Revisões"
        subtitle="TAB · Anki · Spaced Repetition"
        icon={<RefreshCw size={24} />}
        accent="var(--warning)"
        action={
          <Link href="/estudos" className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted hover:text-text">
            <ChevronLeft size={18} />
          </Link>
        }
      />

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pendentes hoje", value: pendingCount, color: "var(--warning)" },
          { label: "Concluídas", value: revisions.filter((r) => r.done).length, color: "var(--success)" },
          { label: "Total", value: revisions.length, color: "var(--text-secondary)" },
        ].map((k) => (
          <Card key={k.label}>
            <p className="text-xs text-text-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: k.color }}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-1 rounded-2xl border border-border bg-surface-2/40 p-1">
        {(["pendentes", "agendadas", "todas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="relative flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-all"
            style={{ color: filter === f ? "var(--primary-fg)" : "var(--text-muted)" }}
          >
            {filter === f && (
              <motion.span layoutId="rev-tab" className="absolute inset-0 rounded-xl" style={{ background: "var(--primary)" }} />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            {filter === "pendentes" && <><Clock size={14} style={{ color: "var(--warning)" }} /> Para revisar hoje</>}
            {filter === "agendadas" && <><RefreshCw size={14} style={{ color: "var(--c-blue)" }} /> Próximas revisões</>}
            {filter === "todas" && <><Zap size={14} style={{ color: "var(--primary)" }} /> Todas as revisões</>}
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-2">
          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 text-sm font-semibold">Nenhuma revisão pendente!</p>
              <p className="text-xs text-text-muted">Você está em dia.</p>
            </div>
          )}
          {filtered.map((r) => {
            const subject = SUBJECTS.find((s) => s.key === r.subject);
            return (
              <motion.div key={r.id} layout className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 transition-colors hover:bg-surface-hover">
                <button
                  onClick={() => toggleDone(r.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-all"
                  style={{
                    borderColor: r.done ? "var(--success)" : "var(--border-strong)",
                    background: r.done ? "var(--success)" : "transparent",
                    color: "#fff",
                  }}
                >
                  {r.done && <Check size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${r.done ? "line-through text-text-muted" : ""}`}>{r.content}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {subject && <span className="text-xs font-semibold" style={{ color: subject.color }}>{subject.name}</span>}
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-muted">{new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    {r.done && r.completedAt && (
                      <>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs" style={{ color: "var(--success)" }}>
                          Concluída em {new Date(r.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge color={r.type === "Anki" ? "var(--c-blue)" : "var(--c-amber)"}>{r.type}</Badge>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Integração Anki */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: "color-mix(in srgb, var(--c-blue) 15%, transparent)" }}>
            🃏
          </div>
          <div className="flex-1">
            <p className="font-bold">Anki</p>
            <p className="text-xs text-text-muted">Integração com Anki configurável em Configurações</p>
          </div>
          <Link href="/configuracoes" className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover">
            Configurar
          </Link>
        </div>
      </Card>
    </div>
  );
}
