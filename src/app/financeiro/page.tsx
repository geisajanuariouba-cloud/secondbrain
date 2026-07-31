"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Check, Clock,
  RotateCcw, PieChart, Plus, X, Pencil, Landmark, AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import {
  TRANSACTIONS, BUDGET_CATEGORIES, RECURRING_EXPENSES, DEFAULT_ACCOUNTS,
  type RecurringExpense, type Transaction, type BankAccount,
} from "@/lib/data";
import { todayLocalISO } from "@/lib/date-utils";

const TABS = ["Visão Geral", "Contas", "Recorrentes", "Orçamento"] as const;
type Tab = typeof TABS[number];

const DEFAULT_INCOME = 1500;

const FREQ_ORDER: RecurringExpense["frequency"][] = ["Mensal", "Trimestral", "Semestral", "Anual"];

const TRANSACTION_CATEGORIES = [
  "Alimentação", "Estudos", "Saúde & Beleza", "Lazer", "Transporte",
  "Moradia", "Roupas", "Assinaturas", "Outros",
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v: number, total: number) { return total ? Math.min(100, (v / total) * 100) : 0; }

function todayISO() {
  return todayLocalISO();
}

// ── Form de transação ──
interface TransactionFormProps {
  onAdd: (t: Transaction) => void;
  onClose: () => void;
  accounts: BankAccount[];
}
function TransactionForm({ onAdd, onClose, accounts }: TransactionFormProps) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<Transaction["type"]>("Gasto variável");
  const [category, setCategory] = useState(TRANSACTION_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO());
  const [account, setAccount] = useState(accounts[0]?.id ?? "");

  const inputClass =
    "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary transition-colors";
  const labelClass = "block text-xs font-semibold text-text-muted mb-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value) return;
    const newT: Transaction = {
      id: `t-${Date.now()}`,
      name: name.trim(),
      value: parseFloat(value),
      type,
      category: type === "Receita" ? undefined : category,
      date,
      account: account || undefined,
    };
    onAdd(newT);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-md)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-sm">Nova transação</p>
        <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Nome / Descrição</label>
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Mercado, Salário..." required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Valor (R$)</label>
            <input className={inputClass} type="number" min="0.01" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" required />
          </div>
          <div>
            <label className={labelClass}>Data</label>
            <input className={inputClass} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select className={inputClass} value={type} onChange={e => setType(e.target.value as Transaction["type"])}>
            <option>Receita</option>
            <option>Gasto fixo</option>
            <option>Gasto variável</option>
          </select>
        </div>
        {type !== "Receita" && (
          <div>
            <label className={labelClass}>Categoria</label>
            <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
              {TRANSACTION_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
        {accounts.length > 0 && (
          <div>
            <label className={labelClass}>Conta</label>
            <select className={inputClass} value={account} onChange={e => setAccount(e.target.value)}>
              <option value="">Sem conta específica</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-xl py-2 text-sm font-bold transition-transform hover:scale-[1.02]"
            style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
          >
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

// ── Visão Geral ──
interface VisaoGeralProps {
  transactions: Transaction[];
  onAdd: (t: Transaction) => void;
  onExplainPending: (id: string, explanation: string) => void;
  monthlyIncome: number;
  onIncomeChange: (v: number) => void;
  accounts: BankAccount[];
}
function VisaoGeral({ transactions, onAdd, onExplainPending, monthlyIncome, onIncomeChange, accounts }: VisaoGeralProps) {
  const [pendingExplain, setPendingExplain] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(monthlyIncome));
  const incomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIncome) incomeRef.current?.focus();
  }, [editingIncome]);

  const income = transactions.filter((t) => t.type === "Receita").reduce((s, t) => s + t.value, 0);
  const expenses = transactions.filter((t) => t.type !== "Receita").reduce((s, t) => s + t.value, 0);
  const balance = income - expenses;

  const byCategory = transactions.filter((t) => t.type !== "Receita").reduce<Record<string, number>>((acc, t) => {
    const cat = t.category ?? "Outros";
    acc[cat] = (acc[cat] ?? 0) + t.value;
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleAddTransaction = (t: Transaction) => {
    onAdd(t);
    setShowForm(false);
  };

  const pendingList = transactions.filter((t) => t.pending);

  const saveIncome = () => {
    const v = parseFloat(incomeInput);
    if (!isNaN(v) && v > 0) onIncomeChange(v);
    setEditingIncome(false);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {showForm && (
          <TransactionForm onAdd={handleAddTransaction} onClose={() => setShowForm(false)} accounts={accounts} />
        )}
      </AnimatePresence>

      {/* Transações pendentes */}
      {pendingList.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={15} style={{ color: "var(--c-amber)" }} />
            <SectionTitle>Transações pendentes ({pendingList.length})</SectionTitle>
          </div>
          <div className="space-y-2">
            {pendingList.map((t) => (
              <div key={t.id} className="rounded-xl border border-c-amber/40 bg-c-amber/5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-text-muted">{new Date(t.date).toLocaleDateString("pt-BR")} · {formatBRL(t.value)}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: t.type === "Receita" ? "var(--success)" : "var(--danger)" }}>
                    {t.type === "Receita" ? "+" : "-"}{formatBRL(t.value)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs outline-none focus:border-c-amber/60"
                    placeholder="Do que foi essa transação?"
                    value={pendingExplain[t.id] ?? ""}
                    onChange={(e) => setPendingExplain((p) => ({ ...p, [t.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pendingExplain[t.id]?.trim()) {
                        onExplainPending(t.id, pendingExplain[t.id]);
                        setPendingExplain((p) => { const n = { ...p }; delete n[t.id]; return n; });
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (pendingExplain[t.id]?.trim()) {
                        onExplainPending(t.id, pendingExplain[t.id]);
                        setPendingExplain((p) => { const n = { ...p }; delete n[t.id]; return n; });
                      }
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    style={{ background: "var(--c-amber)" }}
                  >OK</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Receita", value: income, icon: <TrendingUp size={18} />, color: "var(--success)" },
          { label: "Despesas", value: expenses, icon: <TrendingDown size={18} />, color: "var(--danger)" },
          { label: "Saldo", value: balance, icon: <PiggyBank size={18} />, color: balance >= 0 ? "var(--success)" : "var(--danger)" },
        ].map((kpi) => (
          <Card key={kpi.label} glow={kpi.label === "Saldo"}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${kpi.color} 15%, transparent)`, color: kpi.color }}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-xs text-text-muted">{kpi.label}</p>
                <p className="text-xl font-extrabold tabular-nums" style={{ color: kpi.color }}>{formatBRL(kpi.value)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Renda mensal editável */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Renda mensal configurada</p>
              {editingIncome ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    ref={incomeRef}
                    className="w-28 rounded-lg border border-primary bg-surface-2 px-2 py-1 text-sm font-bold tabular-nums outline-none"
                    type="number" min="0" step="0.01"
                    value={incomeInput}
                    onChange={e => setIncomeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveIncome(); if (e.key === "Escape") setEditingIncome(false); }}
                  />
                  <button onClick={saveIncome} className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-fg)" }}>Salvar</button>
                </div>
              ) : (
                <p className="text-xl font-extrabold tabular-nums" style={{ color: "var(--primary)" }}>{formatBRL(monthlyIncome)}</p>
              )}
            </div>
          </div>
          {!editingIncome && (
            <button
              onClick={() => { setIncomeInput(String(monthlyIncome)); setEditingIncome(true); }}
              className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface-hover transition-colors"
              title="Editar renda"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
        >
          <Plus size={16} /> Transação
        </button>
      </div>

      <Card>
        <SectionTitle>Últimas transações</SectionTitle>
        <div className="mt-3 space-y-1.5">
          {transactions.slice(0, 8).map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-hover">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-base">
                {t.type === "Receita" ? "💰" : t.category === "Alimentação" ? "🍽️" : t.category === "Estudos" ? "📚" : t.category === "Saúde & Beleza" ? "💊" : t.category === "Lazer" ? "🎮" : "🧾"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-text-muted">{t.category ?? t.type} · {new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: t.type === "Receita" ? "var(--success)" : "var(--danger)" }}>
                {t.type === "Receita" ? "+" : "-"}{formatBRL(t.value)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {topCategories.length > 0 && (
        <Card>
          <SectionTitle>Top categorias de gasto</SectionTitle>
          <div className="mt-3 space-y-3">
            {topCategories.map(([cat, val]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">{cat}</span>
                  <span className="text-text-muted">{formatBRL(val)}</span>
                </div>
                <ProgressBar value={pct(val, expenses)} color="var(--primary)" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Contas ──
interface ContasProps {
  accounts: BankAccount[];
  onUpdateBalance: (id: string, balance: number) => void;
  transactions: Transaction[];
}
function Contas({ accounts, onUpdateBalance, transactions }: ContasProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const txByAccount = (accId: string) =>
    transactions.filter((t) => t.account === accId).slice(0, 3);

  return (
    <div className="space-y-5">
      <Card glow>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
            <Landmark size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Saldo total em contas</p>
            <p className="text-3xl font-extrabold tabular-nums" style={{ color: totalBalance >= 0 ? "var(--success)" : "var(--danger)" }}>
              {formatBRL(totalBalance)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {accounts.map((acc) => {
          const recentTx = txByAccount(acc.id);
          const isEditing = editingId === acc.id;
          return (
            <Card key={acc.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ background: `color-mix(in srgb, ${acc.color} 15%, transparent)` }}>
                    {acc.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{acc.name}</p>
                    <p className="text-[11px] text-text-muted">{acc.bank} · {acc.type}</p>
                  </div>
                </div>
                <Badge color={acc.color}>{acc.type}</Badge>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    autoFocus
                    type="number"
                    step="0.01"
                    className="flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm font-bold outline-none focus:border-primary"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { onUpdateBalance(acc.id, parseFloat(editVal) || 0); setEditingId(null); }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button onClick={() => { onUpdateBalance(acc.id, parseFloat(editVal) || 0); setEditingId(null); }}
                    className="rounded-lg px-2 py-1.5 text-xs font-bold text-white" style={{ background: "var(--success)" }}>OK</button>
                  <button onClick={() => setEditingId(null)} className="text-text-muted hover:text-text"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-extrabold tabular-nums" style={{ color: acc.balance >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {formatBRL(acc.balance)}
                  </p>
                  <button onClick={() => { setEditingId(acc.id); setEditVal(String(acc.balance)); }}
                    className="rounded-lg border border-border p-1.5 text-text-muted hover:bg-surface-hover hover:text-text transition-colors">
                    <Pencil size={13} />
                  </button>
                </div>
              )}

              {recentTx.length > 0 && (
                <div className="space-y-1 border-t border-border pt-2">
                  {recentTx.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <span className="truncate text-text-secondary">{t.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums ml-2" style={{ color: t.type === "Receita" ? "var(--success)" : "var(--danger)" }}>
                        {t.type === "Receita" ? "+" : "-"}{formatBRL(t.value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Recorrentes ──
function Recorrentes() {
  const [items, setItems] = useState(RECURRING_EXPENSES);

  const togglePaid = (id: string) =>
    setItems((prev) => prev.map((e) => e.id === id ? { ...e, paid: !e.paid } : e));

  const totalPending = items.filter((e) => !e.paid).reduce((s, e) => s + e.value, 0);
  const totalPaid = items.filter((e) => e.paid).reduce((s, e) => s + e.value, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}>
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Pendente</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--danger)" }}>{formatBRL(totalPending)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
              <Check size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Pago</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--success)" }}>{formatBRL(totalPaid)}</p>
            </div>
          </div>
        </Card>
      </div>

      {FREQ_ORDER.map((freq) => {
        const group = items.filter((e) => e.frequency === freq);
        if (!group.length) return null;
        const freqColor = freq === "Mensal" ? "var(--primary)" : freq === "Trimestral" ? "var(--c-amber)" : freq === "Semestral" ? "var(--accent)" : "var(--c-rose)";
        return (
          <Card key={freq}>
            <div className="mb-3 flex items-center gap-2">
              <RotateCcw size={14} className="text-text-muted" />
              <SectionTitle>{freq}</SectionTitle>
              <Badge color={freqColor}>{group.length}</Badge>
            </div>
            <div className="space-y-2">
              {group.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors"
                  style={{ background: e.paid ? "color-mix(in srgb, var(--success) 5%, transparent)" : "transparent" }}
                >
                  <button
                    onClick={() => togglePaid(e.id)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-all"
                    style={{
                      borderColor: e.paid ? "var(--success)" : "var(--border-strong)",
                      background: e.paid ? "var(--success)" : "transparent",
                      color: "#fff",
                    }}
                  >
                    {e.paid && <Check size={14} />}
                  </button>
                  <span className="text-xl leading-none">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${e.paid ? "line-through text-text-muted" : ""}`}>{e.name}</p>
                    <p className="text-xs text-text-muted">{e.category} · vence {new Date(e.nextDue).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: e.paid ? "var(--text-muted)" : e.color }}>
                    {formatBRL(e.value)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Orçamento ──
interface OrcamentoProps { monthlyIncome: number }
function Orcamento({ monthlyIncome }: OrcamentoProps) {
  const income = monthlyIncome;
  const totalSpent = BUDGET_CATEGORIES.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-5">
      <Card glow>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide">Renda mensal</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums" style={{ color: "var(--primary)" }}>{formatBRL(income)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Total gasto</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: "var(--danger)" }}>{formatBRL(totalSpent)}</p>
            <p className="text-xs text-text-muted">
              Saldo livre: <span className="font-bold" style={{ color: "var(--success)" }}>{formatBRL(income - totalSpent)}</span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={pct(totalSpent, income)} color="var(--danger)" />
          <p className="mt-1 text-right text-xs text-text-muted">{Math.round((totalSpent / income) * 100)}% da renda utilizado</p>
        </div>
      </Card>

      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <PieChart size={15} style={{ color: "var(--primary)" }} />
            Alocação por categoria
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-4">
          {BUDGET_CATEGORIES.map((cat) => {
            const allocated = income * (cat.percentage / 100);
            const overBudget = cat.spent > allocated;
            return (
              <div key={cat.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-semibold">{cat.name}</span>
                  <Badge color={cat.color}>{cat.percentage}%</Badge>
                  {overBudget && <Badge color="var(--danger)">excedido</Badge>}
                </div>
                <ProgressBar value={pct(cat.spent, allocated)} color={overBudget ? "var(--danger)" : cat.color} />
                <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                  <span>Gasto: <b className="text-text">{formatBRL(cat.spent)}</b></span>
                  <span>Limite: <b className="text-text">{formatBRL(allocated)}</b></span>
                  <span style={{ color: overBudget ? "var(--danger)" : "var(--success)" }}>
                    {overBudget ? `+${formatBRL(cat.spent - allocated)} excedido` : `${formatBRL(allocated - cat.spent)} restam`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Main ──
export default function FinanceiroPage() {
  const [tab, setTab] = useState<Tab>("Visão Geral");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULT_INCOME);
  const [accounts, setAccounts] = useState<BankAccount[]>(DEFAULT_ACCOUNTS);

  useEffect(() => {
    const savedIncome = localStorage.getItem("financeiro-income");
    if (savedIncome) { const v = parseFloat(savedIncome); if (!isNaN(v)) setMonthlyIncome(v); }

    const savedTx = localStorage.getItem("financeiro-transacoes");
    const localTx: Transaction[] = savedTx ? JSON.parse(savedTx) : [];
    const localIds = new Set(localTx.map((t) => t.id));
    const merged = [...TRANSACTIONS.filter((t) => !localIds.has(t.id)), ...localTx];
    setTransactions(merged);

    const savedAccounts = localStorage.getItem("financeiro-contas");
    if (savedAccounts) {
      try { setAccounts(JSON.parse(savedAccounts)); } catch { /* ignore */ }
    }
  }, []);

  function saveTransactions(txList: Transaction[]) {
    const mockIds = new Set(TRANSACTIONS.map((x) => x.id));
    localStorage.setItem("financeiro-transacoes", JSON.stringify(txList.filter((x) => !mockIds.has(x.id))));
  }

  const handleAddTransaction = (t: Transaction) => {
    setTransactions((prev) => {
      const next = [t, ...prev];
      saveTransactions(next);
      return next;
    });
  };

  const handleExplainPending = (id: string, explanation: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, name: explanation, pending: false } : t);
      saveTransactions(next);
      return next;
    });
  };

  const handleIncomeChange = (v: number) => {
    setMonthlyIncome(v);
    localStorage.setItem("financeiro-income", String(v));
  };

  const handleUpdateAccountBalance = (id: string, balance: number) => {
    setAccounts((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, balance } : a);
      localStorage.setItem("financeiro-contas", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Financeiro"
        subtitle="Controle total do seu dinheiro"
        icon={<DollarSign size={24} />}
        accent="var(--success)"
      />

      <div className="flex gap-1 rounded-2xl border border-border bg-surface-2/40 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 rounded-xl py-2 text-sm font-semibold transition-all"
            style={{ color: tab === t ? "var(--primary-fg)" : "var(--text-muted)" }}
          >
            {tab === t && (
              <motion.span
                layoutId="fin-tab"
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--primary)" }}
              />
            )}
            <span className="relative z-10">{t}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "Visão Geral" && (
            <VisaoGeral
              transactions={transactions}
              onAdd={handleAddTransaction}
              onExplainPending={handleExplainPending}
              monthlyIncome={monthlyIncome}
              onIncomeChange={handleIncomeChange}
              accounts={accounts}
            />
          )}
          {tab === "Contas" && (
            <Contas
              accounts={accounts}
              onUpdateBalance={handleUpdateAccountBalance}
              transactions={transactions}
            />
          )}
          {tab === "Recorrentes" && <Recorrentes />}
          {tab === "Orçamento" && <Orcamento monthlyIncome={monthlyIncome} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
