"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, Sparkles, Zap } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "💧 +1 copo d'água", cmd: "adicionar 1 copo de água" },
  { label: "🍽️ Registrar refeição", cmd: "registrar refeição" },
  { label: "✅ Check hábito", cmd: "marcar hábito como concluído" },
  { label: "💰 Nova transação", cmd: "registrar transação financeira" },
  { label: "📝 Anotação rápida", cmd: "criar anotação" },
  { label: "📚 Tempo de estudo", cmd: "registrar bloco de estudo" },
  { label: "💪 Treino feito", cmd: "marcar treino como concluído" },
  { label: "📊 Ver métricas", cmd: "abrir métricas do dia" },
];

type Message = { role: "user" | "ai"; content: string };

function mockAIResponse(cmd: string): string {
  const c = cmd.toLowerCase();
  if (c.includes("água") || c.includes("copo")) return "💧 Adicionado 1 copo! Você está em 6/8 copos hoje. Faltam apenas 2 para bater a meta!";
  if (c.includes("refeição") || c.includes("almoco") || c.includes("jantar") || c.includes("cafe")) return "🍽️ Qual refeição? (café da manhã / almoço / lanche / jantar) — e o que você comeu? Pode descrever brevemente.";
  if (c.includes("hábito") || c.includes("habito")) return "✅ Qual hábito você quer marcar? (ex: oração, skincare, academia, anki)";
  if (c.includes("transação") || c.includes("gastei") || c.includes("recebi") || c.includes("paguei")) {
    return "💰 Entendido! Me diga: descrição, valor e tipo (receita / gasto fixo / variável / reserva). Ex: 'Mercado, R$85, variável'";
  }
  if (c.includes("anotação") || c.includes("lembrar") || c.includes("nota")) return "📝 Anotação salva! Também posso adicionar ao módulo de Metas ou Rotina — quer que eu vincule a algum lugar específico?";
  if (c.includes("estudo") || c.includes("estudei") || c.includes("bloco")) return "📚 Ótimo! Quantas horas e qual matéria? Vou registrar no seu histórico de estudos e atualizar as métricas.";
  if (c.includes("treino") || c.includes("academia") || c.includes("exercício")) return "💪 Treino registrado! Qual foi o treino hoje? (A / B / C / D) — vou marcar na Academia e atualizar sua streak.";
  if (c.includes("métrica") || c.includes("progresso") || c.includes("como estou")) return "📊 Hoje: 5h23 de estudo, 6/8 copos d'água, 4/7 hábitos concluídos. Sua meta mensal de questões está em 85%. Continue assim! 🔥";
  return `🤖 Entendido! "${cmd}" — vou processar isso. Em breve a integração real com Claude API vai executar essa ação diretamente no sistema.`;
}

export function AIFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: mockAIResponse(msg) }]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-4 z-50 w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-lg)]"
            style={{ background: "var(--bg-elevated)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4" style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--primary)", color: "var(--primary-fg)" }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">Assistente IA</p>
                  <p className="text-xs text-text-muted">O que você quer fazer?</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl border border-border text-text-muted transition-colors hover:text-text">
                <X size={16} />
              </button>
            </div>

            {/* Quick actions */}
            {messages.length === 0 && (
              <div className="border-b border-border p-4">
                <p className="mb-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Ações rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.cmd}
                      onClick={() => send(a.cmd)}
                      className="rounded-xl border border-border bg-surface-2/60 px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/50 hover:bg-surface-hover"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm"
                      style={
                        m.role === "user"
                          ? { background: "var(--primary)", color: "var(--primary-fg)" }
                          : { background: "var(--surface-2)", color: "var(--text)" }
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce delay-0">·</span>
                        <span className="animate-bounce delay-100">·</span>
                        <span className="animate-bounce delay-200">·</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Digite um comando ou pergunta..."
                rows={1}
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                style={{ overflowY: "auto" }}
              />
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-text-muted transition-colors hover:text-text"
                title="Voz (em breve)"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--primary)" }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-5 z-50 grid h-14 w-14 place-items-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all"
        style={{
          background: open ? "var(--danger)" : "var(--primary)",
          color: open ? "#fff" : "var(--primary-fg)",
          boxShadow: open ? "0 8px 32px rgba(239,68,68,0.4)" : "0 8px 32px rgba(163,230,53,0.45)",
        }}
        aria-label="Assistente IA"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="z" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Zap size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
