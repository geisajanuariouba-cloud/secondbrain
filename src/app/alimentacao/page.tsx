"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils, Flame, Package, ShoppingCart, Scale, Plus, X,
  Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Pencil, Save, Download, Dumbbell, RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import {
  MEAL_PLAN, INITIAL_STOCK, DAILY_GOAL, addMacros, zeroMacros,
  type MealLogEntry, type StockItem, type FoodShoppingItem, type Measurements, type Macros,
} from "@/lib/nutrition";
import { pct } from "@/lib/utils";
import { todayLocalISO } from "@/lib/date-utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDate() {
  return todayLocalISO();
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isSunday() {
  return new Date().getDay() === 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "hoje" | "estoque" | "compras" | "medidas";

type DifferentForm = {
  description: string;
  kcal: string;
  p: string;
  c: string;
  g: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlimentacaoPage() {
  const today = getTodayDate();

  const [tab, setTab] = useState<Tab>("hoje");

  // ── Hoje ──────────────────────────────────────────────────────────────────
  const [mealLogs, setMealLogs] = useState<Record<string, MealLogEntry>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [differentMode, setDifferentMode] = useState<string | null>(null);
  const [differentForms, setDifferentForms] = useState<Record<string, DifferentForm>>({});
  const [isTrainingDay, setIsTrainingDay] = useState(false);

  // ── Estoque ───────────────────────────────────────────────────────────────
  const [stock, setStock] = useState<StockItem[]>([]);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState("");
  const [addingStock, setAddingStock] = useState(false);
  const [newStock, setNewStock] = useState({ name: "", unit: "un", current: "", weeklyNeeded: "", alertAt: "", emoji: "📦" });

  // ── Compras ───────────────────────────────────────────────────────────────
  const [shopping, setShopping] = useState<FoodShoppingItem[]>([]);
  const [addingShopping, setAddingShopping] = useState(false);
  const [newShopping, setNewShopping] = useState({ name: "", qty: "", unit: "un", stockId: "" });
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completingQty, setCompletingQty] = useState("");

  // ── Medidas ───────────────────────────────────────────────────────────────
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [newM, setNewM] = useState({ weight: "", waist: "", hip: "", arm: "", thigh: "" });

  // ─── Persist helpers ────────────────────────────────────────────────────────

  const saveStock = useCallback((s: StockItem[]) => {
    localStorage.setItem("alimentacao-stock", JSON.stringify(s));
  }, []);

  const saveShopping = useCallback((s: FoodShoppingItem[]) => {
    localStorage.setItem("alimentacao-shopping", JSON.stringify(s));
  }, []);

  // ─── Load state ────────────────────────────────────────────────────────────

  useEffect(() => {
    const rawLog = localStorage.getItem(`alimentacao-log-${today}`);
    setMealLogs(rawLog ? JSON.parse(rawLog) : {});

    const rawStock = localStorage.getItem("alimentacao-stock");
    setStock(rawStock ? JSON.parse(rawStock) : structuredClone(INITIAL_STOCK));

    const rawShopping = localStorage.getItem("alimentacao-shopping");
    setShopping(rawShopping ? JSON.parse(rawShopping) : []);

    const rawMed = localStorage.getItem("alimentacao-medidas");
    setMeasurements(rawMed ? JSON.parse(rawMed) : []);

    const rawTraining = localStorage.getItem(`alimentacao-training-${today}`);
    setIsTrainingDay(rawTraining === "true");
  }, [today]);

  // ─── Persist meal log ──────────────────────────────────────────────────────

  useEffect(() => {
    if (Object.keys(mealLogs).length > 0) {
      localStorage.setItem(`alimentacao-log-${today}`, JSON.stringify(mealLogs));
    }
  }, [mealLogs, today]);

  // ─── Macros ────────────────────────────────────────────────────────────────

  const consumedMacros = MEAL_PLAN.reduce((acc, meal) => {
    const log = mealLogs[meal.id];
    if (!log?.done) return acc;
    const macros = log.usedPlan ? meal.macros : (log.customMacros ?? meal.macros);
    return addMacros(acc, macros);
  }, zeroMacros());

  // ─── Stock deduction when meal done ───────────────────────────────────────

  const deductStock = useCallback((mealId: string) => {
    const meal = MEAL_PLAN.find((m) => m.id === mealId);
    if (!meal) return;

    setStock((prev) => {
      const updated = prev.map((s) => {
        const item = meal.items.find((i) => i.stockId === s.id && i.deduct != null);
        if (!item || item.deduct == null) return s;
        const next = Math.max(0, s.current - item.deduct);
        return { ...s, current: next };
      });
      saveStock(updated);

      // Auto-add to shopping if stock hits 0
      setShopping((prevShopping) => {
        let sh = [...prevShopping];
        updated.forEach((s) => {
          if (s.current <= 0) {
            const already = sh.find((i) => i.stockId === s.id && !i.done);
            if (!already) {
              sh = [...sh, {
                id: `auto-${s.id}-${Date.now()}`,
                name: s.name,
                qty: s.weeklyNeeded,
                unit: s.unit,
                stockId: s.id,
                done: false,
                addedAt: today,
                auto: true,
              }];
            }
          }
        });
        saveShopping(sh);
        return sh;
      });

      return updated;
    });
  }, [saveStock, saveShopping, today]);

  // ─── Meal actions ─────────────────────────────────────────────────────────

  const markDone = (mealId: string) => {
    const log = mealLogs[mealId];
    const wasDone = log?.done;
    setMealLogs((prev) => ({
      ...prev,
      [mealId]: { done: !wasDone, usedPlan: true, doneAt: !wasDone ? new Date().toISOString() : undefined },
    }));
    if (!wasDone) deductStock(mealId);
    if (differentMode === mealId) setDifferentMode(null);
  };

  const saveDifferent = (mealId: string) => {
    const form = differentForms[mealId];
    if (!form?.description.trim()) return;
    const kcal = parseFloat(form.kcal) || 0;
    const p = parseFloat(form.p) || 0;
    const c = parseFloat(form.c) || 0;
    const g = parseFloat(form.g) || 0;
    const customMacros: Macros = { p, c, g, kcal: kcal || Math.round(p * 4 + c * 4 + g * 9) };
    setMealLogs((prev) => ({
      ...prev,
      [mealId]: { done: true, usedPlan: false, doneAt: new Date().toISOString(), customDescription: form.description, customMacros },
    }));
    setDifferentMode(null);
  };

  const resetMeal = (mealId: string) => {
    setMealLogs((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
  };

  // ─── Stock actions ────────────────────────────────────────────────────────

  const saveStockEdit = (id: string) => {
    const val = parseFloat(editStockVal);
    if (isNaN(val) || val < 0) return;
    setStock((prev) => {
      const updated = prev.map((s) => s.id === id ? { ...s, current: val } : s);
      saveStock(updated);
      return updated;
    });
    setEditingStock(null);
  };

  const deleteStock = (id: string) => {
    setStock((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveStock(updated);
      return updated;
    });
  };

  const addStockItem = () => {
    if (!newStock.name.trim()) return;
    const item: StockItem = {
      id: `custom-${Date.now()}`,
      name: newStock.name.trim(),
      unit: newStock.unit,
      current: parseFloat(newStock.current) || 0,
      weeklyNeeded: parseFloat(newStock.weeklyNeeded) || 0,
      alertAt: parseFloat(newStock.alertAt) || 0,
      emoji: newStock.emoji,
    };
    setStock((prev) => {
      const updated = [...prev, item];
      saveStock(updated);
      return updated;
    });
    setNewStock({ name: "", unit: "un", current: "", weeklyNeeded: "", alertAt: "", emoji: "📦" });
    setAddingStock(false);
  };

  const addToShoppingList = (s: StockItem) => {
    const already = shopping.find((i) => i.stockId === s.id && !i.done);
    if (already) return;
    setShopping((prev) => {
      const updated = [...prev, {
        id: `sh-${s.id}-${Date.now()}`,
        name: s.name,
        qty: s.weeklyNeeded,
        unit: s.unit,
        stockId: s.id,
        done: false,
        addedAt: today,
      }];
      saveShopping(updated);
      return updated;
    });
  };

  // ─── Shopping actions ─────────────────────────────────────────────────────

  const addShoppingItem = () => {
    if (!newShopping.name.trim()) return;
    setShopping((prev) => {
      const updated = [...prev, {
        id: `sh-${Date.now()}`,
        name: newShopping.name.trim(),
        qty: parseFloat(newShopping.qty) || 1,
        unit: newShopping.unit,
        stockId: newShopping.stockId || undefined,
        done: false,
        addedAt: today,
      }];
      saveShopping(updated);
      return updated;
    });
    setNewShopping({ name: "", qty: "", unit: "un", stockId: "" });
    setAddingShopping(false);
  };

  const completeShoppingItem = (id: string) => {
    const qty = parseFloat(completingQty);
    setShopping((prev) => {
      const updated = prev.map((i) => {
        if (i.id !== id) return i;
        // Add to stock if linked
        if (i.stockId && !isNaN(qty) && qty > 0) {
          setStock((prevStock) => {
            const s = prevStock.map((st) =>
              st.id === i.stockId ? { ...st, current: st.current + qty } : st
            );
            saveStock(s);
            return s;
          });
        }
        return { ...i, done: true, completedAt: today };
      });
      saveShopping(updated);
      return updated;
    });
    setCompletingId(null);
    setCompletingQty("");
  };

  const deleteShoppingItem = (id: string) => {
    setShopping((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveShopping(updated);
      return updated;
    });
  };

  const clearDoneShopping = () => {
    setShopping((prev) => {
      const updated = prev.filter((i) => !i.done);
      saveShopping(updated);
      return updated;
    });
  };

  // ─── Measurements actions ─────────────────────────────────────────────────

  const saveMeasurement = () => {
    const m: Measurements = {
      date: today,
      weight: newM.weight ? parseFloat(newM.weight) : undefined,
      waist: newM.waist ? parseFloat(newM.waist) : undefined,
      hip: newM.hip ? parseFloat(newM.hip) : undefined,
      arm: newM.arm ? parseFloat(newM.arm) : undefined,
      thigh: newM.thigh ? parseFloat(newM.thigh) : undefined,
    };
    setMeasurements((prev) => {
      const filtered = prev.filter((x) => x.date !== today);
      const updated = [m, ...filtered];
      localStorage.setItem("alimentacao-medidas", JSON.stringify(updated));
      return updated;
    });
    setNewM({ weight: "", waist: "", hip: "", arm: "", thigh: "" });
  };

  const exportNutritionData = () => {
    const allLogs: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("alimentacao-log-")) {
        allLogs[key.replace("alimentacao-log-", "")] = JSON.parse(localStorage.getItem(key)!);
      }
    }
    const data = {
      exportedAt: new Date().toISOString(),
      medidas: measurements,
      refeicoes: allLogs,
      plano: MEAL_PLAN.map((m) => ({ id: m.id, name: m.name, macros: m.macros })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutrição-livia-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Computed ──────────────────────────────────────────────────────────────

  const alertCount = stock.filter((s) => s.current <= s.alertAt).length;
  const pendingShopping = shopping.filter((i) => !i.done).length;
  const todayMeasurement = measurements.find((m) => m.date === today);
  const meals = isTrainingDay ? MEAL_PLAN : MEAL_PLAN.filter((m) => !m.onlyTraining);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Alimentação"
        subtitle="Plano, diário e estoque integrados"
        icon={<Utensils size={24} />}
        accent="var(--c-green)"
        action={
          <Badge color="var(--c-green)">
            {consumedMacros.kcal} / {DAILY_GOAL.kcal} kcal
          </Badge>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["hoje", "estoque", "compras", "medidas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === t ? "color-mix(in srgb, var(--c-green) 18%, transparent)" : "transparent",
              color: tab === t ? "var(--c-green)" : "var(--text-secondary)",
              border: tab === t ? "1px solid color-mix(in srgb, var(--c-green) 35%, transparent)" : "1px solid var(--border)",
            }}
          >
            {t === "hoje" && <Flame size={14} />}
            {t === "estoque" && <Package size={14} />}
            {t === "compras" && <ShoppingCart size={14} />}
            {t === "medidas" && <Scale size={14} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "estoque" && alertCount > 0 && (
              <span className="ml-1 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-bold text-white">{alertCount}</span>
            )}
            {t === "compras" && pendingShopping > 0 && (
              <span className="ml-1 rounded-full bg-c-pink px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingShopping}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── HOJE ───────────────────────────────────────────────────────────── */}
      {tab === "hoje" && (
        <>
          {/* Macro KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Calorias", val: consumedMacros.kcal, goal: DAILY_GOAL.kcal, unit: "kcal", color: "var(--c-green)" },
              { label: "Proteína", val: consumedMacros.p, goal: DAILY_GOAL.p, unit: "g", color: "var(--c-blue)" },
              { label: "Carboidratos", val: consumedMacros.c, goal: DAILY_GOAL.c, unit: "g", color: "var(--c-amber)" },
              { label: "Gordura", val: consumedMacros.g, goal: DAILY_GOAL.g, unit: "g", color: "var(--c-lilac)" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <p className="text-xs font-semibold text-text-muted">{kpi.label}</p>
                <p className="mt-1 text-xl font-extrabold" style={{ color: kpi.color }}>
                  {kpi.val}<span className="text-sm font-normal text-text-muted"> / {kpi.goal}{kpi.unit}</span>
                </p>
                <div className="mt-2">
                  <ProgressBar value={pct(kpi.val, kpi.goal)} color={kpi.color} />
                </div>
              </Card>
            ))}
          </div>

          {/* Training day toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = !isTrainingDay;
                setIsTrainingDay(next);
                localStorage.setItem(`alimentacao-training-${today}`, String(next));
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                isTrainingDay
                  ? "border-c-rose/40 bg-c-rose/10 text-c-rose"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              <Dumbbell size={14} />
              {isTrainingDay ? "Dia de treino ativo" : "Dia de treino?"}
            </button>
            <span className="text-xs text-text-muted">
              {meals.filter((m) => mealLogs[m.id]?.done).length}/{meals.length} refeições concluídas
            </span>
          </div>

          {/* Meal list */}
          <div className="space-y-3">
            {meals.map((meal) => {
              const log = mealLogs[meal.id];
              const isDone = !!log?.done;
              const isExpanded = expanded === meal.id;
              const isDifferent = differentMode === meal.id;
              const form = differentForms[meal.id] ?? { description: "", kcal: "", p: "", c: "", g: "" };

              return (
                <Card key={meal.id} className={`transition-all ${isDone ? "opacity-80" : ""}`}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => markDone(meal.id)}
                      className={`mt-0.5 shrink-0 grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] transition-all ${
                        isDone ? "border-c-green bg-c-green text-white" : "border-border-strong text-transparent hover:border-c-green/60"
                      }`}
                    >
                      ✓
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{meal.emoji}</span>
                        <span className={`font-semibold ${isDone ? "line-through text-text-muted" : ""}`}>
                          {meal.name}
                        </span>
                        <span className="text-xs text-text-muted">{meal.time}</span>
                        {meal.optional && <Badge color="var(--text-muted)">opcional</Badge>}
                        {meal.onlyTraining && <Badge color="var(--c-rose)">treino</Badge>}
                        <div className="ml-auto flex items-center gap-1.5">
                          {isDone && !log.usedPlan && (
                            <Badge color="var(--c-amber)">personalizado</Badge>
                          )}
                          <span className="text-xs font-semibold" style={{ color: "var(--c-green)" }}>
                            {log?.usedPlan ? meal.macros.kcal : (log?.customMacros?.kcal ?? meal.macros.kcal)} kcal
                          </span>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : meal.id)}
                            className="text-text-muted hover:text-text"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Custom log info */}
                      {isDone && !log.usedPlan && log.customDescription && (
                        <p className="mt-1 text-xs text-text-muted italic">"{log.customDescription}"</p>
                      )}

                      {/* Macros row */}
                      <div className="mt-1 flex gap-3 text-[11px] text-text-muted">
                        {["p", "c", "g"].map((k) => {
                          const macros = log?.usedPlan ? meal.macros : (log?.customMacros ?? meal.macros);
                          const labels: Record<string, string> = { p: "Prot", c: "Carb", g: "Gord" };
                          return (
                            <span key={k}>{labels[k]}: {(macros as Record<string, number>)[k]}g</span>
                          );
                        })}
                      </div>

                      {/* Expanded items */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-1.5"
                          >
                            {meal.items.map((item) => (
                              <div key={item.name} className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-1.5 text-xs">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-text-muted">{item.qty} · {item.macros.kcal} kcal</span>
                              </div>
                            ))}
                            {meal.note && (
                              <p className="px-1 text-[11px] text-text-muted italic">{meal.note}</p>
                            )}

                            {/* Actions */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {!isDifferent && (
                                <button
                                  onClick={() => setDifferentMode(meal.id)}
                                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-c-amber hover:border-c-amber/40"
                                >
                                  Comi diferente
                                </button>
                              )}
                              {isDone && (
                                <button
                                  onClick={() => resetMeal(meal.id)}
                                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-error"
                                >
                                  <RotateCcw size={11} /> Desfazer
                                </button>
                              )}
                            </div>

                            {/* "Comi diferente" form */}
                            <AnimatePresence>
                              {isDifferent && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-2 rounded-xl border border-c-amber/30 bg-surface-2/60 p-3"
                                >
                                  <p className="text-xs font-semibold text-c-amber">O que você comeu?</p>
                                  <textarea
                                    autoFocus
                                    placeholder="Descreva o que comeu (ex: 2 ovos mexidos, 1 fatia de pão)..."
                                    value={form.description}
                                    onChange={(e) => setDifferentForms((p) => ({ ...p, [meal.id]: { ...form, description: e.target.value } }))}
                                    className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-c-amber/60"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    {[
                                      { key: "kcal", label: "kcal" },
                                      { key: "p", label: "P (g)" },
                                      { key: "c", label: "C (g)" },
                                      { key: "g", label: "G (g)" },
                                    ].map(({ key, label }) => (
                                      <input
                                        key={key}
                                        type="number"
                                        placeholder={label}
                                        value={(form as Record<string, string>)[key]}
                                        onChange={(e) => setDifferentForms((p) => ({ ...p, [meal.id]: { ...form, [key]: e.target.value } }))}
                                        className="w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs outline-none"
                                      />
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-text-muted">kcal e macros opcionais — deixe vazio para usar os valores do plano</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveDifferent(meal.id)}
                                      className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white"
                                      style={{ background: "var(--c-amber)" }}
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      onClick={() => setDifferentMode(null)}
                                      className="rounded-lg border border-border px-3 text-xs text-text-muted"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ─── ESTOQUE ────────────────────────────────────────────────────────── */}
      {tab === "estoque" && (
        <>
          {alertCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              <AlertTriangle size={16} />
              {alertCount} {alertCount === 1 ? "item está" : "itens estão"} com estoque baixo
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stock.map((s) => {
              const isLow = s.current <= s.alertAt;
              const isEditing = editingStock === s.id;
              const pctFull = s.weeklyNeeded > 0 ? pct(s.current, s.weeklyNeeded) : 100;
              const alreadyInList = shopping.some((i) => i.stockId === s.id && !i.done);

              return (
                <Card key={s.id} className={isLow ? "border-warning/40" : ""}>
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        {isLow && <AlertTriangle size={13} className="shrink-0 text-warning" />}
                      </div>

                      {/* Current quantity */}
                      {isEditing ? (
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            autoFocus
                            type="number"
                            value={editStockVal}
                            onChange={(e) => setEditStockVal(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveStockEdit(s.id)}
                            className="w-20 rounded-lg border border-c-green/50 bg-surface px-2 py-1 text-sm outline-none"
                          />
                          <span className="text-xs text-text-muted">{s.unit}</span>
                          <button onClick={() => saveStockEdit(s.id)} className="text-c-green">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditingStock(null)} className="text-text-muted">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingStock(s.id); setEditStockVal(String(s.current)); }}
                          className="group mt-1 flex items-center gap-1 text-sm"
                        >
                          <span className={`font-bold ${isLow ? "text-warning" : "text-text"}`}>
                            {s.current}
                          </span>
                          <span className="text-xs text-text-muted">/ {s.weeklyNeeded} {s.unit}</span>
                          <Pencil size={11} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}

                      <div className="mt-1.5">
                        <ProgressBar value={pctFull} color={isLow ? "var(--warning)" : "var(--c-green)"} />
                      </div>

                      {s.alertAt > 0 && (
                        <p className="mt-1 text-[10px] text-text-muted">Alerta em: {s.alertAt} {s.unit}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => addToShoppingList(s)}
                        disabled={alreadyInList}
                        title={alreadyInList ? "Já na lista" : "Adicionar à lista de compras"}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border text-text-muted hover:text-c-green hover:border-c-green/40 disabled:opacity-30 transition-all"
                      >
                        <ShoppingCart size={13} />
                      </button>
                      <button
                        onClick={() => deleteStock(s.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border text-text-muted hover:text-error hover:border-error/40 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add stock item */}
          <Card>
            <SectionTitle>Adicionar alimento ao estoque</SectionTitle>
            <AnimatePresence>
              {addingStock ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      placeholder="Nome do alimento"
                      value={newStock.name}
                      onChange={(e) => setNewStock((p) => ({ ...p, name: e.target.value }))}
                      className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-c-green/60"
                    />
                    <input
                      placeholder="emoji"
                      value={newStock.emoji}
                      onChange={(e) => setNewStock((p) => ({ ...p, emoji: e.target.value }))}
                      className="w-16 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none text-center"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Unidade (g, un, cx...)" value={newStock.unit}
                      onChange={(e) => setNewStock((p) => ({ ...p, unit: e.target.value }))}
                      className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none" />
                    <input type="number" placeholder="Atual" value={newStock.current}
                      onChange={(e) => setNewStock((p) => ({ ...p, current: e.target.value }))}
                      className="w-24 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none" />
                    <input type="number" placeholder="Semanal" value={newStock.weeklyNeeded}
                      onChange={(e) => setNewStock((p) => ({ ...p, weeklyNeeded: e.target.value }))}
                      className="w-24 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none" />
                    <input type="number" placeholder="Alerta" value={newStock.alertAt}
                      onChange={(e) => setNewStock((p) => ({ ...p, alertAt: e.target.value }))}
                      className="w-24 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addStockItem}
                      className="flex-1 rounded-xl py-2 text-sm font-semibold text-white"
                      style={{ background: "var(--c-green)" }}>
                      Adicionar
                    </button>
                    <button onClick={() => setAddingStock(false)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted">
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setAddingStock(true)}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted hover:border-c-green/50 hover:text-c-green transition-colors">
                  <Plus size={15} /> Novo alimento
                </button>
              )}
            </AnimatePresence>
          </Card>
        </>
      )}

      {/* ─── COMPRAS ────────────────────────────────────────────────────────── */}
      {tab === "compras" && (
        <>
          <p className="text-xs text-text-muted px-1">
            Quando você marcar um item como comprado, a quantidade é automaticamente adicionada ao estoque.
          </p>

          {/* Pending items */}
          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <ShoppingCart size={15} style={{ color: "var(--c-green)" }} />
                  Para comprar ({pendingShopping})
                </span>
              </SectionTitle>
              {shopping.some((i) => i.done) && (
                <button onClick={clearDoneShopping}
                  className="text-xs text-text-muted hover:text-error underline">
                  Limpar concluídos
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {shopping.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted">Lista vazia 🎉</p>
              )}
              {shopping.map((item) => (
                <div key={item.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                    item.done ? "border-border/50 opacity-50" : item.auto ? "border-warning/30 bg-warning/5" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => {
                      if (item.done) return;
                      setCompletingId(item.id);
                      setCompletingQty(String(item.qty));
                    }}
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] transition-all ${
                      item.done ? "border-c-green bg-c-green text-white" : "border-border-strong text-transparent hover:border-c-green/60"
                    }`}
                  >
                    ✓
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium ${item.done ? "line-through" : ""}`}>{item.name}</p>
                      {item.auto && !item.done && (
                        <Badge color="var(--warning)">estoque zerou</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {item.qty} {item.unit}
                      {item.stockId && ` · vinculado ao estoque`}
                    </p>
                  </div>

                  <button onClick={() => deleteShoppingItem(item.id)}
                    className="text-text-muted hover:text-error">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Complete modal */}
            <AnimatePresence>
              {completingId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                  onClick={() => setCompletingId(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-80 rounded-2xl border border-border bg-surface p-5 shadow-xl"
                  >
                    <p className="font-semibold">Quanto você comprou?</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {shopping.find((i) => i.id === completingId)?.name} ·{" "}
                      {shopping.find((i) => i.id === completingId)?.unit}
                    </p>
                    <input
                      autoFocus
                      type="number"
                      value={completingQty}
                      onChange={(e) => setCompletingQty(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && completeShoppingItem(completingId)}
                      className="mt-3 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-c-green/60"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => completeShoppingItem(completingId)}
                        className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                        style={{ background: "var(--c-green)" }}
                      >
                        Confirmar compra
                      </button>
                      <button onClick={() => setCompletingId(null)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted">
                        <X size={15} />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add item form */}
            <AnimatePresence>
              {addingShopping ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      placeholder="Nome do item..."
                      value={newShopping.name}
                      onChange={(e) => setNewShopping((p) => ({ ...p, name: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addShoppingItem()}
                      className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-c-green/60"
                    />
                    <input type="number" placeholder="Qtd" value={newShopping.qty}
                      onChange={(e) => setNewShopping((p) => ({ ...p, qty: e.target.value }))}
                      className="w-20 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none" />
                    <input placeholder="un" value={newShopping.unit}
                      onChange={(e) => setNewShopping((p) => ({ ...p, unit: e.target.value }))}
                      className="w-16 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none" />
                  </div>
                  <select
                    value={newShopping.stockId}
                    onChange={(e) => setNewShopping((p) => ({ ...p, stockId: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">Sem vínculo com estoque</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={addShoppingItem}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                      style={{ background: "var(--c-green)" }}>
                      Adicionar à lista
                    </button>
                    <button onClick={() => setAddingShopping(false)}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-border text-text-muted">
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setAddingShopping(true)}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-muted hover:border-c-green/50 hover:text-c-green transition-colors">
                  <Plus size={15} /> Adicionar item à lista
                </button>
              )}
            </AnimatePresence>
          </Card>
        </>
      )}

      {/* ─── MEDIDAS ────────────────────────────────────────────────────────── */}
      {tab === "medidas" && (
        <>
          {isSunday() && (
            <div className="flex items-center gap-2 rounded-xl border border-c-green/30 bg-c-green/10 px-4 py-3 text-sm font-semibold text-c-green">
              📏 Hoje é domingo — hora de medir!
            </div>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle>
                <span className="flex items-center gap-2">
                  <Scale size={15} style={{ color: "var(--c-green)" }} />
                  {todayMeasurement ? "Medidas de hoje (registradas)" : "Registrar medidas de hoje"}
                </span>
              </SectionTitle>
              <button
                onClick={exportNutritionData}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text"
              >
                <Download size={13} /> Exportar para nutricionista
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { key: "weight", label: "Peso", unit: "kg" },
                { key: "waist", label: "Cintura", unit: "cm" },
                { key: "hip", label: "Quadril", unit: "cm" },
                { key: "arm", label: "Braço", unit: "cm" },
                { key: "thigh", label: "Coxa", unit: "cm" },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-text-muted">{label} ({unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={(newM as Record<string, string>)[key]}
                    onChange={(e) => setNewM((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-c-green/60"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveMeasurement}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--c-green)" }}
            >
              {todayMeasurement ? "Atualizar medidas de hoje" : "Salvar medidas"}
            </button>
          </Card>

          {/* History */}
          {measurements.length > 0 && (
            <Card>
              <SectionTitle>Histórico de medidas</SectionTitle>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-text-muted">
                      <th className="pb-2 pr-4">Data</th>
                      <th className="pb-2 pr-4">Peso (kg)</th>
                      <th className="pb-2 pr-4">Cintura</th>
                      <th className="pb-2 pr-4">Quadril</th>
                      <th className="pb-2 pr-4">Braço</th>
                      <th className="pb-2">Coxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m) => (
                      <tr key={m.date} className={`border-b border-border/50 ${m.date === today ? "font-semibold" : ""}`}>
                        <td className="py-2 pr-4 text-text-muted">{formatDate(m.date)}</td>
                        <td className="py-2 pr-4">{m.weight ?? "—"}</td>
                        <td className="py-2 pr-4">{m.waist ? `${m.waist} cm` : "—"}</td>
                        <td className="py-2 pr-4">{m.hip ? `${m.hip} cm` : "—"}</td>
                        <td className="py-2 pr-4">{m.arm ? `${m.arm} cm` : "—"}</td>
                        <td className="py-2">{m.thigh ? `${m.thigh} cm` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
