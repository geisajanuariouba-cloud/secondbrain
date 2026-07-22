// Conteúdo programático por vestibular — IDs devem coincidir com VESTIBULARES_TARGETS
export type VestibularTopic = {
  id: string;
  subject: string;
  topic: string;
  subtopics: string[];
  vestibulares: string[]; // IDs dos vestibulares que cobram
  weight: 1 | 2 | 3; // 3 = cobrado em mais vestibulares / mais questões (define a Urgência padrão)
  difficulty: 1 | 2 | 3; // 3 = tópico historicamente mais difícil/abstrato para o aluno (define a Dificuldade padrão)
};

export const VESTIBULAR_TOPICS: VestibularTopic[] = [
  // ── BIOLOGIA ──
  { id: "bio-01", subject: "Biologia", topic: "Citologia", subtopics: ["Organelas", "Membrana plasmática", "Divisão celular", "Metabolismo energético"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },
  { id: "bio-02", subject: "Biologia", topic: "Genética", subtopics: ["Leis de Mendel", "Genética molecular", "DNA/RNA", "Biotecnologia", "Mutações"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 3 },
  { id: "bio-03", subject: "Biologia", topic: "Fisiologia Animal", subtopics: ["Sistema nervoso", "Sistema circulatório", "Sistema respiratório", "Sistema digestório", "Hormônios"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },
  { id: "bio-04", subject: "Biologia", topic: "Ecologia", subtopics: ["Cadeias alimentares", "Ciclos biogeoquímicos", "Biomas", "Impactos ambientais"], vestibulares: ["enem","pism","unicamp"], weight: 2, difficulty: 1 },
  { id: "bio-05", subject: "Biologia", topic: "Evolução", subtopics: ["Darwin/Lamarck", "Especiação", "Evidências evolutivas", "Filogenia"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 2, difficulty: 2 },
  { id: "bio-06", subject: "Biologia", topic: "Histologia", subtopics: ["Tecidos epiteliais", "Tecidos conjuntivos", "Tecido muscular", "Tecido nervoso"], vestibulares: ["fuvest","unicamp","einstein","famerp"], weight: 2, difficulty: 2 },
  { id: "bio-07", subject: "Biologia", topic: "Embriologia", subtopics: ["Gametogênese", "Fecundação", "Desenvolvimento embrionário", "Anexos embrionários"], vestibulares: ["fuvest","unicamp","einstein","famerp"], weight: 2, difficulty: 2 },
  { id: "bio-08", subject: "Biologia", topic: "Botânica", subtopics: ["Morfologia vegetal", "Fisiologia vegetal", "Fotossíntese", "Reprodução"], vestibulares: ["fuvest","pism","unicamp"], weight: 2, difficulty: 2 },
  { id: "bio-09", subject: "Biologia", topic: "Microbiologia e Imunologia", subtopics: ["Vírus", "Bactérias", "Sistema imunológico", "Doenças infecciosas"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },

  // ── QUÍMICA ──
  { id: "qui-01", subject: "Química", topic: "Química Orgânica", subtopics: ["Funções orgânicas", "Nomenclatura", "Isomeria", "Polímeros"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 3 },
  { id: "qui-02", subject: "Química", topic: "Reações Orgânicas", subtopics: ["Adição", "Substituição", "Eliminação", "Oxidação"], vestibulares: ["fuvest","unicamp","einstein","famerp"], weight: 2, difficulty: 3 },
  { id: "qui-03", subject: "Química", topic: "Termoquímica", subtopics: ["Entalpia", "Lei de Hess", "Calor de reação", "Energia de ligação"], vestibulares: ["fuvest","unicamp","einstein","pism"], weight: 2, difficulty: 2 },
  { id: "qui-04", subject: "Química", topic: "Equilíbrio Químico", subtopics: ["Constante de equilíbrio", "Princípio de Le Chatelier", "Kp e Kc"], vestibulares: ["fuvest","unicamp","einstein","famerp","pism"], weight: 2, difficulty: 3 },
  { id: "qui-05", subject: "Química", topic: "Eletroquímica", subtopics: ["Pilhas e baterias", "Eletrólise", "Potencial de redução"], vestibulares: ["fuvest","unicamp","pism","einstein"], weight: 2, difficulty: 3 },
  { id: "qui-06", subject: "Química", topic: "Soluções", subtopics: ["Concentração", "Diluição", "Propriedades coligativas", "pH e pOH"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },
  { id: "qui-07", subject: "Química", topic: "Cinética Química", subtopics: ["Velocidade", "Fatores que afetam", "Catalisadores", "Ordem de reação"], vestibulares: ["fuvest","unicamp","pism"], weight: 2, difficulty: 2 },

  // ── FÍSICA ──
  { id: "fis-01", subject: "Física", topic: "Mecânica Clássica", subtopics: ["Cinemática", "Dinâmica (Leis de Newton)", "Trabalho e Energia", "Momentum"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 3 },
  { id: "fis-02", subject: "Física", topic: "Gravitação", subtopics: ["Leis de Kepler", "Lei da Gravitação Universal", "Satélites"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 2, difficulty: 2 },
  { id: "fis-03", subject: "Física", topic: "Termodinâmica", subtopics: ["Leis da termodinâmica", "Máquinas térmicas", "Entropia", "Transformações gasosas"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 3 },
  { id: "fis-04", subject: "Física", topic: "Eletromagnetismo", subtopics: ["Eletrostática", "Circuitos", "Magnetismo", "Indução eletromagnética"], vestibulares: ["fuvest","unicamp","pism","einstein","famerp"], weight: 2, difficulty: 3 },
  { id: "fis-05", subject: "Física", topic: "Óptica e Ondas", subtopics: ["Reflexão e refração", "Lentes", "Espelhos", "Ondas mecânicas e sonoras"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 2, difficulty: 2 },
  { id: "fis-06", subject: "Física", topic: "Física Moderna", subtopics: ["Relatividade", "Fotoelétrico", "Radioatividade", "Modelo atômico"], vestibulares: ["enem","fuvest","unicamp"], weight: 2, difficulty: 2 },

  // ── MATEMÁTICA ──
  { id: "mat-01", subject: "Matemática", topic: "Álgebra e Funções", subtopics: ["Funções", "Equações", "Sistemas lineares", "Módulo e inequações"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },
  { id: "mat-02", subject: "Matemática", topic: "Trigonometria", subtopics: ["Razões trigonométricas", "Identidades", "Funções trigonométricas", "Equações"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 3 },
  { id: "mat-03", subject: "Matemática", topic: "Geometria Plana", subtopics: ["Áreas", "Perímetros", "Semelhança", "Círculo"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },
  { id: "mat-04", subject: "Matemática", topic: "Geometria Espacial", subtopics: ["Prismas", "Pirâmides", "Cilindro", "Cone", "Esfera"], vestibulares: ["fuvest","unicamp","einstein","pism"], weight: 2, difficulty: 3 },
  { id: "mat-05", subject: "Matemática", topic: "Análise Combinatória e Probabilidade", subtopics: ["Permutação", "Combinação", "Arranjo", "Probabilidade condicional"], vestibulares: ["enem","fuvest","unicamp","pism","einstein"], weight: 2, difficulty: 3 },
  { id: "mat-06", subject: "Matemática", topic: "Progressões e Logaritmos", subtopics: ["PA", "PG", "Logaritmos", "Exponencial"], vestibulares: ["fuvest","unicamp","pism","einstein"], weight: 2, difficulty: 2 },
  { id: "mat-07", subject: "Matemática", topic: "Estatística", subtopics: ["Média", "Mediana", "Moda", "Desvio padrão", "Gráficos"], vestibulares: ["enem","fuvest","unicamp"], weight: 2, difficulty: 1 },
  { id: "mat-08", subject: "Matemática", topic: "Geometria Analítica", subtopics: ["Retas", "Circunferência", "Cônicas"], vestibulares: ["fuvest","unicamp","einstein","pism"], weight: 2, difficulty: 3 },

  // ── PORTUGUÊS ──
  { id: "por-01", subject: "Português", topic: "Interpretação de Texto", subtopics: ["Inferência", "Coesão e coerência", "Gêneros textuais", "Intenção comunicativa"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 1 },
  { id: "por-02", subject: "Português", topic: "Gramática Normativa", subtopics: ["Morfologia", "Sintaxe", "Regência", "Concordância", "Crase"], vestibulares: ["fuvest","pism","einstein"], weight: 2, difficulty: 2 },
  { id: "por-03", subject: "Português", topic: "Estilística e Figuras de Linguagem", subtopics: ["Metáfora", "Metonímia", "Ironia", "Prosódia", "Intertextualidade"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 2, difficulty: 2 },
  { id: "por-04", subject: "Redação", topic: "Redação Dissertativo-Argumentativa", subtopics: ["Estrutura dissertativa", "Proposta de intervenção", "Coesão", "Repertório cultural"], vestibulares: ["enem","fuvest","unicamp","pism","einstein","famerp"], weight: 3, difficulty: 2 },

  // ── HISTÓRIA ──
  { id: "his-01", subject: "História", topic: "Brasil República", subtopics: ["República Velha", "Era Vargas", "Ditadura Militar", "Redemocratização"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 3, difficulty: 2 },
  { id: "his-02", subject: "História", topic: "Guerras Mundiais e Guerra Fria", subtopics: ["1ª Guerra", "2ª Guerra", "Holocausto", "URSS vs EUA", "Descolonização"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 3, difficulty: 2 },
  { id: "his-03", subject: "História", topic: "Brasil Colonial", subtopics: ["Capitanias hereditárias", "Ciclos econômicos", "Escravidão", "Quilombos"], vestibulares: ["fuvest","unicamp","pism"], weight: 2, difficulty: 1 },
  { id: "his-04", subject: "História", topic: "Revoluções Liberais", subtopics: ["Rev. Francesa", "Rev. Americana", "Rev. Industrial", "Iluminismo"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 2, difficulty: 2 },

  // ── GEOGRAFIA ──
  { id: "geo-01", subject: "Geografia", topic: "Geopolítica", subtopics: ["Conflitos internacionais", "Blocos econômicos", "Globalização", "Terrorismo"], vestibulares: ["enem","fuvest","unicamp","pism"], weight: 3, difficulty: 2 },
  { id: "geo-02", subject: "Geografia", topic: "Questões Ambientais", subtopics: ["Biomas brasileiros", "Mudanças climáticas", "Crise hídrica", "Desmatamento"], vestibulares: ["enem","unicamp","pism"], weight: 2, difficulty: 1 },
  { id: "geo-03", subject: "Geografia", topic: "Cartografia e Espaço Geográfico", subtopics: ["Projeções", "Fusos horários", "Urbanização", "Migrações"], vestibulares: ["enem","fuvest","pism"], weight: 2, difficulty: 2 },

  // ── LITERATURA ──
  { id: "lit-01", subject: "Literatura", topic: "Realismo/Naturalismo", subtopics: ["Dom Casmurro", "Memórias Póstumas", "O Cortiço", "Quincas Borba"], vestibulares: ["fuvest","unicamp","pism"], weight: 3, difficulty: 2 },
  { id: "lit-02", subject: "Literatura", topic: "Modernismo Brasileiro", subtopics: ["A Hora da Estrela", "Vidas Secas", "Grande Sertão: Veredas"], vestibulares: ["fuvest","unicamp","pism"], weight: 3, difficulty: 2 },
  { id: "lit-03", subject: "Literatura", topic: "Literatura Contemporânea", subtopics: ["Quarto de Despejo", "Torto Arado", "Escritoras negras contemporâneas"], vestibulares: ["fuvest","unicamp","pism"], weight: 2, difficulty: 1 },
];

export function getTopicsForVestibulares(vestibularIds: string[]): VestibularTopic[] {
  if (vestibularIds.length === 0) return VESTIBULAR_TOPICS;
  return VESTIBULAR_TOPICS.filter((t) =>
    t.vestibulares.some((v) => vestibularIds.includes(v))
  );
}

export function getTopicsBySubject(vestibularIds: string[]): Record<string, VestibularTopic[]> {
  const topics = getTopicsForVestibulares(vestibularIds);
  return topics.reduce<Record<string, VestibularTopic[]>>((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = [];
    acc[t.subject].push(t);
    return acc;
  }, {});
}
