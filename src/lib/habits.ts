export type HabitCategory =
  | "Estudos"
  | "Self care"
  | "Meter o shape"
  | "Aproximar de Deus"
  | "Trabalho"
  | "Lazer"
  | "Alimentação"
  | "Rotina";

export type TimeOfDay = "Manhã" | "Tarde" | "Noite";

export type DayKey =
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado"
  | "Domingo";

export type Habit = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  category: HabitCategory;
  time: string;
};

export const DEFAULT_HABITS_BY_DAY: Record<DayKey, Habit[]> = {
  Segunda: [
    { id: "seg-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "seg-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "seg-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "seg-4", name: "Escola", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "seg-5", name: "Fazer almoço e comer", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "seg-6", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:30" },
    { id: "seg-7", name: "Estudar Física", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "seg-8", name: "Estudar Matemática", timeOfDay: "Tarde", category: "Estudos", time: "16:00" },
    { id: "seg-9", name: "Banho, jantar e trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "18:00" },
    { id: "seg-10", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "20:00" },
  ],
  Terça: [
    { id: "ter-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "ter-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "ter-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "ter-4", name: "Escola", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "ter-5", name: "Almoçar na rua saudável", timeOfDay: "Tarde", category: "Alimentação", time: "12:30" },
    { id: "ter-6", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:00" },
    { id: "ter-7", name: "Voltar para escola", timeOfDay: "Tarde", category: "Estudos", time: "13:40" },
    { id: "ter-8", name: "Lanche da tarde leve", timeOfDay: "Tarde", category: "Alimentação", time: "15:30" },
    { id: "ter-9", name: "Banho, jantar e tarefas do dia", timeOfDay: "Noite", category: "Rotina", time: "18:00" },
    { id: "ter-10", name: "Trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "19:00" },
    { id: "ter-11", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "21:00" },
  ],
  Quarta: [
    { id: "qua-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "qua-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "qua-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "qua-4", name: "Escola", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "qua-5", name: "Almoçar na rua saudável", timeOfDay: "Tarde", category: "Alimentação", time: "12:30" },
    { id: "qua-6", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:00" },
    { id: "qua-7", name: "Voltar para escola", timeOfDay: "Tarde", category: "Estudos", time: "13:40" },
    { id: "qua-8", name: "Lanche da tarde leve", timeOfDay: "Tarde", category: "Alimentação", time: "15:30" },
    { id: "qua-9", name: "Banho, jantar e estudar Inglês", timeOfDay: "Noite", category: "Estudos", time: "17:00" },
    { id: "qua-10", name: "Estudar Linguagens", timeOfDay: "Noite", category: "Estudos", time: "18:00" },
    { id: "qua-11", name: "Trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "19:00" },
    { id: "qua-12", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "21:00" },
  ],
  Quinta: [
    { id: "qui-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "qui-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "qui-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "qui-4", name: "Escola", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "qui-5", name: "Fazer almoço e comer", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "qui-6", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:30" },
    { id: "qui-7", name: "Estudar Biologia", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "qui-8", name: "Estudar Química", timeOfDay: "Tarde", category: "Estudos", time: "16:00" },
    { id: "qui-9", name: "Banho, jantar e trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "18:00" },
    { id: "qui-10", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "20:00" },
  ],
  Sexta: [
    { id: "sex-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "sex-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "sex-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "sex-4", name: "Escola", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "sex-5", name: "Fazer almoço e comer", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "sex-6", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:30" },
    { id: "sex-7", name: "Estudar História", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "sex-8", name: "Estudar Geografia", timeOfDay: "Tarde", category: "Estudos", time: "16:00" },
    { id: "sex-9", name: "Banho, jantar e trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "18:00" },
    { id: "sex-10", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "20:00" },
  ],
  Sábado: [
    { id: "sab-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "sab-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "sab-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "sab-4", name: "Estudar Português", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "sab-5", name: "Salão", timeOfDay: "Manhã", category: "Trabalho", time: "08:00" },
    { id: "sab-6", name: "Financeiro do Salão", timeOfDay: "Manhã", category: "Trabalho", time: "11:00" },
    { id: "sab-7", name: "Música", timeOfDay: "Manhã", category: "Lazer", time: "12:00" },
    { id: "sab-8", name: "Fazer almoço e comer", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "sab-9", name: "Trabalhar — Salão / Optimio", timeOfDay: "Tarde", category: "Trabalho", time: "13:30" },
    { id: "sab-10", name: "Estudar Inglês", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "sab-11", name: "Estudar Redação", timeOfDay: "Tarde", category: "Estudos", time: "16:00" },
    { id: "sab-12", name: "Banho, jantar e trabalhar — Salão / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "18:00" },
    { id: "sab-13", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "20:00" },
  ],
  Domingo: [
    { id: "dom-1", name: "Banho e se arrumar", timeOfDay: "Manhã", category: "Self care", time: "05:00" },
    { id: "dom-2", name: "Fazer café", timeOfDay: "Manhã", category: "Rotina", time: "05:40" },
    { id: "dom-3", name: "Comer e revisar o dia", timeOfDay: "Manhã", category: "Rotina", time: "06:00" },
    { id: "dom-4", name: "Estudar Filosofia", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "dom-5", name: "Estudar Sociologia", timeOfDay: "Manhã", category: "Estudos", time: "08:00" },
    { id: "dom-medidas", name: "📏 Pesar e medir — abrir Alimentação > Medidas", timeOfDay: "Manhã", category: "Self care", time: "09:30" },
    { id: "dom-6", name: "Lavar o cabelo e spa day", timeOfDay: "Manhã", category: "Self care", time: "10:00" },
    { id: "dom-7", name: "Fazer almoço e comer", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "dom-8", name: "Trabalhar", timeOfDay: "Tarde", category: "Trabalho", time: "13:30" },
    { id: "dom-9", name: "Simulado", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "dom-10", name: "Fazer o cabelo, jantar e trabalhar — Posts Salão / Preparar semana / Optimio", timeOfDay: "Noite", category: "Trabalho", time: "18:00" },
    { id: "dom-11", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "20:00" },
  ],
};

// Mantido para compatibilidade com imports existentes
export const HABITS_BY_DAY = DEFAULT_HABITS_BY_DAY;

export const ALL_DAYS: DayKey[] = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo",
];

export const DAY_ABBR: Record<DayKey, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
  Domingo: "Dom",
};

export function getTodayKey(): DayKey {
  const map: Record<number, DayKey> = {
    0: "Domingo", 1: "Segunda", 2: "Terça",
    3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
  };
  return map[new Date().getDay()];
}
