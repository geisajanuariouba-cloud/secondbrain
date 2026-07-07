// ─── Types ───────────────────────────────────────────────────────────────────

export type Macros = { p: number; c: number; g: number; kcal: number };

export type MealItem = {
  name: string;
  qty: string;
  macros: Macros;
  stockId?: string | null;
  deduct?: number;
};

export type PlannedMeal = {
  id: string;
  time: string;
  name: string;
  emoji: string;
  macros: Macros;
  items: MealItem[];
  onlyTraining?: boolean;
  optional?: boolean;
  note?: string;
};

export type StockItem = {
  id: string;
  name: string;
  unit: string;
  current: number;
  weeklyNeeded: number;
  alertAt: number;
  emoji: string;
};

export type FoodShoppingItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  stockId?: string;
  done: boolean;
  addedAt: string;
  completedAt?: string;
  auto?: boolean; // true = added automatically when stock ran out
};

export type MealLogEntry = {
  done: boolean;
  usedPlan: boolean; // false = comi diferente
  doneAt?: string;
  note?: string;
  customDescription?: string;
  customMacros?: Macros;
};

export type Measurements = {
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  waist?: number; // cm
  hip?: number; // cm
  arm?: number; // cm
  thigh?: number; // cm
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function m(p: number, c: number, g: number): Macros {
  return { p, c, g, kcal: Math.round(p * 4 + c * 4 + g * 9) };
}

export function addMacros(a: Macros, b: Macros): Macros {
  return { p: a.p + b.p, c: a.c + b.c, g: a.g + b.g, kcal: a.kcal + b.kcal };
}

export function zeroMacros(): Macros {
  return { p: 0, c: 0, g: 0, kcal: 0 };
}

// ─── Plano Alimentar ─────────────────────────────────────────────────────────

export const MEAL_PLAN: PlannedMeal[] = [
  {
    id: "suplementacao",
    time: "04:00",
    name: "Suplementação",
    emoji: "💊",
    macros: m(0, 0, 0),
    items: [
      { name: "Ferro Quelato", qty: "1 cápsula", macros: m(0, 0, 0) },
      { name: "Vitamina C efervescente", qty: "1 comprimido", macros: m(0, 0, 0) },
      { name: "Vitamina D", qty: "1 cápsula", macros: m(0, 0, 0) },
      { name: "Glutamina", qty: "5g (1 colher)", macros: m(0, 0, 0) },
      { name: "Termogênico", qty: "1 cápsula", macros: m(0, 0, 0) },
      { name: "BCAA", qty: "5g (1 colher)", macros: m(0, 0, 0) },
    ],
  },
  {
    id: "cafe-manha",
    time: "06:00",
    name: "Café da manhã",
    emoji: "☀️",
    macros: m(21, 44, 17),
    items: [
      { name: "Pão francês", qty: "1 unidade (50g)", macros: m(4, 25, 1), stockId: "pao-frances", deduct: 1 },
      { name: "Queijo minas", qty: "1 fatia (30g)", macros: m(6, 1, 4), stockId: "queijo", deduct: 30 },
      { name: "Ovo com temperos", qty: "1 unidade", macros: m(6, 0, 5), stockId: "ovos", deduct: 1 },
      { name: "Bacon", qty: "1 fatia (20g)", macros: m(4, 0, 7) },
      { name: "Fruta (banana/maçã/morango)", qty: "1 porção", macros: m(1, 18, 0) },
      { name: "Cafeína", qty: "1 dose", macros: m(0, 0, 0) },
    ],
    note: "~415 kcal · P:21g · C:44g · G:17g",
  },
  {
    id: "lanche-manha",
    time: "09:30",
    name: "Lanche da manhã",
    emoji: "🍎",
    macros: m(7, 30, 3),
    items: [
      { name: "Salada de frutas", qty: "150g", macros: m(1, 22, 0) },
      { name: "Iogurte natural", qty: "100g", macros: m(6, 8, 3) },
    ],
    note: "Ou barrinha de cereal/proteína (~150 kcal)",
  },
  {
    id: "pre-treino",
    time: "11:30",
    name: "Pré-treino",
    emoji: "⚡",
    macros: m(1, 40, 0),
    items: [
      { name: "Banana", qty: "1 unidade", macros: m(1, 23, 0), stockId: "banana", deduct: 1 },
      { name: "Mel (opcional)", qty: "1 colher de sopa", macros: m(0, 17, 0) },
    ],
    onlyTraining: true,
    note: "Ou 2 barrinhas de cereal (~300 kcal)",
  },
  {
    id: "almoco",
    time: "13:00",
    name: "Almoço",
    emoji: "🍛",
    macros: m(44, 76, 13),
    items: [
      { name: "Arroz cozido", qty: "100g", macros: m(3, 28, 0) },
      { name: "Feijão cozido", qty: "100g", macros: m(8, 14, 1) },
      { name: "Músculo moído", qty: "150g", macros: m(30, 0, 12), stockId: "musculo-moido", deduct: 150 },
      { name: "Legumes (cenoura + abóbora + inhame)", qty: "100g mix", macros: m(2, 14, 0), stockId: "cenoura", deduct: 34 },
      { name: "Alface", qty: "à vontade", macros: m(1, 2, 0) },
      { name: "Suco natural", qty: "1 copo (200ml)", macros: m(1, 20, 0) },
    ],
    note: "Músculo moído, fígado ou bife · ~597 kcal · P:44g · C:76g · G:13g",
  },
  {
    id: "cafe-tarde",
    time: "15:30",
    name: "Café da tarde",
    emoji: "🍗",
    macros: m(36, 43, 5),
    items: [
      { name: "Frango grelhado", qty: "100g", macros: m(31, 0, 4), stockId: "frango", deduct: 100 },
      { name: "Pão francês", qty: "1 unidade (50g)", macros: m(4, 25, 1), stockId: "pao-frances", deduct: 1 },
      { name: "Alface", qty: "à vontade", macros: m(1, 2, 0) },
      { name: "Fruta (maçã/morango/uva)", qty: "1 porção", macros: m(1, 18, 0) },
    ],
    note: "Ou 2 ovos com temperos + queijo · ~361 kcal · P:36g · C:43g · G:5g",
  },
  {
    id: "jantar",
    time: "18:00",
    name: "Jantar",
    emoji: "🌙",
    macros: m(31, 64, 16),
    items: [
      { name: "Purê de batata", qty: "200g (com creme de leite)", macros: m(4, 34, 6), stockId: "batata", deduct: 200 },
      { name: "Músculo moído", qty: "120g", macros: m(24, 0, 10), stockId: "musculo-moido", deduct: 120 },
      { name: "Legumes + alface", qty: "100g", macros: m(2, 10, 0) },
      { name: "Suco natural", qty: "1 copo (200ml)", macros: m(1, 20, 0) },
      { name: "Melatonina (19:00)", qty: "1 cápsula", macros: m(0, 0, 0) },
    ],
    note: "Ou 150g de frango · ~524 kcal · P:31g · C:64g · G:16g",
  },
  {
    id: "ceia",
    time: "20:00",
    name: "Ceia",
    emoji: "🌕",
    macros: m(2, 22, 0),
    items: [
      { name: "Salada de frutas", qty: "1 tigela pequena", macros: m(2, 22, 0) },
    ],
    optional: true,
    note: "Só se estiver com fome · Ou barrinha de cereal/proteína",
  },
];

// ─── Estoque inicial (semana completa) ───────────────────────────────────────

export const INITIAL_STOCK: StockItem[] = [
  { id: "pao-frances", name: "Pão francês", unit: "un", current: 14, weeklyNeeded: 14, alertAt: 4, emoji: "🍞" },
  { id: "pao-integral", name: "Pão integral Milani", unit: "un", current: 7, weeklyNeeded: 7, alertAt: 2, emoji: "🍞" },
  { id: "musculo-moido", name: "Músculo moído", unit: "g", current: 2000, weeklyNeeded: 2000, alertAt: 400, emoji: "🥩" },
  { id: "ovos", name: "Ovos", unit: "un", current: 14, weeklyNeeded: 14, alertAt: 4, emoji: "🥚" },
  { id: "frango", name: "Filé de frango", unit: "g", current: 700, weeklyNeeded: 700, alertAt: 150, emoji: "🍗" },
  { id: "batata", name: "Batata inglesa", unit: "g", current: 1500, weeklyNeeded: 1500, alertAt: 300, emoji: "🥔" },
  { id: "abobora", name: "Abóbora jacaré", unit: "g", current: 500, weeklyNeeded: 500, alertAt: 100, emoji: "🎃" },
  { id: "cenoura", name: "Cenoura", unit: "g", current: 500, weeklyNeeded: 500, alertAt: 100, emoji: "🥕" },
  { id: "inhame", name: "Inhame", unit: "g", current: 500, weeklyNeeded: 500, alertAt: 100, emoji: "🫚" },
  { id: "laranja", name: "Laranja", unit: "un", current: 5, weeklyNeeded: 5, alertAt: 2, emoji: "🍊" },
  { id: "maracuja", name: "Maracujá", unit: "un", current: 4, weeklyNeeded: 4, alertAt: 1, emoji: "🫐" },
  { id: "abacaxi", name: "Abacaxi", unit: "un", current: 1, weeklyNeeded: 1, alertAt: 0, emoji: "🍍" },
  { id: "melancia", name: "Melancia", unit: "kg", current: 2, weeklyNeeded: 2, alertAt: 0.5, emoji: "🍉" },
  { id: "limao", name: "Limão", unit: "un", current: 5, weeklyNeeded: 5, alertAt: 2, emoji: "🍋" },
  { id: "couve", name: "Couve", unit: "maço", current: 1, weeklyNeeded: 1, alertAt: 0, emoji: "🥬" },
  { id: "gengibre", name: "Gengibre", unit: "un", current: 1, weeklyNeeded: 1, alertAt: 0, emoji: "🫚" },
  { id: "hortela", name: "Hortelã", unit: "ramo", current: 1, weeklyNeeded: 1, alertAt: 0, emoji: "🌿" },
  { id: "banana", name: "Banana", unit: "un", current: 14, weeklyNeeded: 14, alertAt: 4, emoji: "🍌" },
  { id: "maca", name: "Maçã", unit: "un", current: 7, weeklyNeeded: 7, alertAt: 2, emoji: "🍎" },
  { id: "uva", name: "Uva", unit: "cacho", current: 2, weeklyNeeded: 2, alertAt: 0, emoji: "🍇" },
  { id: "morango", name: "Morango", unit: "bandeja", current: 2, weeklyNeeded: 2, alertAt: 0, emoji: "🍓" },
  { id: "acerola", name: "Acerola", unit: "un", current: 20, weeklyNeeded: 20, alertAt: 4, emoji: "🍒" },
  { id: "aveia", name: "Farinha de aveia", unit: "g", current: 250, weeklyNeeded: 250, alertAt: 50, emoji: "🌾" },
  { id: "granola", name: "Granola premium", unit: "g", current: 100, weeklyNeeded: 100, alertAt: 20, emoji: "🌾" },
  { id: "queijo", name: "Queijo minas", unit: "g", current: 300, weeklyNeeded: 300, alertAt: 50, emoji: "🧀" },
  { id: "creme-leite", name: "Creme de leite", unit: "cx", current: 2, weeklyNeeded: 2, alertAt: 0, emoji: "🥛" },
  { id: "azeite", name: "Azeite", unit: "ml", current: 50, weeklyNeeded: 50, alertAt: 10, emoji: "🫒" },
];

// ─── Macros diários totais do plano ──────────────────────────────────────────

export const DAILY_GOAL: Macros = MEAL_PLAN
  .filter((m) => !m.onlyTraining && !m.optional)
  .reduce((acc, meal) => addMacros(acc, meal.macros), zeroMacros());
