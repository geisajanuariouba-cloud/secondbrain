"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Plus, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { CONSULTATION_SESSIONS, type ConsultationSession } from "@/lib/data";

type Persona = ConsultationSession["persona"];

const PERSONAS: { id: Persona; emoji: string; name: string; subtitle: string; color: string; systemPrompt: string }[] = [
  {
    id: "Psicólogo", emoji: "🧠", name: "Psicóloga", subtitle: "Saúde mental e bem-estar emocional",
    color: "var(--c-lilac)",
    systemPrompt: "Você é uma psicóloga empática especializada em adolescentes. Foco em manejo de ansiedade, estresse de vestibular e equilíbrio emocional.",
  },
  {
    id: "Nutricionista", emoji: "🥗", name: "Nutricionista", subtitle: "Dieta, energia e alimentação",
    color: "var(--c-green)",
    systemPrompt: "Você é uma nutricionista especializada em desempenho cognitivo. Ajuda a otimizar alimentação para estudo e disposição.",
  },
  {
    id: "Personal", emoji: "💪", name: "Personal Trainer", subtitle: "Treinos, corpo e desempenho",
    color: "var(--c-rose)",
    systemPrompt: "Você é uma personal trainer. Especialidade em treinos para ganho de massa, correria de vestibulanda e recuperação.",
  },
  {
    id: "Dermatologista", emoji: "✨", name: "Dermatologista", subtitle: "Pele, acne e cuidados",
    color: "var(--c-amber)",
    systemPrompt: "Você é uma dermatologista. Foco em pele oleosa, acne, rotina skincare e produtos adequados.",
  },
  {
    id: "Mentor de Estudos", emoji: "📚", name: "Pedro Assaad (IA)", subtitle: "Estratégia de estudos para medicina",
    color: "var(--secondary)",
    systemPrompt: "Você é o Pedro Assaad, mentor de estudos para medicina. Especialidade em conteúdo programático, gestão de tempo e estratégia para vestibulares de medicina.",
  },
];


type Message = { role: "user" | "ai"; content: string; time: string };

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function loadHistory(personaId: Persona): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`consultas-${personaId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(personaId: Persona, messages: Message[]) {
  try {
    localStorage.setItem(`consultas-${personaId}`, JSON.stringify(messages));
  } catch {
    // ignore quota errors
  }
}

const EMPTY_SESSIONS: Record<Persona, Message[]> = {
  "Psicólogo": [],
  "Nutricionista": [],
  "Personal": [],
  "Dermatologista": [],
  "Mentor de Estudos": [],
};

export default function ConsultasPage() {
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [sessions, setSessions] = useState<Record<Persona, Message[]>>(EMPTY_SESSIONS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const persona = PERSONAS.find((p) => p.id === activePersona);
  const messages = activePersona ? sessions[activePersona] : [];

  // Load history from localStorage when selecting a persona
  const handleSelectPersona = (id: Persona) => {
    setSessions((prev) => ({
      ...prev,
      [id]: loadHistory(id),
    }));
    setActivePersona(id);
  };

  useEffect(() => {
    if (activePersona) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activePersona]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || !activePersona || !persona) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg, time: getTime() };
    const updatedWithUser = [...sessions[activePersona], userMsg];
    setSessions((prev) => ({ ...prev, [activePersona]: updatedWithUser }));
    setLoading(true);

    try {
      // Convert to API format (role: "user" | "assistant")
      const apiMessages = updatedWithUser.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, systemPrompt: persona.systemPrompt }),
      });

      const data = await res.json();
      const aiText: string = res.ok
        ? (data.text ?? "Não consegui processar.")
        : (data.error ?? "Erro ao conectar com a IA.");

      const aiMsg: Message = { role: "ai", content: aiText, time: getTime() };
      const updatedWithAi = [...updatedWithUser, aiMsg];
      setSessions((prev) => ({ ...prev, [activePersona]: updatedWithAi }));
      saveHistory(activePersona, updatedWithAi);
    } catch {
      const errMsg: Message = { role: "ai", content: "Erro de conexão. Tente novamente.", time: getTime() };
      const updatedWithErr = [...updatedWithUser, errMsg];
      setSessions((prev) => ({ ...prev, [activePersona]: updatedWithErr }));
      saveHistory(activePersona, updatedWithErr);
    } finally {
      setLoading(false);
    }
  };

  if (activePersona && persona) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col" style={{ height: "calc(100vh - 120px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={() => setActivePersona(null)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted transition-colors hover:text-text"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${persona.color} 15%, transparent)` }}>
            {persona.emoji}
          </div>
          <div>
            <p className="font-bold">{persona.name}</p>
            <p className="text-xs text-text-muted">{persona.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-muted">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl text-3xl" style={{ background: `color-mix(in srgb, ${persona.color} 15%, transparent)` }}>
                {persona.emoji}
              </div>
              <p className="font-bold">{persona.name}</p>
              <p className="text-sm text-text-muted">{persona.subtitle}</p>
              <p className="mt-4 text-xs text-text-muted">Inicie uma conversa abaixo.</p>
            </motion.div>
          )}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {m.role === "ai" && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm" style={{ background: `color-mix(in srgb, ${persona.color} 15%, transparent)` }}>
                  {persona.emoji}
                </div>
              )}
              <div>
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                  style={
                    m.role === "user"
                      ? { background: "var(--primary)", color: "var(--primary-fg)" }
                      : { background: "var(--surface-2)", color: "var(--text)" }
                  }
                >
                  {m.content}
                </div>
                <p className="mt-1 text-[10px] text-text-muted">{m.time}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full text-sm" style={{ background: `color-mix(in srgb, ${persona.color} 15%, transparent)` }}>
                {persona.emoji}
              </div>
              <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                </span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-border pt-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Pergunte para ${persona.name}...`}
            rows={1}
            className="max-h-24 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--primary)" }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Consultas IA"
        subtitle="Seus especialistas pessoais"
        icon={<Bot size={24} />}
        accent="var(--secondary)"
      />

      {/* Personas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONAS.map((p) => {
          const sessionMsgs = sessions[p.id];
          const lastMsg = sessionMsgs[sessionMsgs.length - 1];
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPersona(p.id)}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-surface-2/40 p-5 text-left transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)` }}>
                  {p.emoji}
                </div>
                <div>
                  <p className="font-extrabold">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.subtitle}</p>
                </div>
              </div>
              {lastMsg ? (
                <div className="rounded-xl border border-border bg-surface-2/50 px-3 py-2">
                  <p className="line-clamp-2 text-xs text-text-secondary">{lastMsg.content}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs text-text-muted">Iniciar conversa</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Histórico salvo */}
      {CONSULTATION_SESSIONS.length > 0 && (
        <Card>
          <SectionTitle>Conversas recentes</SectionTitle>
          <div className="mt-3 space-y-2">
            {CONSULTATION_SESSIONS.map((cs) => {
              const persona = PERSONAS.find((p) => p.id === cs.persona);
              return (
                <button
                  key={cs.id}
                  onClick={() => handleSelectPersona(cs.persona)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base" style={{ background: persona ? `color-mix(in srgb, ${persona.color} 15%, transparent)` : "var(--surface-2)" }}>
                    {persona?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{cs.title}</p>
                    <p className="text-xs text-text-muted">{cs.persona} · {new Date(cs.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge color={persona?.color ?? "var(--text-muted)"}>{cs.messages.length} msgs</Badge>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
