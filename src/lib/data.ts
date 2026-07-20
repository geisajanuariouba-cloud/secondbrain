/**
 * Camada de dados — espelha a estrutura real do Notion "Second Brain".
 * Estes dados de exemplo serão substituídos pela migração real (Supabase/Prisma).
 */

export type SubjectKey =
  | "matematica" | "portugues" | "redacao" | "literatura" | "historia"
  | "geografia" | "biologia" | "fisica" | "quimica" | "ingles"
  | "sociologia" | "filosofia" | "atualidades";

export type Subject = {
  key: SubjectKey;
  name: string;
  color: string; // css var
  hours: number;
  questions: number;
  correct: number;
  pendingRevisions: number;
  mastery: number; // 0-100
};

export const SUBJECTS: Subject[] = [
  { key: "matematica", name: "Matemática", color: "var(--c-pink)", hours: 24.5, questions: 420, correct: 357, pendingRevisions: 3, mastery: 78 },
  { key: "portugues", name: "Português", color: "var(--c-amber)", hours: 12.0, questions: 210, correct: 184, pendingRevisions: 1, mastery: 84 },
  { key: "redacao", name: "Redação", color: "var(--c-blue)", hours: 9.5, questions: 18, correct: 16, pendingRevisions: 0, mastery: 72 },
  { key: "literatura", name: "Literatura", color: "var(--secondary)", hours: 8.0, questions: 96, correct: 77, pendingRevisions: 2, mastery: 69 },
  { key: "historia", name: "História", color: "var(--text-secondary)", hours: 14.0, questions: 240, correct: 199, pendingRevisions: 2, mastery: 75 },
  { key: "geografia", name: "Geografia", color: "var(--warning)", hours: 11.0, questions: 188, correct: 156, pendingRevisions: 1, mastery: 73 },
  { key: "biologia", name: "Biologia", color: "var(--secondary)", hours: 18.5, questions: 310, correct: 270, pendingRevisions: 4, mastery: 81 },
  { key: "fisica", name: "Física", color: "var(--c-rose)", hours: 20.0, questions: 280, correct: 210, pendingRevisions: 5, mastery: 64 },
  { key: "quimica", name: "Química", color: "var(--accent)", hours: 16.0, questions: 256, correct: 205, pendingRevisions: 3, mastery: 70 },
  { key: "ingles", name: "Inglês", color: "var(--danger)", hours: 6.0, questions: 80, correct: 72, pendingRevisions: 0, mastery: 88 },
  { key: "sociologia", name: "Sociologia", color: "var(--c-green)", hours: 4.0, questions: 60, correct: 51, pendingRevisions: 1, mastery: 79 },
  { key: "filosofia", name: "Filosofia", color: "var(--c-lilac)", hours: 4.5, questions: 64, correct: 52, pendingRevisions: 1, mastery: 76 },
  { key: "atualidades", name: "Atualidades", color: "var(--c-cyan)", hours: 5.0, questions: 24, correct: 21, pendingRevisions: 0, mastery: 80 },
];

// ---- Conteúdos (DB Conteúdos) ----
export type Content = {
  id: string;
  name: string;
  subject: SubjectKey;
  steps: { aula: boolean; leitura: boolean; exercicios: boolean; revisao: boolean; dominio: boolean };
  questions: number;
  correct: number;
  week: string;
};

export const CONTENTS: Content[] = [
  { id: "c1", name: "Energia e suas transformações", subject: "fisica", steps: { aula: true, leitura: true, exercicios: true, revisao: false, dominio: false }, questions: 32, correct: 24, week: "Sem 26" },
  { id: "c2", name: "Funções da linguagem", subject: "portugues", steps: { aula: true, leitura: true, exercicios: true, revisao: true, dominio: true }, questions: 40, correct: 37, week: "Sem 26" },
  { id: "c3", name: "Citologia", subject: "biologia", steps: { aula: true, leitura: true, exercicios: false, revisao: false, dominio: false }, questions: 18, correct: 15, week: "Sem 26" },
  { id: "c4", name: "Propriedades da matéria", subject: "quimica", steps: { aula: true, leitura: false, exercicios: false, revisao: false, dominio: false }, questions: 0, correct: 0, week: "Sem 26" },
  { id: "c5", name: "Geografia econômica", subject: "geografia", steps: { aula: true, leitura: true, exercicios: true, revisao: true, dominio: false }, questions: 28, correct: 23, week: "Sem 25" },
  { id: "c6", name: "Egito Antigo", subject: "historia", steps: { aula: true, leitura: true, exercicios: true, revisao: false, dominio: false }, questions: 22, correct: 19, week: "Sem 25" },
  { id: "c7", name: "Mecânica", subject: "fisica", steps: { aula: true, leitura: true, exercicios: true, revisao: true, dominio: true }, questions: 45, correct: 38, week: "Sem 24" },
  { id: "c8", name: "Álgebra", subject: "matematica", steps: { aula: true, leitura: true, exercicios: true, revisao: false, dominio: false }, questions: 50, correct: 42, week: "Sem 26" },
];

// ---- Tarefas ----
export type Task = {
  id: string;
  name: string;
  subject?: SubjectKey;
  type: "Tarefa" | "Trabalho" | "Apresentação";
  status: "Não iniciada" | "Em andamento" | "Concluído";
  date: string;
};

export const TASKS: Task[] = [
  { id: "t1", name: "Lista de exercícios de Mecânica", subject: "fisica", type: "Tarefa", status: "Em andamento", date: "2026-06-29" },
  { id: "t2", name: "Resumo de Citologia", subject: "biologia", type: "Tarefa", status: "Não iniciada", date: "2026-06-30" },
  { id: "t3", name: "Redação dissertativa — tecnologia", subject: "redacao", type: "Trabalho", status: "Não iniciada", date: "2026-06-29" },
  { id: "t4", name: "Apresentação de Sociologia", subject: "sociologia", type: "Apresentação", status: "Concluído", date: "2026-06-27" },
];

// ---- Cronograma semanal (DB Cronograma) ----
export const WEEKLY_SCHEDULE: Record<string, string[]> = {
  Segunda: ["Física", "Matemática"],
  Terça: ["Biologia", "História", "Filosofia"],
  Quarta: ["Linguagens", "Inglês", "Literatura"],
  Quinta: ["História", "Português", "Geografia"],
  Sexta: ["Química", "Física", "Biologia"],
  Sábado: ["Redação", "Atualidades", "Oratória"],
  Domingo: ["Simulado", "Revisão geral"],
};

// ---- Revisões (TAB / Anki) ----
export type Revision = {
  id: string;
  content: string;
  subject: SubjectKey;
  date: string;
  type: "TAB" | "Anki";
  due: boolean;
};

export const REVISIONS: Revision[] = [
  { id: "r1", content: "Citologia — organelas", subject: "biologia", date: "2026-06-28", type: "Anki", due: true },
  { id: "r2", content: "Energia — termodinâmica", subject: "fisica", date: "2026-06-28", type: "TAB", due: true },
  { id: "r3", content: "Álgebra — funções", subject: "matematica", date: "2026-06-29", type: "Anki", due: false },
  { id: "r4", content: "Egito Antigo", subject: "historia", date: "2026-06-30", type: "TAB", due: false },
];

// ---- Simulados ----
export type Simulation = {
  id: string;
  name: string;
  type: "ENEM" | "FUVEST" | "PISM" | "PLATAFORMA ASSAAD" | "POLIEDRO" | "SAS";
  date: string;
  total: number;
  correct: number;
};

export const SIMULATIONS: Simulation[] = [
  { id: "s1", name: "Simulado ENEM #4", type: "ENEM", date: "2026-06-22", total: 180, correct: 142 },
  { id: "s2", name: "FUVEST 1ª fase", type: "FUVEST", date: "2026-06-15", total: 90, correct: 64 },
  { id: "s3", name: "Poliedro Mensal", type: "POLIEDRO", date: "2026-06-08", total: 90, correct: 70 },
  { id: "s4", name: "Simulado ENEM #3", type: "ENEM", date: "2026-05-25", total: 180, correct: 131 },
];

// ---- Vestibulares (countdown) ----
export type Vestibular = { id: string; name: string; date: string; methods: string[] };
export const VESTIBULARES: Vestibular[] = [
  { id: "v1", name: "ENEM", date: "2026-11-08", methods: ["ENEM"] },
  { id: "v2", name: "FUVEST 1ª fase", date: "2026-11-22", methods: ["Vestibular próprio"] },
  { id: "v3", name: "PISM", date: "2026-10-18", methods: ["PISM"] },
  { id: "v4", name: "UNICAMP", date: "2026-11-15", methods: ["Vestibular próprio"] },
];

// ---- Obras literárias ----
export type LiteraryWork = { id: string; name: string; author: string; school: string; read: boolean; vestibular: string[] };
export const LITERARY_WORKS: LiteraryWork[] = [
  { id: "o1", name: "Dom Casmurro", author: "Machado de Assis", school: "Realismo", read: true, vestibular: ["Fuvest", "Unicamp"] },
  { id: "o2", name: "A Hora da Estrela", author: "Clarice Lispector", school: "Modernismo 3ª Geração", read: true, vestibular: ["Fuvest"] },
  { id: "o3", name: "Vidas Secas", author: "Érico Veríssimo", school: "Modernismo 2ª Geração", read: false, vestibular: ["Unicamp", "PISM"] },
  { id: "o4", name: "Quarto de Despejo", author: "Conceição Evaristo", school: "Literatura Contemporânea", read: false, vestibular: ["Fuvest", "PAS"] },
];

// ---- Artigos (Lista de Leitura) ----
export type Article = { id: string; title: string; read: boolean; rating: number };
export const ARTICLES: Article[] = [
  { id: "a1", title: "Inteligência artificial e o mercado de trabalho", read: true, rating: 4 },
  { id: "a2", title: "Crise hídrica no Brasil", read: false, rating: 0 },
  { id: "a3", title: "Saúde mental na adolescência", read: true, rating: 5 },
];

// ---- Rotina ----
export type Activity = {
  id: string;
  name: string;
  timeOfDay: "Manhã" | "Tarde" | "Noite";
  category: "Estudos" | "Self care" | "Meter o shape" | "Aproximar de Deus" | "Trabalho" | "Lazer";
  done: boolean;
  time?: string;
};

export const ACTIVITIES: Activity[] = [
  { id: "ac1", name: "Oração e leitura", timeOfDay: "Manhã", category: "Aproximar de Deus", done: true, time: "06:30" },
  { id: "ac2", name: "Academia — Treino A", timeOfDay: "Manhã", category: "Meter o shape", done: true, time: "07:30" },
  { id: "ac3", name: "Bloco de estudo — Física", timeOfDay: "Manhã", category: "Estudos", done: false, time: "09:00" },
  { id: "ac4", name: "Bloco de estudo — Matemática", timeOfDay: "Tarde", category: "Estudos", done: false, time: "14:00" },
  { id: "ac5", name: "Skincare", timeOfDay: "Noite", category: "Self care", done: false, time: "21:00" },
  { id: "ac6", name: "Revisão Anki", timeOfDay: "Noite", category: "Estudos", done: false, time: "22:00" },
  { id: "ac7", name: "Salão — atendimento", timeOfDay: "Tarde", category: "Trabalho", done: false, time: "16:00" },
];

// ---- Financeiro ----
export type Transaction = {
  id: string;
  name: string;
  value: number;
  type: "Receita" | "Gasto fixo" | "Gasto variável" | "Reserva" | "Empréstimo(Entrada)" | "Empréstimo(Retirada)";
  category?: string;
  date: string;
  account?: string;
  pending?: boolean;
};

export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  type: "Corrente" | "Poupança" | "Digital" | "Empresarial";
  balance: number;
  color: string;
  emoji: string;
};

export const DEFAULT_ACCOUNTS: BankAccount[] = [
  { id: "acc-inter-pessoal",  name: "Inter Pessoal",  bank: "Banco Inter", type: "Corrente",   balance: 0, color: "var(--c-amber)",  emoji: "🟠" },
  { id: "acc-inter-poupanca", name: "Inter Poupança", bank: "Banco Inter", type: "Poupança",   balance: 0, color: "var(--c-green)",  emoji: "💚" },
  { id: "acc-nubank",         name: "Nubank",         bank: "Nubank",      type: "Digital",    balance: 0, color: "var(--c-lilac)",  emoji: "💜" },
  { id: "acc-kast",           name: "Kast",           bank: "Kast",        type: "Digital",    balance: 0, color: "var(--c-cyan)",   emoji: "🩵" },
  { id: "acc-ton",            name: "Ton (Salão)",    bank: "Ton",         type: "Empresarial",balance: 0, color: "var(--c-rose)",   emoji: "🩷" },
  { id: "acc-pagbank",        name: "PagBank",        bank: "PagBank",     type: "Digital",    balance: 0, color: "var(--secondary)",emoji: "🔵" },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "f1", name: "Salão — comissão", value: 1200, type: "Receita", category: "Salão", date: "2026-06-05" },
  { id: "f2", name: "Mesada", value: 400, type: "Receita", category: "Vó", date: "2026-06-01" },
  { id: "f3", name: "Plataforma Assaad", value: 149, type: "Gasto fixo", date: "2026-06-03" },
  { id: "f4", name: "Material de estudo", value: 89, type: "Gasto variável", date: "2026-06-10" },
  { id: "f5", name: "Lanches", value: 120, type: "Gasto variável", date: "2026-06-14" },
  { id: "f6", name: "Reserva de emergência", value: 300, type: "Reserva", date: "2026-06-06" },
  { id: "f7", name: "Academia", value: 99, type: "Gasto fixo", date: "2026-06-02" },
];

// ---- Livros ----
export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string[];
  status: "Lendo" | "Finalizado" | "Próxima Leitura" | "Pausado";
  currentPage: number;
  totalPages: number;
  rating?: number;
};

export const BOOKS: Book[] = [
  { id: "b1", title: "O Poder do Hábito", author: "Charles Duhigg", genre: ["Finanças"], status: "Lendo", currentPage: 180, totalPages: 408, rating: 4 },
  { id: "b2", title: "A Coragem de Ser Imperfeito", author: "Brené Brown", genre: ["Romance"], status: "Próxima Leitura", currentPage: 0, totalPages: 280 },
  { id: "b3", title: "Hábitos Atômicos", author: "James Clear", genre: ["Finanças"], status: "Finalizado", currentPage: 320, totalPages: 320, rating: 5 },
  { id: "b4", title: "A Menina que Roubava Livros", author: "Markus Zusak", genre: ["Ficção"], status: "Pausado", currentPage: 90, totalPages: 480, rating: 4 },
];

// ---- Academia ----
export type WorkoutExercise = { name: string; muscle: string[]; sets: string; category: "A" | "B" | "C" | "D" | "E" };
export const EXERCISES: WorkoutExercise[] = [
  { name: "Agachamento livre", muscle: ["Quadríceps", "Glúteos"], sets: "4x12", category: "A" },
  { name: "Cadeira extensora", muscle: ["Quadríceps"], sets: "3x15", category: "A" },
  { name: "Stiff", muscle: ["Posterior", "Glúteos"], sets: "4x12", category: "A" },
  { name: "Puxada frontal", muscle: ["Costas"], sets: "4x12", category: "B" },
  { name: "Rosca direta", muscle: ["Bíceps"], sets: "3x12", category: "B" },
  { name: "Desenvolvimento", muscle: ["Ombros"], sets: "4x10", category: "C" },
  { name: "Tríceps corda", muscle: ["Tríceps"], sets: "3x15", category: "C" },
  { name: "Abdominal infra", muscle: ["Abdomen"], sets: "4x20", category: "D" },
];

// ---- Metas ----
export type Goal = { id: string; name: string; category: string; current: number; target: number };
export const GOALS: Goal[] = [
  { id: "g1", name: "Horas de estudo no mês", category: "Crescimento Pessoal", current: 168, target: 220 },
  { id: "g2", name: "Questões resolvidas", category: "Crescimento Pessoal", current: 2546, target: 3000 },
  { id: "g3", name: "Reserva financeira", category: "Trabalho", current: 1800, target: 3000 },
  { id: "g4", name: "Livros lidos no ano", category: "Crescimento Pessoal", current: 7, target: 12 },
];

// ---- Hábitos / streak ----
export const STUDY_STREAK = 23; // dias consecutivos
export const WATER_GLASSES = { current: 5, target: 8 };

// ---- Série temporal: horas estudadas por dia (últimos 7 dias) ----
export const STUDY_TREND = [
  { day: "Seg", hours: 5.5, questions: 60 },
  { day: "Ter", hours: 6.0, questions: 72 },
  { day: "Qua", hours: 4.5, questions: 48 },
  { day: "Qui", hours: 7.0, questions: 90 },
  { day: "Sex", hours: 5.0, questions: 55 },
  { day: "Sáb", hours: 8.0, questions: 110 },
  { day: "Dom", hours: 3.5, questions: 40 },
];

// ---- Helpers de agregação ----
export const totals = {
  get hoursWeek() { return STUDY_TREND.reduce((a, b) => a + b.hours, 0); },
  get questionsWeek() { return STUDY_TREND.reduce((a, b) => a + b.questions, 0); },
  get totalQuestions() { return SUBJECTS.reduce((a, b) => a + b.questions, 0); },
  get totalCorrect() { return SUBJECTS.reduce((a, b) => a + b.correct, 0); },
  get accuracy() {
    const q = SUBJECTS.reduce((a, b) => a + b.questions, 0);
    const c = SUBJECTS.reduce((a, b) => a + b.correct, 0);
    return q ? Math.round((c / q) * 100) : 0;
  },
  get pendingRevisions() { return REVISIONS.filter((r) => r.due).length; },
  get balance() {
    return TRANSACTIONS.reduce((acc, t) => {
      if (t.type === "Receita" || t.type === "Empréstimo(Entrada)") return acc + t.value;
      if (t.type.startsWith("Gasto") || t.type === "Empréstimo(Retirada)") return acc - t.value;
      return acc;
    }, 0);
  },
  get income() { return TRANSACTIONS.filter((t) => t.type === "Receita").reduce((a, b) => a + b.value, 0); },
  get expenses() { return TRANSACTIONS.filter((t) => t.type.startsWith("Gasto")).reduce((a, b) => a + b.value, 0); },
};

export function daysUntil(dateStr: string, from = new Date("2026-06-28")) {
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// ---- Água (histórico semanal) ----
export type WaterDay = { date: string; glasses: number; goal: number };
export const WATER_HISTORY: WaterDay[] = [
  { date: "2026-06-22", glasses: 7, goal: 8 },
  { date: "2026-06-23", glasses: 8, goal: 8 },
  { date: "2026-06-24", glasses: 6, goal: 8 },
  { date: "2026-06-25", glasses: 9, goal: 8 },
  { date: "2026-06-26", glasses: 5, goal: 8 },
  { date: "2026-06-27", glasses: 8, goal: 8 },
  { date: "2026-06-28", glasses: 5, goal: 8 },
];

// ---- Alimentação ----
export type Meal = {
  id: string;
  name: string;
  time: string;
  items: string[];
  calories: number;
  done: boolean;
};
export const MEALS_TODAY: Meal[] = [
  { id: "m1", name: "Café da manhã", time: "07:30", items: ["Ovo mexido", "Fruta", "Suco natural"], calories: 380, done: true },
  { id: "m2", name: "Almoço", time: "12:30", items: ["Arroz integral", "Feijão", "Frango grelhado", "Salada"], calories: 650, done: true },
  { id: "m3", name: "Lanche", time: "16:00", items: ["Iogurte com granola", "Banana"], calories: 280, done: false },
  { id: "m4", name: "Jantar", time: "19:30", items: ["Sopa de legumes", "Pão integral"], calories: 400, done: false },
];

// ---- Self Care ----
export type SkinStep = { id: string; name: string; done: boolean };
export const SKINCARE_MORNING: SkinStep[] = [
  { id: "sk-m1", name: "Limpeza facial", done: true },
  { id: "sk-m2", name: "Tônico", done: true },
  { id: "sk-m3", name: "Hidratante", done: true },
  { id: "sk-m4", name: "Protetor solar FPS 50", done: false },
];
export const SKINCARE_EVENING: SkinStep[] = [
  { id: "sk-e1", name: "Demaquilante/limpeza dupla", done: false },
  { id: "sk-e2", name: "Tônico", done: false },
  { id: "sk-e3", name: "Sérum", done: false },
  { id: "sk-e4", name: "Hidratante noturno", done: false },
];
export type MoodEntry = { date: string; mood: 1 | 2 | 3 | 4 | 5; note?: string };
export const MOOD_LOG: MoodEntry[] = [
  { date: "2026-06-22", mood: 4 },
  { date: "2026-06-23", mood: 3, note: "Dia cansativo" },
  { date: "2026-06-24", mood: 5, note: "Simulado foi ótimo!" },
  { date: "2026-06-25", mood: 4 },
  { date: "2026-06-26", mood: 3 },
  { date: "2026-06-27", mood: 4, note: "Academia foi boa" },
  { date: "2026-06-28", mood: 4 },
];
export const GRATITUDE_LOG: { date: string; items: string[] }[] = [
  { date: "2026-06-28", items: ["Família presente", "Saúde", "Oportunidade de estudar"] },
  { date: "2026-06-27", items: ["Amigos", "Música", "Sol bonito"] },
  { date: "2026-06-26", items: ["Academia", "Minha fé", "Dia produtivo"] },
];

// ---- Hobbies ----
export type HobbyProject = {
  id: string;
  name: string;
  description: string;
  status: "Ativo" | "Em pausa" | "Concluído" | "Ideia";
  category: "Negócio" | "Criativo" | "Pessoal";
  color: string;
};
export const HOBBY_PROJECTS: HobbyProject[] = [
  { id: "hp1", name: "Sypoza", description: "Projeto empreendedor em desenvolvimento", status: "Ativo", category: "Negócio", color: "var(--accent)" },
  { id: "hp2", name: "Optimio", description: "Plataforma de organização pessoal", status: "Ativo", category: "Negócio", color: "var(--secondary)" },
  { id: "hp3", name: "Canal de estudos", description: "Gravar aulas com OBS e compartilhar método", status: "Ideia", category: "Criativo", color: "var(--c-rose)" },
  { id: "hp4", name: "Portfólio pessoal", description: "Site com minha trajetória e projetos", status: "Em pausa", category: "Criativo", color: "var(--c-cyan)" },
];
export type MediaItem = {
  id: string;
  title: string;
  type: "Série" | "Filme" | "Anime" | "Documentário";
  status: "Assistindo" | "Finalizado" | "Lista";
  rating?: number;
  genre?: string;
};
export const WATCHLIST: MediaItem[] = [
  { id: "w1", title: "Grey's Anatomy", type: "Série", status: "Assistindo", rating: 5, genre: "Drama médico" },
  { id: "w2", title: "The Bear", type: "Série", status: "Lista", genre: "Drama" },
  { id: "w3", title: "Oppenheimer", type: "Filme", status: "Finalizado", rating: 4, genre: "Histórico" },
  { id: "w4", title: "Fleabag", type: "Série", status: "Lista", genre: "Comédia dramática" },
  { id: "w5", title: "Células ao Trabalho", type: "Anime", status: "Finalizado", rating: 5, genre: "Educativo/Médico" },
];

// ---- Compras & Viagens ----
export type ShoppingItem = {
  id: string;
  name: string;
  category: "Estudos" | "Pessoal" | "Casa" | "Saúde" | "Outros";
  priority: "Alta" | "Média" | "Baixa";
  price?: number;
  bought: boolean;
};
export const SHOPPING_LIST: ShoppingItem[] = [
  { id: "sh1", name: "Caneta marca texto (kit)", category: "Estudos", priority: "Alta", price: 25, bought: false },
  { id: "sh2", name: "Caderno A4 pautado", category: "Estudos", priority: "Alta", price: 30, bought: false },
  { id: "sh3", name: "Protetor solar FPS 50+", category: "Saúde", priority: "Alta", price: 45, bought: false },
  { id: "sh4", name: "Fone de ouvido (para estudos)", category: "Estudos", priority: "Média", price: 120, bought: false },
  { id: "sh5", name: "Sérum vitamina C", category: "Pessoal", priority: "Média", price: 80, bought: true },
  { id: "sh6", name: "Agenda 2027", category: "Estudos", priority: "Baixa", price: 45, bought: false },
];
export type WishlistItem = { id: string; name: string; price?: number; link?: string; priority: "Alta" | "Média" | "Baixa" };
export const WISHLIST: WishlistItem[] = [
  { id: "wi1", name: "iPad para estudos", price: 4500, priority: "Alta" },
  { id: "wi2", name: "Kindle", price: 600, priority: "Alta" },
  { id: "wi3", name: "Tênis de corrida", price: 350, priority: "Média" },
  { id: "wi4", name: "Câmera para vlogs", price: 1800, priority: "Baixa" },
];
export type Trip = {
  id: string;
  destination: string;
  status: "Sonho" | "Planejando" | "Confirmada" | "Realizada";
  date?: string;
  budget?: number;
  notes?: string;
};
export const TRIPS: Trip[] = [
  { id: "tr1", destination: "São Paulo — provas FUVEST", status: "Planejando", date: "2026-11-22", budget: 500, notes: "Hostel perto da USP" },
  { id: "tr2", destination: "Rio de Janeiro", status: "Sonho", budget: 1500 },
  { id: "tr3", destination: "Europa (intercâmbio médico)", status: "Sonho", budget: 15000 },
];

// ---- Vestibulares-alvo ----
export type VestibularTarget = {
  id: string;
  name: string;
  fullName: string;
  university: string[];
  date: string;
  secondDate?: string;
  color: string;
  medicineAvg?: number;
  medicineCutNote?: string;
  phases: number;
  subjects: string[];
  selected: boolean;
  type: string;
  // Per-phase data (seriado vestibulares)
  phaseLabels?: string[];
  phaseDates?: string[];
  phaseSubjects?: string[][];
  phaseContents?: string[];
};

const MOD1_SUBJECTS = ["Biologia", "Química", "Física", "Matemática", "Português", "Literatura", "Redação", "História", "Geografia", "Inglês"];
const MOD1_SUBJECTS_FULL = [...MOD1_SUBJECTS, "Sociologia", "Filosofia"];
const ALL_SUBJECTS = ["Português", "Literatura", "Redação", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Sociologia", "Filosofia", "Inglês"];

// PISM Módulo I — conteúdo verificado via COPESE/UFJF (Módulo I NÃO cobra Filosofia e Sociologia)
const PISM_MOD1 = "Biologia: Estudo da vida, citologia básica (organelas, metabolismo, divisão celular), ecologia introdutória, bioquímica celular, métodos científicos · Física: Cinemática escalar e vetorial (MU/MUV), Dinâmica (Leis de Newton), Trabalho e Energia · Geografia: Cartografia e orientação geográfica, fusos horários, relevo e hidrografia, climatologia · História: Antiguidade Oriental (Egito, Mesopotâmia), Antiguidade Clássica (Grécia e Roma), Feudalismo e Idade Média · Língua Portuguesa: Interpretação de textos, gêneros e tipologias textuais, fonologia, morfologia · Literatura: Elementos do texto literário, gêneros (lírico, narrativo, dramático), figuras de linguagem, Trovadorismo, Humanismo, Classicismo · Matemática: Conjuntos, funções do 1º e 2º grau, equações, inequações, geometria plana básica, proporções · Química: Estrutura atômica e modelos atômicos, tabela periódica, ligações químicas, propriedades da matéria · Inglês: Funções comunicativas básicas, vocabulário essencial, interpretação de texto";
const PISM_MOD2 = "Biologia: Genética Mendeliana, Evolução, Ecologia · Química: Funções Inorgânicas, Estequiometria, Termoquímica, Cinética · Física: Trabalho e Energia, Termologia, Óptica básica · Matemática: Geometria Plana, Progressões, Logaritmos, Análise Combinatória · Português/Literatura: Sintaxe, Figuras de Linguagem, Barroco, Arcadismo, Romantismo · História: Idade Moderna, Revoluções Liberais, Brasil Colonial · Geografia: Geopolítica, Urbanização, Industrialização · Inglês: Gramática instrumental, Interpretação";
const PISM_MOD3 = "Biologia: Fisiologia Animal e Vegetal, Embriologia, Microbiologia, Imunologia · Química: Química Orgânica, Eletroquímica, Equilíbrio Químico, Soluções · Física: Eletrostática, Eletrodinâmica, Eletromagnetismo, Física Moderna · Matemática: Geometria Espacial, Geometria Analítica, Estatística, Trigonometria avançada · Português/Literatura: Regência, Concordância, Modernismo, Literatura Contemporânea · História: Brasil República, Guerras Mundiais, Guerra Fria, Mundo Contemporâneo · Geografia: Brasil: Regiões e Biomas, Questões Ambientais, Globalização";

// PASES Etapa 1 — Cebraspe/UFV, organizado por áreas do conhecimento (BNCC)
const PASES_MOD1 = "Linguagens e suas Tecnologias: Língua Portuguesa (interpretação de textos, gêneros textuais, fonologia, morfologia básica), Literatura (trovadorismo ao classicismo), Língua Inglesa (funções comunicativas, vocabulário, interpretação), Arte e Educação Física · Ciências da Natureza: Biologia (citologia básica, ecologia introdutória, metabolismo), Física (cinemática escalar, dinâmica — Leis de Newton), Química (modelos atômicos, tabela periódica, estados físicos da matéria, ligações químicas) · Matemática e suas Tecnologias: Conjuntos, funções do 1º e 2º grau, equações e inequações, trigonometria básica, geometria plana · Ciências Humanas: História (Antiguidade Oriental e Clássica, Idade Média), Geografia (cartografia, dinâmica interna e externa da Terra, clima, população e urbanização)";
const PASES_MOD2 = "Biologia: Genética Mendeliana e Cromossômica, Evolução, Ecologia · Química: Funções Inorgânicas, Estequiometria, Termoquímica, Cinética Química, Equilíbrio Químico · Física: Thermologia, Óptica Geométrica, Ondulatória, Hidrostática · Matemática: Geometria Plana, Progressões Aritméticas e Geométricas, Logaritmos e Exponenciais, Combinatória e Probabilidade · Português/Literatura: Sintaxe, Semântica, Barroco, Arcadismo, Romantismo · História: Idade Moderna, Colonização do Brasil, Século XIX e Revoluções · Geografia: Dinâmica Econômica, Urbanização, Industrialização, Questões Ambientais";
const PASES_MOD3 = "Biologia: Fisiologia Animal, Fisiologia Vegetal, Embriologia, Microbiologia, Imunologia, Biologia Molecular · Química: Química Orgânica completa, Eletroquímica, Soluções e Propriedades Coligativas · Física: Eletrostática, Eletrodinâmica, Magnetismo, Eletromagnetismo, Física Moderna e Contemporânea · Matemática: Geometria Espacial, Geometria Analítica, Estatística, Trigonometria completa · Português/Literatura: Concordância, Regência, Crase, Modernismo brasileiro, Literatura Contemporânea · História: Brasil República, I e II Guerras Mundiais, Guerra Fria, Brasil Contemporâneo · Geografia: Brasil: Regiões, Biomas e Questões Ambientais, Geopolítica Contemporânea";

// Seriado UFMG (PSAS) Etapa 1 — 45 questões objetivas + 1 discursiva interdisciplinar (confirmado UFMG)
const PSAS_MOD1 = "Prova: 45 questões objetivas + 1 questão discursiva interdisciplinar · Conteúdo do 1º ano do Ensino Médio (BNCC) · Linguagens (14q): Língua Portuguesa e Literatura, Língua Estrangeira (Inglês ou Espanhol), Arte — leitura, produção textual, gêneros discursivos, trovadorismo ao classicismo · Matemática (9q): Conjuntos, funções do 1º e 2º grau, geometria plana, equações e inequações · Ciências da Natureza (12q): Biologia (citologia, ecologia básica, bioquímica), Física (cinemática, Leis de Newton), Química (matéria, estrutura atômica, tabela periódica, ligações químicas) · Ciências Humanas (10q): História (Antiguidade — Egito, Grécia, Roma —, Feudalismo e Idade Média), Geografia (cartografia, relevo, hidrografia, dinâmica da Terra) · Obras literárias obrigatórias (ciclo 2026-2028): O quinze — Rachel de Queiroz; Ideias para adiar o fim do mundo — Ailton Krenak; Txai (álbum) — Milton Nascimento";
const PSAS_MOD2 = "Biologia: Genética, Evolução, Ecologia · Química: Funções Inorgânicas, Estequiometria, Termoquímica · Física: Trabalho/Energia, Termodinâmica, Óptica · Matemática: Geometria Plana, Logaritmos, Progressões, Combinatória · Português/Literatura: Sintaxe, Barroco, Arcadismo, Romantismo · História: Modernidade, Brasil Colonial e Imperial · Geografia: Espaço Geopolítico, Urbanização";
const PSAS_MOD3 = "Biologia: Fisiologia, Embriologia, Microbiologia, Imunologia, Biotecnologia · Química: Química Orgânica, Eletroquímica, Soluções · Física: Eletromagnetismo, Física Moderna · Matemática: Geometria Espacial, Geometria Analítica, Estatística · Português/Literatura: Regência, Concordância, Modernismo, Contemporânea · História: Brasil República, Guerras Mundiais, Guerra Fria · Geografia: Brasil contemporâneo, Geopolítica";

// PAS UFLA — Desde 2024 as provas são em JUNHO · Etapa 1 triênio 2026-2028: 21/06/2026 (confirmado)
const PAS_UFLA_E1 = "Prova: 60 questões objetivas de múltipla escolha · Conteúdo do 1º ano do Ensino Médio · Provas realizadas em JUNHO · Ciências da Natureza: Biologia (citologia, histologia animal, ecologia básica), Física (grandezas, cinemática, dinâmica — Leis de Newton), Química (matéria, estrutura atômica, tabela periódica, ligações químicas) · Matemática: Conjuntos, funções do 1º e 2º grau, equações, geometria plana básica, trigonometria introdutória · Linguagens: Língua Portuguesa (interpretação, fonologia, morfologia, gêneros textuais), Literatura (trovadorismo, humanismo, classicismo), Inglês (interpretação) · Ciências Humanas: História (mundo antigo — Egito, Grécia, Roma — Idade Média), Geografia (cartografia, relevo, hidrografia, climatologia)";
const PAS_UFLA_E2 = "Prova: 60 questões objetivas · Conteúdo do 2º ano + acumulado do 1º ano · Ciências da Natureza: Biologia (genética mendeliana, evolução, ecologia avançada, botânica), Física (trabalho/energia, hidrostática, termologia, óptica), Química (funções inorgânicas, estequiometria, termoquímica, cinética) · Matemática: Geometria plana avançada, PA e PG, logaritmos, combinatória e probabilidade · Linguagens: Sintaxe, figuras de linguagem, Barroco, Arcadismo, Romantismo · Ciências Humanas: Idade Moderna, reformas religiosas, colonização do Brasil, século XIX";
const PAS_UFLA_E3 = "ATENÇÃO: A Etapa 3 do PAS UFLA utiliza a nota do ENEM — não há prova própria · O candidato submete a nota do ENEM (ano correspondente ao 3º ano do EM) · Todas as áreas do ENEM são consideradas: Linguagens (45q), Ciências Humanas (45q), Ciências da Natureza (45q), Matemática (45q) + Redação (1000 pts) · Conteúdos: todo o EM acumulado (1º + 2º + 3º anos)";

export const VESTIBULARES_TARGETS: VestibularTarget[] = [
  // ── SERIADOS ──────────────────────────────────────────────────────────────
  {
    id: "pism", name: "PISM", fullName: "Programa de Ingresso Seletivo Misto — UFJF",
    university: ["UFJF"],
    // Módulo I triênio 2026-2028 — exame em dezembro de cada ano
    date: "2026-12-06", color: "#8b5cf6",
    medicineAvg: 88, medicineCutNote: "Processo seriado — soma dos 3 módulos · UFJF Medicina muito concorrida em MG · Aplicado anualmente em dezembro",
    phases: 3, selected: true, type: "Seriado",
    subjects: ALL_SUBJECTS,
    phaseLabels: ["Módulo I", "Módulo II", "Módulo III"],
    // Datas estimadas (dezembro de cada ano do triênio 2026-2028)
    phaseDates: ["2026-12-06", "2027-12-05", "2028-12-03"],
    // Módulo I NÃO cobra Filosofia nem Sociologia (confirmado via COPESE/UFJF)
    phaseSubjects: [
      ["Biologia", "Química", "Física", "Matemática", "Português", "Literatura", "História", "Geografia", "Inglês"],
      MOD1_SUBJECTS_FULL,
      [...ALL_SUBJECTS],
    ],
    phaseContents: [PISM_MOD1, PISM_MOD2, PISM_MOD3],
  },
  {
    id: "pases-ufv", name: "PASES", fullName: "Programa de Avaliação Seriada para Ingresso na UFV",
    university: ["UFV"],
    // Etapa 1 triênio 2026-2028 — organizado pelo Cebraspe, aplicado em novembro
    date: "2026-11-15", color: "#16a34a",
    medicineAvg: 86, medicineCutNote: "Processo seriado — 3 etapas · Organizado pelo Cebraspe · Ciências da Natureza e Matemática têm maior peso",
    phases: 3, selected: true, type: "Seriado",
    subjects: ALL_SUBJECTS,
    phaseLabels: ["Etapa 1", "Etapa 2", "Etapa 3"],
    phaseDates: ["2026-11-15", "2027-11-14", "2028-11-12"],
    phaseSubjects: [
      ["Português", "Literatura", "Inglês", "Arte", "Educação Física", "Biologia", "Física", "Química", "Matemática", "História", "Geografia"],
      [...MOD1_SUBJECTS, "Arte", "Educação Física"],
      [...ALL_SUBJECTS],
    ],
    phaseContents: [PASES_MOD1, PASES_MOD2, PASES_MOD3],
  },
  {
    id: "psas-ufmg", name: "Seriado UFMG", fullName: "Seriado UFMG — Processo Seletivo de Avaliação Seriada",
    university: ["UFMG"],
    // Etapa 1 ciclo 2026-2028 — aplicado em dezembro (Etapa 1 do ciclo 2025-2027 foi 14/12/2025)
    date: "2026-12-13", color: "#dc2626",
    medicineAvg: 94, medicineCutNote: "Processo seriado — soma das 3 etapas (BNCC) · UFMG Medicina altíssima concorrência · Obras literárias obrigatórias por etapa",
    phases: 3, selected: true, type: "Seriado",
    subjects: ALL_SUBJECTS,
    phaseLabels: ["Etapa 1", "Etapa 2", "Etapa 3"],
    phaseDates: ["2026-12-13", "2027-12-12", "2028-12-10"],
    phaseSubjects: [
      ["Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas"],
      ["Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas"],
      ["Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas"],
    ],
    phaseContents: [PSAS_MOD1, PSAS_MOD2, PSAS_MOD3],
  },
  {
    id: "pas-ufla", name: "PAS", fullName: "Processo de Avaliação Seriada — UFLA",
    university: ["UFLA"],
    // Desde 2024 as provas ocorrem em JUNHO · Etapa 1 triênio 2026-2028: 21/06/2026 (confirmado)
    // Etapa 3 utiliza nota do ENEM (não há prova própria)
    date: "2026-06-21", color: "#65a30d",
    medicineAvg: 82, medicineCutNote: "Processo seriado — Etapas 1 e 2 em junho (60 questões objetivas) · Etapa 3 = nota do ENEM · Boa opção federal em MG (Lavras)",
    phases: 3, selected: true, type: "Seriado",
    subjects: MOD1_SUBJECTS,
    phaseLabels: ["Etapa 1", "Etapa 2", "Etapa 3 (ENEM)"],
    phaseDates: ["2026-06-21", "2027-06-20", "2028-11-05"],
    phaseSubjects: [
      ["Português", "Literatura", "Inglês", "Matemática", "Biologia", "Física", "Química", "História", "Geografia"],
      ["Português", "Literatura", "Inglês", "Matemática", "Biologia", "Física", "Química", "História", "Geografia"],
      [...ALL_SUBJECTS],
    ],
    phaseContents: [PAS_UFLA_E1, PAS_UFLA_E2, PAS_UFLA_E3],
  },
  // ── VIA ENEM / SISU ───────────────────────────────────────────────────────
  {
    id: "enem", name: "ENEM", fullName: "Exame Nacional do Ensino Médio",
    university: ["UFRJ (SISU)", "UFSCar (SISU)", "UFLA (SISU)", "e outras federais via SISU"],
    // ENEM 2026: 8/11 (1º dia) e 15/11 (2º dia) — confirmado
    date: "2026-11-08", secondDate: "2026-11-15", color: "#3b82f6",
    medicineAvg: 92, medicineCutNote: "Nota de corte para Medicina via SISU: ~750–820 pts · 180 questões + Redação · Áreas BNCC",
    phases: 1, selected: true, type: "ENEM",
    subjects: ALL_SUBJECTS,
  },
  {
    id: "ufrj", name: "UFRJ", fullName: "Universidade Federal do Rio de Janeiro — via ENEM/SISU",
    university: ["UFRJ"],
    // Ingresso via SISU (ENEM) · Não tem vestibular próprio para Medicina
    date: "2028-11-05", color: "#0284c7",
    medicineAvg: 93, medicineCutNote: "UFRJ Medicina via SISU — uma das mais concorridas do Brasil · Nota de corte histórica ~800+ pts · Campus Ilha do Fundão, Rio de Janeiro",
    phases: 1, selected: true, type: "ENEM",
    subjects: ALL_SUBJECTS,
  },
  {
    id: "ufscar", name: "UFSCar", fullName: "Universidade Federal de São Carlos — via ENEM/SISU",
    university: ["UFSCar"],
    // Ingresso via SISU (ENEM) · Campus São Carlos
    date: "2028-11-05", color: "#059669",
    medicineAvg: 89, medicineCutNote: "UFSCar Medicina via SISU · Nota de corte histórica ~780 pts · São Carlos, SP · Curso integral",
    phases: 1, selected: true, type: "ENEM",
    subjects: ALL_SUBJECTS,
  },
  // ── VESTIBULARES TRADICIONAIS ─────────────────────────────────────────────
  {
    id: "fuvest", name: "FUVEST", fullName: "Vestibular USP — FUVEST",
    university: ["USP"],
    // 2027: 1ª fase 01/11/2026, 2ª fase 13–14/12/2026 (confirmado FUVEST oficial)
    // Para 2029 (ano da aluna): datas a confirmar (~1º nov e ~13–14 dez 2028)
    date: "2028-11-01", secondDate: "2028-12-13", color: "#f59e0b",
    medicineAvg: 97, medicineCutNote: "USP Medicina mais concorrida do Brasil · 1ª fase: 90 questões objetivas · 2ª fase: dissertativas + redação · Organizada pela FUVEST",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "unicamp", name: "UNICAMP", fullName: "Vestibular COMVEST — UNICAMP",
    university: ["UNICAMP"],
    // 2027: 1ª fase 18/10/2026, 2ª fase 29–30/11/2026 (confirmado COMVEST)
    // Para 2029: datas a confirmar (~out e nov 2028)
    date: "2028-10-18", secondDate: "2028-11-29", color: "#06b6d4",
    medicineAvg: 95, medicineCutNote: "UNICAMP Medicina altíssima concorrência · 1ª fase objetiva · 2ª fase: 3 redações + dissertativas · Prova muito interdisciplinar",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "unesp", name: "UNESP", fullName: "Vestibular VUNESP — UNESP",
    university: ["UNESP"],
    // 2027: 1ª fase 22/11/2026, 2ª fase 06–07/12/2026 (confirmado Vunesp)
    // Medicina em Botucatu (FCM) e Araçatuba (FOA) — Para 2029: datas a confirmar
    date: "2028-11-22", secondDate: "2028-12-06", color: "#0891b2",
    medicineAvg: 90, medicineCutNote: "UNESP Medicina em Botucatu e Araçatuba · 1ª fase: 90 questões objetivas (Vunesp) · 2ª fase: dissertativas + redação",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "famerp", name: "FAMERP", fullName: "Faculdade de Medicina de São José do Rio Preto — FAMERP",
    university: ["FAMERP"],
    // Vestibular próprio (Vunesp) · 2 dias de prova · Somente Medicina e Enfermagem
    // Data estimada para 2028 (~dezembro)
    date: "2028-12-07", color: "#f97316",
    medicineAvg: 91, medicineCutNote: "Instituição pública estadual · Somente Medicina e Enfermagem · Alta concorrência · 1º dia: Mat, Bio, Geo, Fís, His, Quí, Port, Ing (80q objetivas) · 2º dia: conteúdo de área específica",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "uemg", name: "UEMG", fullName: "Vestibular UEMG — Universidade do Estado de Minas Gerais",
    university: ["UEMG"],
    // Vestibular próprio · Medicina em Passos (FPM) e Diamantina (FAMED)
    // Data estimada para 2028
    date: "2028-11-10", color: "#7c3aed",
    medicineAvg: 80, medicineCutNote: "Universidade estadual mineira · Medicina em Passos e Diamantina · 1 fase objetiva · Boa opção regional com menor concorrência que USP/UNICAMP",
    phases: 1, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Redação"],
  },
  {
    id: "uerj", name: "UERJ", fullName: "Vestibular UERJ — Universidade do Estado do Rio de Janeiro",
    university: ["UERJ"],
    // Sistema especial: 1º EQ (Exame de Qualificação 1) em junho, 2º EQ em setembro, Específica em dezembro/jan
    // 2027: 1º EQ 07/06/2026, 2º EQ 06/09/2026 (confirmado) · Para 2029: datas a confirmar
    date: "2028-06-07", color: "#ea580c",
    medicineAvg: 88, medicineCutNote: "Sistema único: 1º EQ (jun) + 2º EQ (set) + Exame Específico (dez/jan) · Sistema de cotas · Medicina muito concorrida no Rio de Janeiro",
    phases: 3, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "ufu", name: "UFU", fullName: "Vestibular UFU — Universidade Federal de Uberlândia",
    university: ["UFU"],
    // Vestibular próprio semestral (2026/1 e 2026/2) · Também ingresso via SISU
    // Data estimada para 2028
    date: "2028-11-10", color: "#b45309",
    medicineAvg: 87, medicineCutNote: "UFU Medicina muito concorrida no Triângulo Mineiro · Vestibular próprio + ingresso via SISU · Uberlândia, MG",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Redação"],
  },
  {
    id: "coteps-unimontes", name: "PAES/Unimontes", fullName: "PAES — Programa de Avaliação Seriada · Unimontes (COTEPS)",
    university: ["UNIMONTES"],
    // PAES (seriado) organizado pela COTEPS · 3 séries do EM · Provas: 06/12/2026 (confirmado)
    date: "2026-12-06", color: "#9333ea",
    medicineAvg: 78, medicineCutNote: "PAES: seriado para alunos dos 1º, 2º e 3º anos do EM · Prova em dezembro · Medicina em Montes Claros · Boa opção regional norte de MG",
    phases: 3, selected: true, type: "Seriado",
    subjects: ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Redação"],
    phaseLabels: ["1ª Série", "2ª Série", "3ª Série"],
    phaseDates: ["2026-12-06", "2027-12-05", "2028-12-03"],
    phaseSubjects: [
      ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Redação"],
      ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Redação"],
      ["Português", "Literatura", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Redação"],
    ],
    phaseContents: [
      "Conteúdo do 1º ano do Ensino Médio · Português: interpretação textual, morfologia básica, fonologia · Matemática: conjuntos, funções, geometria básica · Ciências da Natureza: citologia, introdução à química (matéria, átomo, tabela periódica), cinemática e dinâmica · Ciências Humanas: antiguidade oriental e clássica, cartografia e relevo · Redação: dissertação-argumentativa",
      "Conteúdo do 2º ano · Português: sintaxe, figuras de linguagem · Literatura: Barroco, Arcadismo, Romantismo · Matemática: progressões, logaritmos, combinatória · Ciências da Natureza: genética mendeliana, funções inorgânicas, termologia e óptica · Ciências Humanas: Idade Moderna, colonização do Brasil, urbanização",
      "Conteúdo do 3º ano · Português: concordância, regência, crase · Literatura: Modernismo, Contemporânea · Matemática: geometria espacial, estatística · Ciências da Natureza: química orgânica, eletrodinâmica, fisiologia animal e vegetal · Ciências Humanas: Brasil República, guerras mundiais, geopolítica contemporânea",
    ],
  },
  {
    id: "unifagoc", name: "UNIFAGOC", fullName: "Vestibular Medicina — Centro Universitário UNIFAGOC",
    university: ["UNIFAGOC"],
    // Vestibular próprio de Medicina · Prova presencial · 2026: inscrições 29/06–25/08, prova 20/09/2026
    // Data estimada para 2028: ~setembro
    date: "2028-09-20", color: "#db2777",
    medicineAvg: 72, medicineCutNote: "Centro universitário privado em Ubá, MG · Vestibular próprio de Medicina presencial · Conteúdo do EM: Português, Conhecimentos Gerais e Redação · Menor concorrência que federais",
    phases: 1, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Conhecimentos Gerais", "Redação"],
  },
  {
    id: "einstein", name: "Einstein", fullName: "Vestibular Instituto Israelita de Ensino e Pesquisa Albert Einstein",
    university: ["Einstein"],
    // Vestibular próprio · Processo seletivo altamente criterioso: provas + entrevistas
    // Data estimada para 2028
    date: "2028-09-01", color: "#ec4899",
    medicineAvg: 97, medicineCutNote: "Curso particular de Medicina de altíssimo nível · Processo: provas de Português, Matemática, Ciências + entrevistas + avaliação comportamental · São Paulo · Altíssima concorrência",
    phases: 2, selected: true, type: "Vestibular próprio",
    subjects: ["Português", "Matemática", "Física", "Química", "Biologia", "Inglês", "Redação"],
  },
];

// ---- Gastos recorrentes ----
export type RecurringExpense = {
  id: string;
  name: string;
  value: number;
  frequency: "Mensal" | "Trimestral" | "Semestral" | "Anual";
  category: string;
  nextDue: string;
  paid: boolean;
  color: string;
  emoji: string;
};

export const RECURRING_EXPENSES: RecurringExpense[] = [
  { id: "re1", name: "Academia", value: 99, frequency: "Mensal", category: "Saúde", nextDue: "2026-07-02", paid: false, color: "var(--c-rose)", emoji: "💪" },
  { id: "re2", name: "Plataforma Assaad", value: 149, frequency: "Mensal", category: "Estudos", nextDue: "2026-07-03", paid: false, color: "var(--secondary)", emoji: "📚" },
  { id: "re3", name: "Spotify", value: 11.90, frequency: "Mensal", category: "Lazer", nextDue: "2026-07-10", paid: false, color: "var(--c-green)", emoji: "🎵" },
  { id: "re4", name: "iCloud 50GB", value: 4.90, frequency: "Mensal", category: "Tech", nextDue: "2026-07-15", paid: false, color: "var(--c-blue)", emoji: "☁️" },
  { id: "re5", name: "Material escolar (kit)", value: 200, frequency: "Semestral", category: "Estudos", nextDue: "2026-07-15", paid: false, color: "var(--secondary)", emoji: "🖊️" },
  { id: "re6", name: "Matrícula escolar", value: 800, frequency: "Anual", category: "Estudos", nextDue: "2027-01-10", paid: true, color: "var(--secondary)", emoji: "🏫" },
  { id: "re7", name: "Inscrição ENEM", value: 85, frequency: "Anual", category: "Vestibulares", nextDue: "2026-07-01", paid: false, color: "var(--c-amber)", emoji: "📝" },
  { id: "re8", name: "Inscrição FUVEST", value: 162, frequency: "Anual", category: "Vestibulares", nextDue: "2026-08-15", paid: false, color: "var(--c-amber)", emoji: "📝" },
];

// ---- Orçamento (% por categoria) ----
export type BudgetCategory = {
  id: string;
  name: string;
  emoji: string;
  percentage: number;
  spent: number;
  color: string;
};

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: "bc1", name: "Poupança / Reserva", emoji: "🏦", percentage: 20, spent: 300, color: "var(--success)" },
  { id: "bc2", name: "Estudos", emoji: "📚", percentage: 20, spent: 238, color: "var(--secondary)" },
  { id: "bc3", name: "Alimentação", emoji: "🍽️", percentage: 15, spent: 120, color: "var(--c-green)" },
  { id: "bc4", name: "Saúde & Beleza", emoji: "💆‍♀️", percentage: 10, spent: 45, color: "var(--c-lilac)" },
  { id: "bc5", name: "Academia", emoji: "💪", percentage: 8, spent: 99, color: "var(--c-rose)" },
  { id: "bc6", name: "Lazer & Compras", emoji: "🛍️", percentage: 7, spent: 120, color: "var(--c-amber)" },
  { id: "bc7", name: "Assinaturas / Tech", emoji: "📱", percentage: 5, spent: 16.80, color: "var(--accent)" },
  { id: "bc8", name: "Outros", emoji: "📌", percentage: 15, spent: 48, color: "var(--text-muted)" },
];

// ---- Trabalho ----
export type WorkSession = {
  id: string;
  project: "Salão" | "Sypoza" | "Optimio";
  description: string;
  date: string;
  hours: number;
  revenue?: number;
};

export const WORK_SESSIONS: WorkSession[] = [
  { id: "ws1", project: "Salão", description: "Atendimentos — 4 clientes", date: "2026-06-27", hours: 6, revenue: 380 },
  { id: "ws2", project: "Salão", description: "Atendimentos — 3 clientes", date: "2026-06-25", hours: 4.5, revenue: 280 },
  { id: "ws3", project: "Sypoza", description: "Reunião de estratégia", date: "2026-06-26", hours: 1.5 },
  { id: "ws4", project: "Optimio", description: "Desenvolvimento de funcionalidades", date: "2026-06-24", hours: 2 },
  { id: "ws5", project: "Salão", description: "Atendimentos — 5 clientes", date: "2026-06-22", hours: 7, revenue: 540 },
];

export type WorkTask = {
  id: string;
  project: "Salão" | "Sypoza" | "Optimio" | "Pessoal";
  name: string;
  status: "Não iniciada" | "Em andamento" | "Concluída";
  priority: "Alta" | "Média" | "Baixa";
  due?: string;
};

export const WORK_TASKS: WorkTask[] = [
  { id: "wt1", project: "Sypoza", name: "Finalizar pitch deck", status: "Em andamento", priority: "Alta", due: "2026-07-05" },
  { id: "wt2", project: "Optimio", name: "Definir MVP de funcionalidades", status: "Não iniciada", priority: "Alta", due: "2026-07-10" },
  { id: "wt3", project: "Salão", name: "Renovar estoque de produtos", status: "Não iniciada", priority: "Média", due: "2026-07-01" },
  { id: "wt4", project: "Sypoza", name: "Pesquisa de mercado", status: "Concluída", priority: "Média" },
  { id: "wt5", project: "Pessoal", name: "Organizar documentos fiscais", status: "Não iniciada", priority: "Baixa" },
];

// ---- Saúde (corpo + nutrição) ----
export type BodyMeasurement = {
  date: string;
  weight: number; // kg
  bodyFat?: number; // %
  waist?: number; // cm
  hip?: number; // cm
};

export const BODY_MEASUREMENTS: BodyMeasurement[] = [
  { date: "2026-06-01", weight: 58.5, bodyFat: 22, waist: 68, hip: 94 },
  { date: "2026-06-08", weight: 58.2, bodyFat: 21.8, waist: 67.5, hip: 93.5 },
  { date: "2026-06-15", weight: 57.8, bodyFat: 21.5, waist: 67, hip: 93 },
  { date: "2026-06-22", weight: 57.6, bodyFat: 21.2, waist: 66.5, hip: 92.5 },
  { date: "2026-06-28", weight: 57.4, bodyFat: 21.0, waist: 66, hip: 92 },
];

export const DIET_GOALS = { calories: 1900, protein: 120, carbs: 220, fat: 60 };

// ---- Avaliações de produto (Self Care) ----
export type ProductReview = {
  id: string;
  name: string;
  brand: string;
  category: "Hidratante" | "Sérum" | "Protetor" | "Limpeza" | "Tônico" | "Tratamento" | "Outro";
  rating: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  wouldBuyAgain: boolean;
  price?: number;
  usingSince?: string;
  notes?: string;
};

export const PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: "pr1", name: "Sérum Vitamina C", brand: "Maxgreen", category: "Sérum",
    rating: 5, pros: ["Clareia manchas", "Textura leve", "Absorção rápida"],
    cons: ["Preço alto", "Embalagem pequena"], wouldBuyAgain: true,
    price: 89, usingSince: "2026-04-01", notes: "Melhor sérum que já usei. Manchas bem mais claras após 2 meses."
  },
  {
    id: "pr2", name: "Hidratante Facial Oil Control", brand: "Neutrogena", category: "Hidratante",
    rating: 4, pros: ["Não emplasta", "Bom pra pele oleosa", "Preço acessível"],
    cons: ["Cheiro levemente medicinal"], wouldBuyAgain: true,
    price: 35, usingSince: "2026-05-01"
  },
  {
    id: "pr3", name: "Protetor Solar FPS 60", brand: "La Roche-Posay", category: "Protetor",
    rating: 3, pros: ["Alta proteção", "Não mancha roupa"],
    cons: ["Esbranquiça a pele", "Pesado demais"], wouldBuyAgain: false,
    price: 88, notes: "Bom produto mas deixou pele com aparência branca. Vou testar outro."
  },
];

// ---- Histórico de consultas IA ----
export type ConsultationMessage = { role: "user" | "ai"; content: string; time: string };
export type ConsultationSession = {
  id: string;
  persona: "Psicólogo" | "Nutricionista" | "Personal" | "Dermatologista" | "Mentor de Estudos";
  title: string;
  date: string;
  messages: ConsultationMessage[];
};

export const CONSULTATION_SESSIONS: ConsultationSession[] = [
  {
    id: "cs1", persona: "Mentor de Estudos", title: "Estratégia para FUVEST",
    date: "2026-06-25",
    messages: [
      { role: "user", content: "Meu maior problema é Física. Como devo organizar meus estudos para a FUVEST?", time: "14:30" },
      { role: "ai", content: "Para a FUVEST, Física representa 10-12 questões na 1ª fase. Com base no seu histórico (64% de acerto), recomendo focar em Mecânica (Cinemática, Dinâmica, Trabalho/Energia) — esses temas correspondem a ~40% das questões de Física na FUVEST. Bloco diário de 2h + 20 questões de provas anteriores.", time: "14:31" },
    ],
  },
  {
    id: "cs2", persona: "Nutricionista", title: "Alimentação para provas",
    date: "2026-06-20",
    messages: [
      { role: "user", content: "O que comer antes de um simulado para ter máxima concentração?", time: "09:00" },
      { role: "ai", content: "Antes do simulado: refeição ~2h antes com carboidrato complexo + proteína leve (aveia + ovo, por ex.). Durante: água + castanhas/chocolate 70%. Evite açúcar simples — causa pico e queda brusca de energia. Cafeína ok até 200mg se tolerada.", time: "09:01" },
    ],
  },
];
