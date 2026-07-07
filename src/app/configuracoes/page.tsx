"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Sun, Moon, Bell, User, Database, Palette, Check,
  Zap, Mail, MessageCircle, Plus, Trash2, ChevronRight,
  Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2,
  Tag, ArrowRight, Phone, Edit3, Save, X, BookOpen, Loader2,
  ExternalLink, Copy, Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";

type Tab = "geral" | "notificacoes" | "automacoes" | "dados";

type IntegrationStatus = {
  gmail: boolean;
  gmailConnected: boolean;
  claude: boolean;
  whatsapp: boolean;
  anki: boolean;
  kindle: boolean;
};

const FINANCIAL_CATEGORIES = [
  { id: 1, name: "Alimentação", emoji: "🍽️", color: "var(--c-green)" },
  { id: 2, name: "Estudos", emoji: "📚", color: "var(--secondary)" },
  { id: 3, name: "Saúde & Beleza", emoji: "💆‍♀️", color: "var(--c-lilac)" },
  { id: 4, name: "Academia", emoji: "💪", color: "var(--c-rose)" },
  { id: 5, name: "Transporte", emoji: "🚗", color: "var(--c-blue)" },
  { id: 6, name: "Lazer & Compras", emoji: "🛍️", color: "var(--c-amber)" },
  { id: 7, name: "Assinaturas", emoji: "📱", color: "var(--accent)" },
  { id: 8, name: "Salão / Trabalho", emoji: "✂️", color: "var(--c-pink)" },
  { id: 9, name: "Poupança / Reserva", emoji: "🏦", color: "var(--success)" },
  { id: 10, name: "Outros", emoji: "📌", color: "var(--text-muted)" },
];

const DEFAULT_BANK_PATTERNS = [
  { id: "b1", bank: "Nubank", senderPattern: "@nubank.com.br", color: "#820AD1", enabled: true },
  { id: "b2", bank: "Itaú", senderPattern: "@itau.com.br", color: "#F68B1F", enabled: false },
  { id: "b3", bank: "Bradesco", senderPattern: "@bradesco.com.br", color: "#CC0000", enabled: false },
  { id: "b4", bank: "Inter", senderPattern: "@inter.co", color: "#FF7A00", enabled: false },
  { id: "b5", bank: "C6 Bank", senderPattern: "@c6bank.com.br", color: "#242424", enabled: false },
  { id: "b6", bank: "Caixa", senderPattern: "@caixa.gov.br", color: "#005B96", enabled: false },
];

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [checkResult, setCheckResult] = useState<{ processed: number; results: { description: string; value: number; bank: string; category: string | null }[] } | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("+55 (34) 9____-____");
  const [editingPhone, setEditingPhone] = useState(false);
  const [bankPatterns, setBankPatterns] = useState(DEFAULT_BANK_PATTERNS);
  const [categories, setCategories] = useState(FINANCIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📌");
  const [addingCat, setAddingCat] = useState(false);
  const [ankiStatus, setAnkiStatus] = useState<{ connected: boolean; totalDue?: number; decks?: { deck: string; count: number }[] } | null>(null);
  const [loadingAnki, setLoadingAnki] = useState(false);
  const [kindleEmail, setKindleEmail] = useState("");
  const [editingKindle, setEditingKindle] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Carregar status das integrações quando abrir aba Automações
  useEffect(() => {
    if (activeTab === "automacoes" && !status) fetchStatus();
  }, [activeTab]);

  async function fetchStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/automations/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function connectGmail() {
    setLoadingGmail(true);
    try {
      const res = await fetch("/api/automations/gmail/auth-url");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Erro ao gerar URL do Google");
    } finally {
      setLoadingGmail(false);
    }
  }

  async function checkGmail() {
    setLoadingCheck(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/automations/gmail/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankPatterns,
          categories: categories.map((c) => c.name),
          whatsappPhone: whatsappNumber.replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error ?? "Erro ao verificar Gmail");
      else setCheckResult(data);
    } finally {
      setLoadingCheck(false);
    }
  }

  async function checkAnki() {
    setLoadingAnki(true);
    try {
      const res = await fetch("/api/automations/anki?action=due");
      const data = await res.json();
      setAnkiStatus(data);
    } finally {
      setLoadingAnki(false);
    }
  }

  async function syncAnki() {
    const res = await fetch("/api/automations/anki?action=sync");
    const data = await res.json();
    alert(data.message ?? data.error ?? "OK");
  }

  function copyEnv(key: string, value: string) {
    navigator.clipboard.writeText(`${key}=${value}`);
    setCopiedEnv(key);
    setTimeout(() => setCopiedEnv(null), 2000);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "geral", label: "Geral", icon: <Settings size={15} /> },
    { id: "notificacoes", label: "Notificações", icon: <Bell size={15} /> },
    { id: "automacoes", label: "Automações", icon: <Zap size={15} /> },
    { id: "dados", label: "Dados", icon: <Database size={15} /> },
  ];

  const allConnected = status && status.gmail && status.gmailConnected && status.claude && status.whatsapp;

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        title="Configurações"
        subtitle="Personalize e integre seu Second Brain"
        icon={<Settings size={24} />}
        accent="var(--primary)"
      />

      <div className="flex gap-1 rounded-2xl border border-border bg-surface-2/60 p-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
              style={{
                color: active ? "var(--primary-fg)" : "var(--text-secondary)",
                background: active ? "var(--primary)" : "transparent",
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === "automacoes" && !allConnected && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ── GERAL ── */}
        {activeTab === "geral" && (
          <motion.div key="geral" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card>
              <SectionTitle><span className="flex items-center gap-2"><Palette size={16} /> Aparência</span></SectionTitle>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { key: "light", label: "Claro", icon: Sun, desc: "Pastel, leve e organizado" },
                  { key: "dark", label: "Escuro", icon: Moon, desc: "Premium e tecnológico" },
                ].map((t) => {
                  const active = mounted && theme === t.key;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      className="relative rounded-2xl border-2 p-4 text-left transition-all"
                      style={{
                        borderColor: active ? "var(--primary)" : "var(--border)",
                        background: active ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "color-mix(in srgb, var(--surface-2) 40%, transparent)",
                      }}
                    >
                      {active && (
                        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full text-white" style={{ background: "var(--primary)" }}>
                          <Check size={12} />
                        </span>
                      )}
                      <Icon size={22} style={{ color: active ? "var(--primary)" : "var(--text-secondary)" }} />
                      <p className="mt-2 text-sm font-bold">{t.label}</p>
                      <p className="text-xs text-text-muted">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionTitle><span className="flex items-center gap-2"><User size={16} /> Conta</span></SectionTitle>
              <div className="mt-3 space-y-2">
                <Row label="Nome" value="Livia Januario" />
                <Row label="E-mail" value="sliviaaz.uba@gmail.com" />
                <Row label="Foco" value="Medicina · Vestibular 2026" />
                <Row label="Plano" value="Personal · Ativo" highlight />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── NOTIFICAÇÕES ── */}
        {activeTab === "notificacoes" && (
          <motion.div key="notif" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card>
              <SectionTitle><span className="flex items-center gap-2"><Bell size={16} /> Notificações do sistema</span></SectionTitle>
              <div className="mt-3 space-y-2">
                <Toggle label="Lembretes de revisão Anki" defaultOn />
                <Toggle label="Lembrete de hidratação" defaultOn />
                <Toggle label="Resumo diário de estudos" defaultOn />
                <Toggle label="Alertas de vestibular (countdown)" defaultOn />
                <Toggle label="Notificação de hábitos" />
                <Toggle label="Metas próximas do prazo" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── AUTOMAÇÕES ── */}
        {activeTab === "automacoes" && (
          <motion.div key="auto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Status geral */}
            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle><span className="flex items-center gap-2"><Zap size={15} /> Status das integrações</span></SectionTitle>
                <button onClick={fetchStatus} disabled={loadingStatus} className="grid h-8 w-8 place-items-center rounded-xl border border-border text-text-muted transition-colors hover:text-text disabled:opacity-40">
                  <RefreshCw size={14} className={loadingStatus ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Gmail OAuth", ok: status?.gmail, hint: "GOOGLE_CLIENT_ID + SECRET" },
                  { label: "Gmail Conectado", ok: status?.gmailConnected, hint: "GOOGLE_REFRESH_TOKEN" },
                  { label: "Gemini API (IA)", ok: status?.claude, hint: "GEMINI_API_KEY — grátis em aistudio.google.com" },
                  { label: "WhatsApp (Evolution)", ok: status?.whatsapp, hint: "EVOLUTION_API_URL + INSTANCE + API_KEY" },
                  { label: "Anki", ok: status?.anki, hint: "Anki Desktop aberto + plugin" },
                  { label: "Kindle", ok: status?.kindle, hint: "KINDLE_EMAIL" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/30 px-3 py-2.5">
                    {loadingStatus ? (
                      <Loader2 size={14} className="animate-spin text-text-muted" />
                    ) : item.ok ? (
                      <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                    ) : (
                      <AlertCircle size={14} style={{ color: "var(--warning)" }} />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      {!item.ok && !loadingStatus && (
                        <p className="text-[10px] text-text-muted font-mono">{item.hint}</p>
                      )}
                    </div>
                    {item.ok && <Badge color="var(--success)">OK</Badge>}
                  </div>
                ))}
              </div>

              {/* Setup rápido .env */}
              {status && (!status.gmail || !status.claude || !status.whatsapp) && (
                <div className="mt-4 rounded-2xl border border-border bg-surface-2/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal size={14} style={{ color: "var(--primary)" }} />
                    <p className="text-xs font-bold uppercase tracking-wide">Configure o .env.local</p>
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    Copie o arquivo <code className="rounded bg-surface-2 px-1">.env.local.example</code> como <code className="rounded bg-surface-2 px-1">.env.local</code> e preencha as chaves abaixo:
                  </p>
                  <div className="space-y-2">
                    {!status.gmail && (
                      <EnvLine key_="GOOGLE_CLIENT_ID" hint="console.cloud.google.com → Credenciais" onCopy={() => copyEnv("GOOGLE_CLIENT_ID", "sua_chave")} copied={copiedEnv === "GOOGLE_CLIENT_ID"} />
                    )}
                    {!status.claude && (
                      <EnvLine key_="GEMINI_API_KEY" hint="aistudio.google.com → Get API Key (grátis)" onCopy={() => copyEnv("GEMINI_API_KEY", "AIza...")} copied={copiedEnv === "GEMINI_API_KEY"} />
                    )}
                    {!status.whatsapp && (
                      <EnvLine key_="EVOLUTION_API_KEY" hint="Evolution API → Manager → API Key" onCopy={() => copyEnv("EVOLUTION_API_KEY", "sua_key")} copied={copiedEnv === "EVOLUTION_API_KEY"} />
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Fluxo visual */}
            <Card>
              <SectionTitle>Automação financeira — fluxo completo</SectionTitle>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {[
                  { icon: "🏦", label: "Banco envia e-mail" },
                  { arrow: true },
                  { icon: "📧", label: "Gmail captura" },
                  { arrow: true },
                  { icon: "🤖", label: "Claude lê & classifica" },
                  { arrow: true },
                  { icon: "✅", label: "Auto-salvo" },
                  { sep: "ou" },
                  { icon: "💬", label: "Pergunta no WhatsApp" },
                  { arrow: true },
                  { icon: "💾", label: "Você responde → salvo" },
                ].map((step, i) =>
                  "arrow" in step ? (
                    <ArrowRight key={i} size={14} className="text-text-muted" />
                  ) : "sep" in step ? (
                    <span key={i} className="text-xs font-bold text-text-muted px-1">{step.sep}</span>
                  ) : (
                    <div key={i} className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2/50 px-3 py-1.5">
                      <span>{step.icon}</span>
                      <span className="font-medium text-xs">{step.label}</span>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Gmail */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <Mail size={16} style={{ color: "#EA4335" }} />
                  Gmail — Transações bancárias
                </span>
              </SectionTitle>
              <div className="mt-3 rounded-2xl border border-border bg-surface-2/40 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "#EA433520", color: "#EA4335" }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">Google / Gmail</p>
                      <p className="flex items-center gap-1.5 text-xs">
                        {status?.gmailConnected
                          ? <><Wifi size={12} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>Conectado · sliviaaz.uba@gmail.com</span></>
                          : <><WifiOff size={12} className="text-text-muted" /><span className="text-text-muted">Não conectado</span></>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status?.gmailConnected && (
                      <button
                        onClick={checkGmail}
                        disabled={loadingCheck}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                      >
                        {loadingCheck ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Verificar agora
                      </button>
                    )}
                    <button
                      onClick={connectGmail}
                      disabled={loadingGmail || !status?.gmail}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                      style={status?.gmailConnected
                        ? { background: "var(--danger-soft)", color: "var(--danger)" }
                        : { background: "#EA4335", color: "#fff" }}
                    >
                      {loadingGmail ? <Loader2 size={14} className="animate-spin" /> : null}
                      {status?.gmailConnected ? "Desconectar" : status?.gmail ? "Conectar conta Google" : "Configure o .env primeiro"}
                    </button>
                  </div>
                </div>

                {!status?.gmail && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft/30 px-3 py-2 text-xs text-text-secondary">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--warning)" }} />
                    Configure <code className="font-mono">GOOGLE_CLIENT_ID</code> e <code className="font-mono">GOOGLE_CLIENT_SECRET</code> no <code className="font-mono">.env.local</code> antes de conectar.
                    <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 shrink-0 font-semibold" style={{ color: "var(--primary)" }}>
                      Abrir Console <ExternalLink size={11} />
                    </a>
                  </div>
                )}
                {status?.gmailConnected && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft/30 px-3 py-2 text-sm">
                    <CheckCircle2 size={15} style={{ color: "var(--success)" }} />
                    <span className="text-text-secondary">Monitorando e-mails automaticamente. Bancos ativos abaixo.</span>
                  </div>
                )}
              </div>

              {/* Resultado da verificação */}
              <AnimatePresence>
                {checkResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                    <div className="rounded-2xl border border-border bg-surface-2/30 p-4">
                      <p className="mb-3 text-sm font-bold">
                        {checkResult.processed === 0 ? "✅ Nenhuma transação nova encontrada" : `🔍 ${checkResult.processed} transação(ões) processada(s)`}
                      </p>
                      {checkResult.results.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5 text-sm border-t border-border">
                          <span className="flex-1 truncate">{r.description}</span>
                          <span className="text-text-muted">R$ {r.value.toFixed(2)}</span>
                          {r.category
                            ? <Badge color="var(--success)">{r.category}</Badge>
                            : <Badge color="var(--warning)">WhatsApp enviado</Badge>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bancos */}
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Bancos monitorados</p>
                <div className="space-y-2">
                  {bankPatterns.map((bank) => (
                    <div key={bank.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/30 px-3 py-2.5">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: bank.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{bank.bank}</p>
                        <p className="text-[11px] text-text-muted font-mono">{bank.senderPattern}</p>
                      </div>
                      <button
                        onClick={() => setBankPatterns((prev) => prev.map((b) => b.id === bank.id ? { ...b, enabled: !b.enabled } : b))}
                        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                        style={{ background: bank.enabled ? "var(--primary)" : "var(--border-strong)" }}
                      >
                        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: bank.enabled ? "translateX(20px)" : "translateX(2px)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* WhatsApp */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <MessageCircle size={16} style={{ color: "#25D366" }} />
                  WhatsApp via Evolution API
                </span>
              </SectionTitle>
              <div className="mt-1 mb-3 flex items-center gap-2 text-xs text-text-muted">
                {status?.whatsapp
                  ? <><CheckCircle2 size={13} style={{ color: "var(--success)" }} /><span style={{ color: "var(--success)" }}>Configurado</span></>
                  : <><AlertCircle size={13} style={{ color: "var(--warning)" }} /><span>Configure EVOLUTION_API_URL, EVOLUTION_INSTANCE e EVOLUTION_API_KEY no .env.local</span>
                    <a href="https://github.com/EvolutionAPI/evolution-api" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 font-semibold shrink-0" style={{ color: "var(--primary)" }}>
                      GitHub <ExternalLink size={11} />
                    </a>
                  </>}
              </div>

              {/* Webhook URL */}
              <div className="mb-4 rounded-xl border border-border bg-surface-2/40 p-3">
                <p className="mb-1 text-xs font-bold text-text-muted">URL do Webhook (configurar em z-api.io):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-surface-2 px-2 py-1.5 text-xs text-text-secondary break-all">
                    https://SEU_DOMINIO/api/automations/whatsapp/webhook
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText("https://SEU_DOMINIO/api/automations/whatsapp/webhook"); }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border text-text-muted hover:text-text"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              {/* Comandos rápidos */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Comandos via WhatsApp</p>
                <div className="space-y-1.5">
                  {[
                    { cmd: '"2 copos de água"', action: "Registra hidratação" },
                    { cmd: '"almoço"', action: "Inicia registro de refeição" },
                    { cmd: '"nota: [texto]"', action: "Salva anotação rápida" },
                    { cmd: '"treino"', action: "Registra academia" },
                    { cmd: '"1" a "10" ou "0"', action: "Resposta à categorização financeira" },
                  ].map((c) => (
                    <div key={c.cmd} className="flex items-center gap-3 rounded-xl bg-surface-2/40 px-3 py-2 text-xs">
                      <code className="font-mono text-primary">{c.cmd}</code>
                      <span className="text-text-muted">→ {c.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Número e preview */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Número de destino</p>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                    <Phone size={15} className="text-text-muted" />
                    {editingPhone ? (
                      <input autoFocus value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="+55 (XX) XXXXX-XXXX" />
                    ) : (
                      <span className="flex-1 text-sm font-mono">{whatsappNumber}</span>
                    )}
                  </div>
                  {editingPhone ? (
                    <button onClick={() => setEditingPhone(false)} className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "var(--primary)" }}>
                      <Save size={15} />
                    </button>
                  ) : (
                    <button onClick={() => setEditingPhone(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface-2/40 text-text-secondary hover:text-text">
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Preview da mensagem */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Preview — mensagem de categorização</p>
                <div className="rounded-2xl border border-border bg-surface-2/40 p-4">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm p-3 text-xs leading-relaxed" style={{ background: "#25D36620", border: "1px solid #25D36630" }}>
                      <p className="font-bold" style={{ color: "#25D366" }}>Second Brain 🧠</p>
                      <p className="mt-1 text-text-secondary whitespace-pre-line">
                        {`💸 *Nova transação detectada!*\n\nDescrição: PIX Enviado — João\nValor: R$ 50,00\nBanco: Nubank\n\nQual é a categoria?\n\n${categories.map((c, i) => `${i + 1}️⃣ ${c.name}`).join("\n")}\n0️⃣ Outra — me diga qual`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-surface-2 p-3 text-xs">
                      <p className="font-semibold text-text-secondary">Você responde: <span className="text-text">5</span></p>
                      <p className="mt-0.5 text-text-muted">→ Categorizado como Transporte ✅</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Claude API */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  Google Gemini Flash — IA gratuita
                </span>
              </SectionTitle>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface-2/40 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Gemini 1.5 Flash</p>
                    {status?.claude
                      ? <Badge color="var(--success)">Configurado</Badge>
                      : <Badge color="var(--warning)">Sem chave</Badge>}
                    <Badge color="var(--success)">Grátis</Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Classifica transações automaticamente. <strong>Gratuito:</strong> 15 req/min, 1M tokens/dia. Configure <code className="rounded bg-surface-2 px-1">GEMINI_API_KEY</code> no .env.local.
                  </p>
                </div>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover transition-colors shrink-0">
                  Obter chave <ExternalLink size={11} />
                </a>
              </div>
            </Card>

            {/* Anki */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <span className="text-base">🃏</span>
                  Anki — Revisão espaçada
                </span>
              </SectionTitle>
              <p className="mt-1 text-xs text-text-muted">Integração direta com o Anki Desktop via plugin AnkiConnect. O Anki deve estar aberto no seu computador.</p>

              <div className="mt-3 space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl text-xl" style={{ background: "color-mix(in srgb, var(--c-blue) 15%, transparent)" }}>
                      🃏
                    </div>
                    <div>
                      <p className="text-sm font-semibold">AnkiConnect</p>
                      <p className="text-xs text-text-muted">
                        {ankiStatus === null ? "Não verificado" :
                          ankiStatus.connected ? `✅ Conectado · ${ankiStatus.totalDue ?? 0} cards pendentes` :
                            "❌ Anki fechado ou plugin não instalado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ankiStatus?.connected && (
                      <button onClick={syncAnki} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-hover">
                        Sincronizar
                      </button>
                    )}
                    <button
                      onClick={checkAnki}
                      disabled={loadingAnki}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                      style={{ background: "var(--c-blue)" }}
                    >
                      {loadingAnki ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Verificar
                    </button>
                  </div>
                </div>

                {/* Decks com pendências */}
                {ankiStatus?.connected && ankiStatus.decks && ankiStatus.decks.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface-2/30 px-4 py-3">
                    <p className="mb-2 text-xs font-bold text-text-muted uppercase">Cards devidos por deck</p>
                    {ankiStatus.decks.map((d) => (
                      <div key={d.deck} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-text-secondary">{d.deck}</span>
                        <Badge color="var(--warning)">{d.count} cards</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Instruções de setup */}
                {(!ankiStatus || !ankiStatus.connected) && (
                  <div className="rounded-xl border border-border bg-surface-2/30 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Como configurar</p>
                    {[
                      { step: "1", text: "Abra o Anki Desktop no seu computador" },
                      { step: "2", text: "Vá em Ferramentas → Complementos → Obter complementos" },
                      { step: "3", text: "Cole o código do plugin:" },
                      { step: "4", text: "Reinicie o Anki e clique em Verificar acima" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3 text-xs">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: "var(--c-blue)" }}>{s.step}</span>
                        <span className="text-text-secondary pt-0.5">{s.text}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                      <code className="flex-1 text-xs text-primary font-mono">2055492159</code>
                      <button onClick={() => { navigator.clipboard.writeText("2055492159"); }} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-text-muted hover:text-text">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Kindle */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <BookOpen size={16} style={{ color: "var(--c-amber)" }} />
                  Kindle
                </span>
              </SectionTitle>
              <p className="mt-1 text-xs text-text-muted">
                Envie livros diretamente para o seu Kindle por e-mail. Encontre seu e-mail Kindle em:{" "}
                <a href="https://www.amazon.com.br/hz/mycd/myx" target="_blank" rel="noreferrer" className="font-semibold" style={{ color: "var(--primary)" }}>
                  amazon.com.br → Conta → Gerenciar dispositivos
                </a>
              </p>

              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                    <BookOpen size={15} className="text-text-muted" />
                    {editingKindle ? (
                      <input autoFocus value={kindleEmail} onChange={(e) => setKindleEmail(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="seunome@kindle.com" />
                    ) : (
                      <span className="flex-1 text-sm font-mono text-text-muted">{kindleEmail || "Configure seu e-mail Kindle..."}</span>
                    )}
                  </div>
                  {editingKindle ? (
                    <button onClick={() => setEditingKindle(false)} className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: "var(--primary)" }}>
                      <Save size={15} />
                    </button>
                  ) : (
                    <button onClick={() => setEditingKindle(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface-2/40 text-text-secondary hover:text-text">
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>

                {status?.kindle && (
                  <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft/30 px-3 py-2 text-xs">
                    <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                    <span className="text-text-secondary">E-mail Kindle configurado via KINDLE_EMAIL no .env.local</span>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-surface-2/30 p-3">
                  <p className="mb-2 text-xs font-bold text-text-muted uppercase">Como funciona</p>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    <li className="flex gap-2"><span>→</span>Na seção Livros, clique em "Enviar para Kindle" em qualquer livro</li>
                    <li className="flex gap-2"><span>→</span>O sistema envia o arquivo .epub/.mobi para seu endereço Kindle</li>
                    <li className="flex gap-2"><span>→</span>O livro aparece automaticamente no seu dispositivo</li>
                    <li className="flex gap-2"><span>→</span>Autorize o remetente em: amazon.com.br → Conta → Preferências de Conteúdo</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Categorias */}
            <Card>
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <Tag size={16} style={{ color: "var(--primary)" }} />
                  Categorias financeiras
                </span>
              </SectionTitle>
              <p className="mt-1 mb-3 text-xs text-text-muted">Enviadas no WhatsApp e usadas pela IA para auto-categorização.</p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/30 px-3 py-2.5">
                    <span className="h-7 w-7 shrink-0 grid place-items-center rounded-lg text-sm" style={{ background: `color-mix(in srgb, ${cat.color} 15%, transparent)` }}>
                      {cat.emoji}
                    </span>
                    <span className="flex-1 text-sm font-medium">{cat.id}. {cat.name}</span>
                    <Badge color={cat.color}>{cat.id}</Badge>
                    <button onClick={() => setCategories((prev) => prev.filter((c) => c.id !== cat.id))} className="text-text-muted opacity-40 hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 opacity-60">
                  <span className="h-7 w-7 shrink-0 grid place-items-center rounded-lg bg-surface-2 text-sm">📝</span>
                  <span className="flex-1 text-sm text-text-muted">0. Outra (você digita a descrição)</span>
                  <Badge color="var(--text-muted)">fixo</Badge>
                </div>
                {addingCat ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <input value={newCatEmoji} onChange={(e) => setNewCatEmoji(e.target.value)} className="w-14 rounded-xl border border-border bg-surface-2 px-2 py-2.5 text-center text-sm outline-none" placeholder="📌" maxLength={2} />
                    <input autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newCatName.trim()) {
                          setCategories((prev) => [...prev, { id: prev.length + 1, name: newCatName.trim(), emoji: newCatEmoji || "📌", color: "var(--text-muted)" }]);
                          setNewCatName(""); setNewCatEmoji("📌"); setAddingCat(false);
                        }
                      }}
                      placeholder="Nome da categoria..."
                      className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
                    <button onClick={() => { if (newCatName.trim()) { setCategories((prev) => [...prev, { id: prev.length + 1, name: newCatName.trim(), emoji: newCatEmoji || "📌", color: "var(--text-muted)" }]); setNewCatName(""); setNewCatEmoji("📌"); setAddingCat(false); } }} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: "var(--primary)" }}>Salvar</button>
                    <button onClick={() => setAddingCat(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted"><X size={15} /></button>
                  </div>
                ) : (
                  <button onClick={() => setAddingCat(true)} className="mt-1 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-text-muted transition-colors hover:border-primary/50 hover:text-primary">
                    <Plus size={15} /> Nova categoria
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── DADOS ── */}
        {activeTab === "dados" && (
          <motion.div key="dados" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card>
              <SectionTitle><span className="flex items-center gap-2"><Database size={16} /> Dados & Backup</span></SectionTitle>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Importar do Notion", desc: "Migre seus bancos de dados via MCP", icon: "📥" },
                  { label: "Exportar JSON completo", desc: "Baixe todos os seus dados", icon: "📤" },
                  { label: "Backup automático", desc: "Salvo na nuvem a cada 24h", icon: "☁️" },
                ].map((item) => (
                  <button key={item.label} className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3 text-left transition-colors hover:bg-surface-hover">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-muted" />
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle><span style={{ color: "var(--danger)" }}>Zona de perigo</span></SectionTitle>
              <div className="mt-3">
                <button className="w-full rounded-xl border border-danger/30 bg-danger-soft/30 px-4 py-3 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger-soft/50">
                  Apagar todos os dados
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-2/40 px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold" style={highlight ? { color: "var(--primary)" } : undefined}>{value}</span>
    </div>
  );
}

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-2/40 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button onClick={() => setOn(!on)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: on ? "var(--primary)" : "var(--border-strong)" }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

function EnvLine({ key_, hint, onCopy, copied }: { key_: string; hint: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
      <code className="flex-1 text-xs text-primary font-mono">{key_}=</code>
      <span className="text-[10px] text-text-muted">{hint}</span>
      <button onClick={onCopy} className="grid h-6 w-6 place-items-center rounded-lg border border-border text-text-muted hover:text-text shrink-0">
        {copied ? <Check size={11} style={{ color: "var(--success)" }} /> : <Copy size={11} />}
      </button>
    </div>
  );
}
