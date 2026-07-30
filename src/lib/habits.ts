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
    { id: "seg-1", name: "Acordar, se arrumar e ouvir aula — Física", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "seg-2", name: "Fazer café ouvindo aula — Física", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "seg-3", name: "Escovar os dentes e escola", timeOfDay: "Manhã", category: "Rotina", time: "06:30" },
    { id: "seg-4", name: "Almoçar e revisar conteúdos da escola", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "seg-5", name: "Física — Revisão espiral (20min) + Matspeed (10min)", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "seg-6", name: "Física — Conteúdo novo (aula + TAB)", timeOfDay: "Tarde", category: "Estudos", time: "14:30" },
    { id: "seg-7", name: "Física — Exercícios", timeOfDay: "Tarde", category: "Estudos", time: "15:20" },
    { id: "seg-8", name: "Comer (lanche)", timeOfDay: "Tarde", category: "Alimentação", time: "16:00" },
    { id: "seg-9", name: "Física — Exercícios (continuação)", timeOfDay: "Tarde", category: "Estudos", time: "16:15" },
    { id: "seg-10", name: "Física — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Tarde", category: "Estudos", time: "16:50" },
    { id: "seg-11", name: "Filosofia — Revisão espiral (20min) + Matspeed (10min)", timeOfDay: "Noite", category: "Estudos", time: "18:00" },
    { id: "seg-12", name: "Filosofia — Conteúdo novo (aula + TAB)", timeOfDay: "Noite", category: "Estudos", time: "18:30" },
    { id: "seg-13", name: "Filosofia — Exercícios/questões", timeOfDay: "Noite", category: "Estudos", time: "19:15" },
    { id: "seg-14", name: "Filosofia — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Noite", category: "Estudos", time: "19:30" },
    { id: "seg-15", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "19:50" },
    { id: "seg-16", name: "Jantar e trabalhar — preparar dia seguinte", timeOfDay: "Noite", category: "Trabalho", time: "20:00" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "seg-17", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Terça: [
    { id: "ter-1", name: "Acordar, se arrumar e ouvir aula — Sociologia", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "ter-2", name: "Fazer café ouvindo aula — Sociologia", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "ter-3", name: "Escovar os dentes e escola (se der, exercícios de Biologia 50min)", timeOfDay: "Manhã", category: "Rotina", time: "06:30" },
    { id: "ter-4", name: "Sociologia — Revisão espiral + Matspeed + Conteúdo novo (almoçando em casa)", timeOfDay: "Tarde", category: "Estudos", time: "12:30" },
    { id: "ter-5", name: "Voltar para escola", timeOfDay: "Tarde", category: "Rotina", time: "13:40" },
    { id: "ter-6", name: "Lanche da tarde leve", timeOfDay: "Tarde", category: "Alimentação", time: "15:30" },
    { id: "ter-7", name: "Banho, jantar e revisão do dia", timeOfDay: "Noite", category: "Rotina", time: "18:00" },
    { id: "ter-8", name: "Sociologia — Exercícios", timeOfDay: "Noite", category: "Estudos", time: "19:00" },
    { id: "ter-9", name: "Sociologia — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Noite", category: "Estudos", time: "19:40" },
    { id: "ter-10", name: "Literatura — Revisão espiral + Matspeed + Conteúdo novo", timeOfDay: "Noite", category: "Estudos", time: "20:10" },
    { id: "ter-11", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "20:45" },
    { id: "ter-12", name: "Trabalhar — preparar dia seguinte", timeOfDay: "Noite", category: "Trabalho", time: "21:00" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "ter-13", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Quarta: [
    { id: "qua-1", name: "Acordar, se arrumar e ouvir aula — Biologia", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "qua-2", name: "Fazer café ouvindo aula — Biologia", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "qua-3", name: "Escovar os dentes e escola", timeOfDay: "Manhã", category: "Rotina", time: "06:30" },
    { id: "qua-4", name: "Biologia — Revisão espiral + Matspeed + Conteúdo novo (almoçando em casa)", timeOfDay: "Tarde", category: "Estudos", time: "12:30" },
    { id: "qua-5", name: "Voltar para escola", timeOfDay: "Tarde", category: "Rotina", time: "13:40" },
    { id: "qua-6", name: "Lanche da tarde leve", timeOfDay: "Tarde", category: "Alimentação", time: "15:30" },
    { id: "qua-7", name: "Banho, jantar e Inglês (exercícios)", timeOfDay: "Noite", category: "Estudos", time: "17:00" },
    { id: "qua-8", name: "Revisão do dia", timeOfDay: "Noite", category: "Rotina", time: "18:00" },
    { id: "qua-9", name: "Biologia — Exercícios", timeOfDay: "Noite", category: "Estudos", time: "19:00" },
    { id: "qua-10", name: "Biologia — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Noite", category: "Estudos", time: "20:10" },
    { id: "qua-11", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "20:40" },
    { id: "qua-12", name: "Trabalhar — preparar dia seguinte", timeOfDay: "Noite", category: "Trabalho", time: "21:00" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "qua-13", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Quinta: [
    { id: "qui-1", name: "Acordar, se arrumar e ouvir aula — História", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "qui-2", name: "Fazer café ouvindo aula — História", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "qui-3", name: "Escovar os dentes e escola", timeOfDay: "Manhã", category: "Rotina", time: "06:30" },
    { id: "qui-4", name: "Almoçar e revisar conteúdos da escola", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "qui-5", name: "História — Revisão espiral + Matspeed", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "qui-6", name: "História — Conteúdo novo (aula + TAB)", timeOfDay: "Tarde", category: "Estudos", time: "14:30" },
    { id: "qui-7", name: "História — Exercícios", timeOfDay: "Tarde", category: "Estudos", time: "14:50" },
    { id: "qui-8", name: "Matemática — Revisão espiral + Matspeed", timeOfDay: "Tarde", category: "Estudos", time: "15:00" },
    { id: "qui-9", name: "Matemática — Conteúdo novo", timeOfDay: "Tarde", category: "Estudos", time: "15:30" },
    { id: "qui-10", name: "Comer (lanche)", timeOfDay: "Tarde", category: "Alimentação", time: "16:00" },
    { id: "qui-11", name: "Matemática — Exercícios", timeOfDay: "Tarde", category: "Estudos", time: "16:15" },
    { id: "qui-12", name: "Matemática — Resumão + Flashcards novos", timeOfDay: "Tarde", category: "Estudos", time: "16:45" },
    { id: "qui-13", name: "Geografia — Revisão espiral + Matspeed", timeOfDay: "Noite", category: "Estudos", time: "17:00" },
    { id: "qui-14", name: "Geografia — Conteúdo novo (aula + TAB)", timeOfDay: "Noite", category: "Estudos", time: "17:30" },
    { id: "qui-15", name: "Geografia — Exercícios", timeOfDay: "Noite", category: "Estudos", time: "18:20" },
    { id: "qui-16", name: "Geografia — Resumão + Flashcards novos", timeOfDay: "Noite", category: "Estudos", time: "18:30" },
    { id: "qui-17", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "18:50" },
    { id: "qui-18", name: "Jantar e trabalhar — preparar dia seguinte", timeOfDay: "Noite", category: "Trabalho", time: "19:00" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "qui-19", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Sexta: [
    { id: "sex-1", name: "Acordar, se arrumar e ouvir aula — Química", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "sex-2", name: "Fazer café ouvindo aula — Química", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "sex-3", name: "Escovar os dentes e escola", timeOfDay: "Manhã", category: "Rotina", time: "06:30" },
    { id: "sex-4", name: "Almoçar e revisar conteúdos da escola", timeOfDay: "Tarde", category: "Alimentação", time: "13:00" },
    { id: "sex-5", name: "Química (Módulo 1) — Revisão espiral + Matspeed", timeOfDay: "Tarde", category: "Estudos", time: "14:00" },
    { id: "sex-6", name: "Química (Módulo 1) — Conteúdo novo", timeOfDay: "Tarde", category: "Estudos", time: "14:30" },
    { id: "sex-7", name: "Química (Módulo 1) — Exercícios", timeOfDay: "Tarde", category: "Estudos", time: "14:55" },
    { id: "sex-8", name: "Química (Módulo 1) — Resumão + Flashcards novos", timeOfDay: "Tarde", category: "Estudos", time: "15:45" },
    { id: "sex-9", name: "Comer (lanche)", timeOfDay: "Tarde", category: "Alimentação", time: "16:00" },
    { id: "sex-10", name: "Química (Módulo 2) — Revisão espiral + Matspeed", timeOfDay: "Tarde", category: "Estudos", time: "16:15" },
    { id: "sex-11", name: "Química (Módulo 2) — Conteúdo novo", timeOfDay: "Tarde", category: "Estudos", time: "16:45" },
    { id: "sex-12", name: "Química (Módulo 2) — Exercícios", timeOfDay: "Tarde", category: "Estudos", time: "17:10" },
    { id: "sex-13", name: "Química (Módulo 2) — Resumão + Flashcards novos", timeOfDay: "Noite", category: "Estudos", time: "18:00" },
    { id: "sex-14", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "18:30" },
    { id: "sex-15", name: "Jantar e trabalhar — preparar dia seguinte", timeOfDay: "Noite", category: "Trabalho", time: "19:00" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "sex-16", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Sábado: [
    { id: "sab-1", name: "Redação/Gramática — Revisão espiral + Matspeed", timeOfDay: "Manhã", category: "Estudos", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "sab-2", name: "Redação/Gramática — Conteúdo novo (aula, fazendo café)", timeOfDay: "Manhã", category: "Estudos", time: "06:00" },
    { id: "sab-3", name: "Redação/Gramática — Conteúdo novo (continuação, escovar dentes)", timeOfDay: "Manhã", category: "Estudos", time: "06:30" },
    { id: "sab-4", name: "Redação/Gramática — Exercícios", timeOfDay: "Manhã", category: "Estudos", time: "07:30" },
    { id: "sab-5", name: "Redação/Gramática — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Manhã", category: "Estudos", time: "08:00" },
    { id: "sab-6", name: "Português — Revisão espiral + Matspeed", timeOfDay: "Manhã", category: "Estudos", time: "08:30" },
    { id: "sab-7", name: "Português — Conteúdo novo (aula + TAB)", timeOfDay: "Manhã", category: "Estudos", time: "09:00" },
    { id: "sab-8", name: "Português — Exercícios", timeOfDay: "Manhã", category: "Estudos", time: "10:30" },
    { id: "sab-9", name: "Português — Resumão (GoodNotes) + Flashcards novos", timeOfDay: "Manhã", category: "Estudos", time: "11:00" },
    { id: "sab-10", name: "Almoçar e trabalhar — Salão", timeOfDay: "Tarde", category: "Trabalho", time: "11:30" },
    { id: "sab-11", name: "Comer e estudar Atualidades", timeOfDay: "Tarde", category: "Estudos", time: "16:30" },
    { id: "sab-12", name: "Técnica RAD", timeOfDay: "Noite", category: "Estudos", time: "18:30" },
    { id: "sab-13", name: "Jantar e estudar Marketing Digital e IA (preparar dia seguinte)", timeOfDay: "Noite", category: "Trabalho", time: "20:30" },
    { id: "sab-14", name: "Flashcards a revisar (todos os decks do dia)", timeOfDay: "Noite", category: "Estudos", time: "21:30" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "sab-15", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
  ],
  Domingo: [
    { id: "dom-1", name: "Acordar e trabalhar", timeOfDay: "Manhã", category: "Trabalho", time: "05:30" },
    { id: "skincare-manha", name: "Skincare manhã", timeOfDay: "Manhã", category: "Self care", time: "05:35" },
    { id: "dom-2", name: "Fazer café e continuar trabalhando", timeOfDay: "Manhã", category: "Trabalho", time: "06:00" },
    { id: "dom-3", name: "Escovar os dentes e continuar trabalhando", timeOfDay: "Manhã", category: "Trabalho", time: "06:30" },
    { id: "dom-4", name: "Inglês — Exercícios", timeOfDay: "Manhã", category: "Estudos", time: "10:30" },
    { id: "dom-5", name: "Almoçar e estudar Marketing Digital e IA", timeOfDay: "Tarde", category: "Trabalho", time: "11:30" },
    { id: "dom-6", name: "Simulado", timeOfDay: "Tarde", category: "Estudos", time: "13:30" },
    { id: "dom-7", name: "Comer e continuar o simulado", timeOfDay: "Tarde", category: "Estudos", time: "16:30" },
    { id: "dom-8", name: "Correção do simulado", timeOfDay: "Tarde", category: "Estudos", time: "17:30" },
    { id: "dom-medidas", name: "📏 Pesar e medir — abrir Alimentação > Medidas", timeOfDay: "Tarde", category: "Self care", time: "17:45" },
    { id: "dom-care-1", name: "Clarear dentes (abrir Self Care > Cuidados semanais)", timeOfDay: "Tarde", category: "Self care", time: "17:50" },
    { id: "dom-care-2", name: "Loirar pelo", timeOfDay: "Tarde", category: "Self care", time: "17:55" },
    { id: "dom-care-3", name: "Maquiar", timeOfDay: "Tarde", category: "Self care", time: "18:00" },
    { id: "dom-care-4", name: "Tomar banho (spa)", timeOfDay: "Tarde", category: "Self care", time: "18:05" },
    { id: "dom-care-5", name: "Refazer cabelo", timeOfDay: "Tarde", category: "Self care", time: "18:10" },
    { id: "dom-missa", name: "Missa", timeOfDay: "Noite", category: "Aproximar de Deus", time: "19:00" },
    { id: "dom-9", name: "Redação", timeOfDay: "Noite", category: "Estudos", time: "19:30" },
    { id: "dom-10", name: "Organizar a semana (tópicos de estudo e trabalho)", timeOfDay: "Noite", category: "Rotina", time: "21:30" },
    { id: "skincare-noite", name: "Skincare noite", timeOfDay: "Noite", category: "Self care", time: "21:45" },
    { id: "dom-11", name: "Ler e dormir", timeOfDay: "Noite", category: "Lazer", time: "22:00" },
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
