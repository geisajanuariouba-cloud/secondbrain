"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Plus, X, Eye, EyeOff, Copy, Check, Trash2, Pencil, Search, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";

type Credential = {
  id: string;
  service: string;     // "Supabase - Optimio"
  email: string;
  password: string;
  username?: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: string;
};

const CATEGORIES = ["Projetos", "Redes Sociais", "Finanças", "Estudos", "Trabalho", "Pessoal", "Outro"];

const CAT_COLOR: Record<string, string> = {
  Projetos: "var(--secondary)",
  "Redes Sociais": "var(--c-pink)",
  Finanças: "var(--success)",
  Estudos: "var(--primary)",
  Trabalho: "var(--c-cyan)",
  Pessoal: "var(--c-lilac)",
  Outro: "var(--text-muted)",
};

const STORAGE_KEY = "senhas-data";

const emptyForm = (): Omit<Credential, "id" | "createdAt"> => ({
  service: "",
  email: "",
  password: "",
  username: "",
  url: "",
  notes: "",
  category: "Projetos",
});

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} title="Copiar" className="grid h-7 w-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

export default function SenhasPage() {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todos");
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  const MASTER_PIN = "1234";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCreds(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (unlocked) {
      setTimeout(() => pinRef.current?.focus(), 100);
    }
  }, [unlocked]);

  function save(data: Credential[]) {
    setCreds(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function handleUnlock() {
    if (pin === MASTER_PIN) {
      setUnlocked(true);
      setPinError(false);
      setPin("");
    } else {
      setPinError(true);
      setPin("");
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(c: Credential) {
    setEditingId(c.id);
    setForm({ service: c.service, email: c.email, password: c.password, username: c.username ?? "", url: c.url ?? "", notes: c.notes ?? "", category: c.category });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.service.trim()) return;
    if (editingId) {
      save(creds.map((c) => c.id === editingId ? { ...c, ...form } : c));
    } else {
      const newCred: Credential = { id: `cred-${Date.now()}`, ...form, createdAt: new Date().toISOString() };
      save([...creds, newCred]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (confirm("Remover esta credencial?")) save(creds.filter((c) => c.id !== id));
  }

  function toggleVisible(id: string) {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = creds.filter((c) => {
    const matchCat = filterCat === "Todos" || c.category === filterCat;
    const q = search.toLowerCase();
    const matchSearch = !q || c.service.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.notes ?? "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // ── Lock screen ─────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-sm space-y-6 pt-20">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-c-amber to-c-rose text-white shadow-[var(--shadow-glow)]">
            <Lock size={30} />
          </div>
          <h1 className="text-xl font-extrabold">Área protegida</h1>
          <p className="mt-1 text-sm text-text-muted">Digite o PIN para acessar suas credenciais</p>
        </div>
        <Card>
          <div className="space-y-3">
            <input
              ref={pinRef}
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="••••"
              maxLength={8}
              className={`w-full rounded-xl border bg-surface-2 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition-colors ${pinError ? "border-danger focus:border-danger" : "border-border focus:border-c-amber/60"}`}
            />
            {pinError && <p className="text-center text-xs text-danger">PIN incorreto. Tente novamente.</p>}
            <button
              onClick={handleUnlock}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--c-amber)" }}
            >
              Desbloquear
            </button>
            <p className="text-center text-[11px] text-text-muted">PIN padrão: 1234 — você pode trocar nas configurações</p>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Senhas & Contas"
        subtitle="Suas credenciais e acessos"
        icon={<KeyRound size={24} />}
        accent="var(--c-amber)"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
            style={{ background: "var(--c-amber)" }}
          >
            <Plus size={16} /> Nova credencial
          </button>
        }
      />

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>{editingId ? "Editar credencial" : "Nova credencial"}</SectionTitle>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Serviço / Plataforma *</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="Ex: Supabase - Projeto Optimio"
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Categoria</label>
                  <select
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">URL (opcional)</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="supabase.com"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">E-mail</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="email@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Usuário (opcional)</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="nome de usuário"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Senha</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="senha ou token de acesso"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Observações</label>
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="Ex: conta principal, plano gratuito, expira em dez/2026..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]" style={{ background: "var(--c-amber)" }}>
                  <Check size={15} /> Salvar
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none focus:border-c-amber/60"
            placeholder="Buscar serviço, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Todos", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: filterCat === cat ? `color-mix(in srgb, ${CAT_COLOR[cat] ?? "var(--primary)"} 18%, transparent)` : "transparent",
                color: filterCat === cat ? (CAT_COLOR[cat] ?? "var(--primary)") : "var(--text-muted)",
                borderColor: filterCat === cat ? (CAT_COLOR[cat] ?? "var(--primary)") : "var(--border)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <Card>
          <p className="py-8 text-center text-sm text-text-muted">
            {creds.length === 0 ? "Nenhuma credencial salva ainda. Clique em \"Nova credencial\" para começar." : "Nenhuma credencial encontrada para este filtro."}
          </p>
        </Card>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((c, i) => {
          const visible = visibleIds.has(c.id);
          const color = CAT_COLOR[c.category] ?? "var(--text-muted)";
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{c.service}</p>
                    {c.url && <p className="truncate text-[11px] text-text-muted">{c.url}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge color={color}>{c.category}</Badge>
                    <button onClick={() => openEdit(c)} className="grid h-7 w-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="grid h-7 w-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-danger">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {c.email && (
                    <div className="flex items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
                      <span className="w-14 shrink-0 text-[11px] font-semibold text-text-muted">E-mail</span>
                      <span className="flex-1 truncate text-[13px]">{c.email}</span>
                      <CopyButton value={c.email} />
                    </div>
                  )}
                  {c.username && (
                    <div className="flex items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
                      <span className="w-14 shrink-0 text-[11px] font-semibold text-text-muted">Usuário</span>
                      <span className="flex-1 truncate text-[13px]">{c.username}</span>
                      <CopyButton value={c.username} />
                    </div>
                  )}
                  {c.password && (
                    <div className="flex items-center gap-2 rounded-lg bg-surface-2/60 px-3 py-2">
                      <span className="w-14 shrink-0 text-[11px] font-semibold text-text-muted">Senha</span>
                      <span className="flex-1 truncate font-mono text-[13px]">
                        {visible ? c.password : "••••••••••••"}
                      </span>
                      <button onClick={() => toggleVisible(c.id)} className="grid h-7 w-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text">
                        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <CopyButton value={c.password} />
                    </div>
                  )}
                  {c.notes && (
                    <p className="px-1 text-[12px] leading-relaxed text-text-muted">{c.notes}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
