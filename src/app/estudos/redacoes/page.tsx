"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Plus, Star, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";

type Redacao = {
  id: string;
  tema: string;
  vestibular: string;
  date: string;
  nota: number; // 0-1000
  criterios: { comp: number; estrutura: number; coesao: number; argumentacao: number; proposta: number };
  pontos_fortes: string[];
  pontos_melhora: string[];
  texto?: string;
};

const REDACOES_MOCK: Redacao[] = [
  {
    id: "re1",
    tema: "Desafios para o combate da desinformação no Brasil",
    vestibular: "ENEM",
    date: "2026-06-20",
    nota: 840,
    criterios: { comp: 180, estrutura: 160, coesao: 160, argumentacao: 180, proposta: 160 },
    pontos_fortes: ["Proposta de intervenção detalhada", "Boa diversidade de repertório", "Coesão textual adequada"],
    pontos_melhora: ["Desenvolver mais o 3º parágrafo", "Repertório mais específico", "Conectivos mais variados"],
  },
  {
    id: "re2",
    tema: "O estigma associado às doenças mentais na sociedade brasileira",
    vestibular: "ENEM",
    date: "2026-06-08",
    nota: 760,
    criterios: { comp: 160, estrutura: 140, coesao: 140, argumentacao: 160, proposta: 160 },
    pontos_fortes: ["Tema bem desenvolvido", "Introdução com tese clara"],
    pontos_melhora: ["Estrutura fraca no parágrafo 2", "Falta agente na proposta", "Conclusão curta"],
  },
  {
    id: "re3",
    tema: "Impactos da ausência de saneamento básico na população brasileira",
    vestibular: "FUVEST",
    date: "2026-05-25",
    nota: 880,
    criterios: { comp: 200, estrutura: 180, coesao: 160, argumentacao: 180, proposta: 160 },
    pontos_fortes: ["Argumentação muito sólida", "Repertório científico forte", "Domínio da língua culta excelente"],
    pontos_melhora: ["Proposta de intervenção pode ser mais detalhada"],
  },
];

const COMP_LABELS = ["Comp. da proposta", "Estrutura", "Coesão", "Argumentação", "Proposta de intervenção"];

function notaColor(n: number) {
  if (n >= 900) return "var(--success)";
  if (n >= 700) return "var(--primary)";
  if (n >= 500) return "var(--c-amber)";
  return "var(--danger)";
}

export default function RedacoesPage() {
  const [redacoes, setRedacoes] = useState<Redacao[]>(REDACOES_MOCK);
  const [selected, setSelected] = useState<Redacao | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTema, setNewTema] = useState("");
  const [newVestibular, setNewVestibular] = useState("ENEM");
  const [newNota, setNewNota] = useState("");
  const [newPontosFortes, setNewPontosFortes] = useState("");
  const [newPontosMelhora, setNewPontosMelhora] = useState("");

  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem("redacoes-data");
    if (saved) setRedacoes(JSON.parse(saved));
  }, []);

  // Salvar ao mudar
  useEffect(() => {
    localStorage.setItem("redacoes-data", JSON.stringify(redacoes));
  }, [redacoes]);

  const avg = redacoes.length ? Math.round(redacoes.reduce((s, r) => s + r.nota, 0) / redacoes.length) : 0;
  const best = redacoes.length ? Math.max(...redacoes.map((r) => r.nota)) : 0;

  const addRedacao = () => {
    if (!newTema || !newNota) return;
    const nota = parseInt(newNota);
    const per = Math.round(nota / 5);
    setRedacoes((prev) => [
      {
        id: `re${Date.now()}`,
        tema: newTema,
        vestibular: newVestibular,
        date: new Date().toISOString().slice(0, 10),
        nota,
        criterios: { comp: per, estrutura: per, coesao: per, argumentacao: per, proposta: per },
        pontos_fortes: newPontosFortes ? newPontosFortes.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        pontos_melhora: newPontosMelhora ? newPontosMelhora.split("\n").map((s) => s.trim()).filter(Boolean) : [],
      },
      ...prev,
    ]);
    setNewTema(""); setNewNota(""); setNewPontosFortes(""); setNewPontosMelhora(""); setShowForm(false);
  };

  if (selected) {
    const compVals = [selected.criterios.comp, selected.criterios.estrutura, selected.criterios.coesao, selected.criterios.argumentacao, selected.criterios.proposta];
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted hover:text-text">
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-text-muted">{selected.vestibular} · {new Date(selected.date).toLocaleDateString("pt-BR")}</p>
            <p className="font-extrabold leading-tight">{selected.tema}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-extrabold tabular-nums" style={{ color: notaColor(selected.nota) }}>{selected.nota}</p>
            <p className="text-xs text-text-muted">/ 1000</p>
          </div>
        </div>

        <Card>
          <SectionTitle>Competências</SectionTitle>
          <div className="mt-3 space-y-3">
            {COMP_LABELS.map((label, i) => {
              const val = compVals[i];
              const pct = (val / 200) * 100;
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold">{label}</span>
                    <span className="font-bold tabular-nums" style={{ color: notaColor(val * 5) }}>{val}/200</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ background: notaColor(val * 5) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <SectionTitle><span className="text-success">✓ Pontos fortes</span></SectionTitle>
            <ul className="mt-2 space-y-1.5">
              {selected.pontos_fortes.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--success)" }} />
                  {p}
                </li>
              ))}
              {selected.pontos_fortes.length === 0 && <li className="text-sm text-text-muted">Nenhum registrado.</li>}
            </ul>
          </Card>
          <Card>
            <SectionTitle><span style={{ color: "var(--c-amber)" }}>↑ Melhorar</span></SectionTitle>
            <ul className="mt-2 space-y-1.5">
              {selected.pontos_melhora.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--c-amber)" }} />
                  {p}
                </li>
              ))}
              {selected.pontos_melhora.length === 0 && <li className="text-sm text-text-muted">Nenhum registrado.</li>}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        title="Redações"
        subtitle="Histórico e evolução"
        icon={<ClipboardList size={24} />}
        accent="var(--c-blue)"
        action={
          <div className="flex items-center gap-2">
            <Link href="/estudos" className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted hover:text-text">
              <ChevronLeft size={18} />
            </Link>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
              <Plus size={15} /> Nova redação
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total escritas", value: redacoes.length, color: "var(--c-blue)" },
          { label: "Média", value: avg, color: notaColor(avg) },
          { label: "Melhor nota", value: best, color: notaColor(best) },
        ].map((k) => (
          <Card key={k.label}>
            <p className="text-xs text-text-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: k.color }}>{k.value}{k.label !== "Total escritas" ? "/1000" : ""}</p>
          </Card>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-border bg-surface-2/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Nova redação</p>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-text-muted" /></button>
            </div>
            <div className="space-y-3">
              <input value={newTema} onChange={(e) => setNewTema(e.target.value)} placeholder="Tema da redação" className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newVestibular} onChange={(e) => setNewVestibular(e.target.value)} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none">
                  {["ENEM", "FUVEST", "UNICAMP", "PISM", "Einstein", "FAMERP", "Simulado"].map((v) => <option key={v}>{v}</option>)}
                </select>
                <input type="number" min={0} max={1000} value={newNota} onChange={(e) => setNewNota(e.target.value)} placeholder="Nota (0–1000)" className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              </div>
              <textarea value={newPontosFortes} onChange={(e) => setNewPontosFortes(e.target.value)} placeholder="Pontos fortes (um por linha)" rows={3} className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              <textarea value={newPontosMelhora} onChange={(e) => setNewPontosMelhora(e.target.value)} placeholder="Pontos a melhorar (um por linha)" rows={3} className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              <button onClick={addRedacao} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>Salvar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <Card>
        <SectionTitle>Histórico</SectionTitle>
        <div className="mt-3 space-y-2">
          {redacoes.map((r) => (
            <button key={r.id} onClick={() => setSelected(r)} className="flex w-full items-center gap-4 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-surface-hover">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{r.tema}</p>
                <p className="text-xs text-text-muted">{r.vestibular} · {new Date(r.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-extrabold tabular-nums" style={{ color: notaColor(r.nota) }}>{r.nota}</p>
                <p className="text-[10px] text-text-muted">/ 1000</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
