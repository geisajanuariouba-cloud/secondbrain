"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Check, MapPin, Heart, Star, DollarSign, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { SHOPPING_LIST, WISHLIST, TRIPS, type ShoppingItem } from "@/lib/data";

const PRIORITY_COLORS = {
  Alta: "var(--danger)",
  Média: "var(--c-amber)",
  Baixa: "var(--c-green)",
};

const CATEGORY_COLORS: Record<ShoppingItem["category"], string> = {
  Estudos: "var(--secondary)",
  Pessoal: "var(--c-lilac)",
  Casa: "var(--c-cyan)",
  Saúde: "var(--c-green)",
  Outros: "var(--text-muted)",
};

const TRIP_STATUS_COLORS: Record<string, string> = {
  Sonho: "var(--c-lilac)",
  Planejando: "var(--c-amber)",
  Confirmada: "var(--c-green)",
  Realizada: "var(--secondary)",
};

const TRIP_EMOJIS: Record<string, string> = {
  Sonho: "✨",
  Planejando: "📋",
  Confirmada: "✅",
  Realizada: "🎉",
};

const STORAGE_KEY = "compras-shopping-list";

function loadShoppingList(): ShoppingItem[] {
  if (typeof window === "undefined") return SHOPPING_LIST;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return SHOPPING_LIST;
    const savedList: ShoppingItem[] = JSON.parse(saved);
    const savedMap = new Map(savedList.map((i) => [i.id, i]));
    const baseIds = new Set(SHOPPING_LIST.map((i) => i.id));
    const merged = SHOPPING_LIST.map((i) => savedMap.get(i.id) ?? i);
    const userAdded = savedList.filter((i) => !baseIds.has(i.id));
    return [...merged, ...userAdded];
  } catch {
    return SHOPPING_LIST;
  }
}

export default function ComprasPage() {
  const [items, setItems] = useState<ShoppingItem[]>(SHOPPING_LIST);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Estudos" as ShoppingItem["category"], priority: "Média" as ShoppingItem["priority"] });

  useEffect(() => {
    setItems(loadShoppingList());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, bought: !i.bought } : i));

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `sh-${Date.now()}`, name: newItem.name.trim(), category: newItem.category, priority: newItem.priority, bought: false },
    ]);
    setNewItem({ name: "", category: "Estudos", priority: "Média" });
    setAdding(false);
  };

  const pending = items.filter((i) => !i.bought);
  const done = items.filter((i) => i.bought);
  const totalPending = pending.reduce((a, b) => a + (b.price ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Compras & Viagens"
        subtitle="Organize suas compras e planeje aventuras"
        icon={<ShoppingBag size={24} />}
        accent="var(--accent)"
        action={<Badge color="var(--accent)">{pending.length} itens pendentes</Badge>}
      />

      {/* Lista de compras */}
      <Card>
        <SectionTitle
          action={
            <span className="text-xs text-text-muted">
              {done.length}/{items.length} comprados · R$ {totalPending.toFixed(0)} pendente
            </span>
          }
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} style={{ color: "var(--accent)" }} />
            Lista de compras
          </span>
        </SectionTitle>

        <div className="mt-3 space-y-2">
          {pending.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5"
            >
              <button
                onClick={() => toggle(item.id)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-border-strong text-transparent transition-all hover:border-accent"
              >
                ✓
              </button>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {item.price && (
                  <p className="text-[11px] text-text-muted">R$ {item.price.toFixed(2)}</p>
                )}
              </div>
              <Badge color={CATEGORY_COLORS[item.category]}>{item.category}</Badge>
              <Badge color={PRIORITY_COLORS[item.priority]}>{item.priority}</Badge>
            </motion.div>
          ))}

          {/* Comprados */}
          {done.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Comprados</p>
              {done.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-50"
                >
                  <button onClick={() => toggle(item.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-success bg-success text-[10px] text-white">
                    ✓
                  </button>
                  <p className="flex-1 text-sm line-through text-text-muted">{item.name}</p>
                  {item.price && <span className="text-xs text-text-muted">R$ {item.price.toFixed(2)}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Adicionar item */}
          {adding ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                autoFocus
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Nome do item..."
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent/60"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value as ShoppingItem["category"] }))}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
              >
                <option>Estudos</option><option>Pessoal</option><option>Casa</option><option>Saúde</option><option>Outros</option>
              </select>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem((p) => ({ ...p, priority: e.target.value as ShoppingItem["priority"] }))}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none"
              >
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
              <button onClick={addItem} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
                Adicionar
              </button>
              <button onClick={() => setAdding(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
            >
              <Plus size={16} /> Adicionar item
            </button>
          )}
        </div>
      </Card>

      {/* Wishlist */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <Heart size={16} style={{ color: "var(--c-rose)" }} />
            Wishlist
          </span>
        </SectionTitle>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {WISHLIST.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
            >
              <Star size={16} style={{ color: "var(--c-amber)" }} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                {item.price && (
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <DollarSign size={10} /> R$ {item.price.toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
              <Badge color={PRIORITY_COLORS[item.priority]}>{item.priority}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Viagens */}
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <MapPin size={16} style={{ color: "var(--c-cyan)" }} />
            Viagens
          </span>
        </SectionTitle>
        <div className="mt-3 space-y-3">
          {TRIPS.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2/40 p-4"
            >
              <span className="text-2xl">{TRIP_EMOJIS[trip.status]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold">{trip.destination}</p>
                  <Badge color={TRIP_STATUS_COLORS[trip.status]}>{trip.status}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                  {trip.date && <span>📅 {trip.date}</span>}
                  {trip.budget && <span>💰 Orçamento: R$ {trip.budget.toLocaleString("pt-BR")}</span>}
                  {trip.notes && <span>📝 {trip.notes}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
