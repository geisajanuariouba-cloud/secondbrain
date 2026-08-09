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
  { key: "matematica", name: "Matemática", color: "var(--c-pink)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "portugues", name: "Português", color: "var(--c-amber)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "redacao", name: "Redação", color: "var(--c-blue)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "literatura", name: "Literatura", color: "var(--secondary)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "historia", name: "História", color: "var(--text-secondary)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "geografia", name: "Geografia", color: "var(--warning)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "biologia", name: "Biologia", color: "var(--secondary)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "fisica", name: "Física", color: "var(--c-rose)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "quimica", name: "Química", color: "var(--accent)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "ingles", name: "Inglês", color: "var(--danger)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "sociologia", name: "Sociologia", color: "var(--c-green)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "filosofia", name: "Filosofia", color: "var(--c-lilac)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
  { key: "atualidades", name: "Atualidades", color: "var(--c-cyan)", hours: 0, questions: 0, correct: 0, pendingRevisions: 0, mastery: 0 },
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

export const CONTENTS: Content[] = [];

// ---- Tarefas ----
export type Task = {
  id: string;
  name: string;
  subject?: SubjectKey;
  type: "Tarefa" | "Trabalho" | "Apresentação";
  status: "Não iniciada" | "Em andamento" | "Concluído";
  date: string;
};

export const TASKS: Task[] = [];

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

export const REVISIONS: Revision[] = [];

// ---- Simulados ----
export type Simulation = {
  id: string;
  name: string;
  type: "ENEM" | "FUVEST" | "PISM" | "PLATAFORMA ASSAAD" | "POLIEDRO" | "SAS";
  date: string;
  total: number;
  correct: number;
};

export const SIMULATIONS: Simulation[] = [];

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
export const LITERARY_WORKS: LiteraryWork[] = [];

// ---- Artigos (Lista de Leitura) ----
export type Article = { id: string; title: string; read: boolean; rating: number };
export const ARTICLES: Article[] = [];

// ---- Rotina ----
export type Activity = {
  id: string;
  name: string;
  timeOfDay: "Manhã" | "Tarde" | "Noite";
  category: "Estudos" | "Self care" | "Meter o shape" | "Aproximar de Deus" | "Trabalho" | "Lazer";
  done: boolean;
  time?: string;
};

export const ACTIVITIES: Activity[] = [];

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
  // Recebe entradas e distribui 50% Nubank/Mercado Pago (até cobrir gastos mensais) + 50% Kast
  { id: "acc-inter-mae",      name: "Inter Mãe",      bank: "Banco Inter", type: "Corrente",   balance: 0, color: "var(--c-blue)",   emoji: "👩" },
  // Maquininha — 100% das vendas vai para a Inter Mãe
  { id: "acc-stone",          name: "Stone (Salão)",  bank: "Stone",       type: "Empresarial",balance: 0, color: "var(--text-muted)",emoji: "🟢" },
  { id: "acc-santander",      name: "Santander (parada por enquanto)", bank: "Santander", type: "Corrente", balance: 0, color: "var(--danger)",   emoji: "🔴" },
  { id: "acc-itau",           name: "Itaú (parado por enquanto)",      bank: "Itaú",      type: "Corrente", balance: 0, color: "var(--c-amber)",  emoji: "🟧" },
  { id: "acc-pagseguro",      name: "PagSeguro (inativa)",             bank: "PagSeguro", type: "Digital",  balance: 0, color: "var(--text-muted)", emoji: "⚪" },
];

export const TRANSACTIONS: Transaction[] = [];

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

export const BOOKS: Book[] = [];

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
export const GOALS: Goal[] = [];

// ---- Hábitos / streak ----
export const STUDY_STREAK = 0; // dias consecutivos
export const WATER_GLASSES = { current: 0, target: 8 };

// ---- Série temporal: horas estudadas por dia (últimos 7 dias) ----
export const STUDY_TREND: { day: string; hours: number; questions: number }[] = [];

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
export const WATER_HISTORY: WaterDay[] = [];

// ---- Alimentação ----
export type Meal = {
  id: string;
  name: string;
  time: string;
  items: string[];
  calories: number;
  done: boolean;
};
export const MEALS_TODAY: Meal[] = [];

// ---- Self Care ----
export type SkinStep = { id: string; name: string; done: boolean };
export const SKINCARE_MORNING: SkinStep[] = [
  { id: "sk-m1", name: "Limpeza facial", done: false },
  { id: "sk-m2", name: "Tônico", done: false },
  { id: "sk-m3", name: "Hidratante", done: false },
  { id: "sk-m4", name: "Protetor solar FPS 50", done: false },
];
export const SKINCARE_EVENING: SkinStep[] = [
  { id: "sk-e1", name: "Demaquilante/limpeza dupla", done: false },
  { id: "sk-e2", name: "Tônico", done: false },
  { id: "sk-e3", name: "Sérum", done: false },
  { id: "sk-e4", name: "Hidratante noturno", done: false },
];
export type WeeklyCareItem = { id: string; name: string; frequency: string; done: boolean };
export const WEEKLY_CARE: WeeklyCareItem[] = [
  { id: "wc-1", name: "Clarear dentes", frequency: "2x/semana", done: false },
  { id: "wc-2", name: "Loirar pelo", frequency: "1x/semana", done: false },
  { id: "wc-3", name: "Maquiar", frequency: "1x/semana", done: false },
  { id: "wc-4", name: "Tomar banho (spa)", frequency: "1x/semana", done: false },
  { id: "wc-5", name: "Refazer cabelo", frequency: "1x/semana", done: false },
];
export type MoodEntry = { date: string; mood: 1 | 2 | 3 | 4 | 5; note?: string };
export const MOOD_LOG: MoodEntry[] = [];
export const GRATITUDE_LOG: { date: string; items: string[] }[] = [];

// ---- Hobbies ----
export type HobbyProject = {
  id: string;
  name: string;
  description: string;
  status: "Ativo" | "Em pausa" | "Concluído" | "Ideia";
  category: "Negócio" | "Criativo" | "Pessoal";
  color: string;
};
export const HOBBY_PROJECTS: HobbyProject[] = [];
export type MediaItem = {
  id: string;
  title: string;
  type: "Série" | "Filme" | "Anime" | "Documentário";
  status: "Assistindo" | "Finalizado" | "Lista";
  rating?: number;
  genre?: string;
};
export const WATCHLIST: MediaItem[] = [];

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
  { id: "sh-1", name: "Aplique de cabelo", category: "Pessoal", priority: "Média", bought: false },
  { id: "sh-2", name: "Umidificador", category: "Casa", priority: "Média", bought: false },
  { id: "sh-3", name: "Essência de lavanda", category: "Casa", priority: "Baixa", bought: false },
  { id: "sh-4", name: "Perfume", category: "Pessoal", priority: "Baixa", bought: false },
  { id: "sh-5", name: "Material escolar (semestral)", category: "Estudos", priority: "Alta", bought: false },
];
export type WishlistItem = { id: string; name: string; price?: number; link?: string; priority: "Alta" | "Média" | "Baixa" };
export const WISHLIST: WishlistItem[] = [
  { id: "wi-1", name: "PC novo", priority: "Alta" },
  { id: "wi-2", name: "MacBook", priority: "Alta" },
  { id: "wi-3", name: "Teclado (PC)", priority: "Média" },
  { id: "wi-4", name: "Fone de ouvido", priority: "Média" },
  { id: "wi-5", name: "Microfone", priority: "Média" },
  { id: "wi-6", name: "Suporte para microfone", priority: "Baixa" },
  { id: "wi-7", name: "Fans (PC)", priority: "Baixa" },
  { id: "wi-8", name: "Câmera digital", priority: "Média" },
];
export type Trip = {
  id: string;
  destination: string;
  status: "Sonho" | "Planejando" | "Confirmada" | "Realizada";
  date?: string;
  budget?: number;
  notes?: string;
};
export const TRIPS: Trip[] = [];

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
  // Inscrições — preenchido conforme edital de cada ciclo é divulgado
  registrationOpensAt?: string; // data confirmada de abertura das inscrições (YYYY-MM-DD)
  registrationClosesAt?: string;
  registrationNote?: string; // status textual quando a data ainda não é conhecida
  registrationUrl?: string;
};

const MOD1_SUBJECTS = ["Biologia", "Química", "Física", "Matemática", "Português", "Literatura", "Redação", "História", "Geografia", "Inglês"];
const MOD1_SUBJECTS_FULL = [...MOD1_SUBJECTS, "Sociologia", "Filosofia"];
const ALL_SUBJECTS = ["Português", "Literatura", "Redação", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Sociologia", "Filosofia", "Inglês"];

// PISM Módulo I — conteúdo verificado via COPESE/UFJF (Módulo I NÃO cobra Filosofia e Sociologia)
const PISM_MOD1 = "[Oficial · Programa PISM/UFJF, ed. reformulada 2022, out/2022 — 118 págs.] Geografia — Espaço e representação: localização, orientação, projeções cartográficas, novas tecnologias e suas aplicabilidades, cartografia e política (territórios, territorialidades, fronteiras). Natureza e tecnologias: estrutura geológica, pedologia, formas do relevo e formas de exploração; classificação climática e suas aplicabilidades; domínios morfoclimáticos brasileiros e do mundo e patrimônio ambiental; domínios naturais e recursos hídricos (global/nacional/regional) e atividades socioeconômicas, populações indígenas/quilombolas/tradicionais; interpretação de representações gráficas e cartográficas dos domínios naturais. Fontes de energia e a sociedade: diferentes possibilidades de obtenção de energia (tradicionais, modernas, alternativas) e suas implicações socioeconômicas e ambientais. Meio ambiente: globalização dos impactos ambientais; impactos ambientais — exploração, preservação e desenvolvimento; políticas ambientais no Brasil e conferências globais · História — África Antiga e Antiguidade Clássica: primeiros hominídeos (Homo habilis/erectus/sapiens, Paleolítico/Neolítico); sociedades africanas Kush, Axum, Bantu e Berberes (papel das mulheres, instituições); Egito Antigo (rio Nilo, relações com a África, instituições políticas); Grécia e Roma Antigas (democracia ateniense, escravidão comparada, instituições da República Romana, Direito Romano, cidadania grega x romana x contemporânea). Formação/consolidação/transformação do mundo medieval: passagem do mundo antigo ao medieval; feudalismo (produção e organização social); mentalidades (cristianismo e Igreja Católica, poder e saber); mundo islâmico (organização cultural/religiosa, reinos africanos Ghana/Mali/Songhai, expansão muçulmana no Egito/Magreb/costa oriental da África/Sudão). Construção do Mundo Moderno: expansão marítima europeia Portugal e Espanha; povos originários das Américas (Maias, Incas, Astecas, Tupis — impactos da colonização, extermínio e aculturação); relações Europa-Américas-África (diáspora africana, formas de escravidão); Humanismo e Renascimento (raça, civilização, barbárie); Reforma Protestante (Luteranismo, Calvinismo, Anglicanismo) e Contrarreforma Católica (Inquisições); formação dos Estados Nacionais Europeus Portugal/Espanha/França (absolutismo monárquico, mercantilismo). Colonização das Américas: semelhanças/diferenças entre colonização portuguesa, espanhola e inglesa (etnia, raça, nação, dominação/resistência); América Portuguesa (povos indígenas tupis, macro-jês, pataxós, aimorés — relações de trabalho e organização político-administrativa); América Espanhola (Astecas, Incas, Maias); América Inglesa (organização político-administrativa) · Biologia: Conhecimento e Ciência (saber popular x científico, impactos das ciências naturais na sociedade), Bioquímica e Célula (propriedades da água, carboidratos/lipídeos/proteínas/ácidos nucleicos, enzimas, vitaminas), características morfofuncionais e evolutivas das células (tipos celulares, células animais/vegetais, membrana plasmática, citoesqueleto, organelas — ribossomos, retículos, lisossomos, complexo de Golgi, mitocôndrias e plastídeos), Ciclo celular (núcleo celular, ácidos nucleicos, mitose e meiose), Histologia (tecidos epitelial/conjuntivo/muscular/nervoso, neurotransmissores e drogas) · Química: Constituição e Propriedades da Matéria (história e filosofia da ciência — modelos atômicos de Dalton/Thomson/Rutherford, tabela periódica, constituição da matéria — moléculas/íons/fórmulas, interações entre partículas — sólidos/líquidos/gases, compostos inorgânicos — metais/ácidos/bases/óxidos/sais, ligações químicas — valências/cátions/ânions, misturas e substâncias, transformações físicas e químicas), Transformações da Matéria (reações químicas — neutralização, chuva ácida; modelo de Dalton — conservação de átomos e massa), Química/Ambiente/Saúde/Vida (composição do solo/água/ar, ciclo da água, tratamento de água — gradeamento/floculação/sedimentação/filtração/coagulação/desinfecção/fluoretação) · Física: Movimento e equilíbrio (grandezas escalares/vetoriais, velocidades e acelerações médias/instantâneas, movimento em 1-2 dimensões, referenciais inerciais, tipos de força, Leis de Newton, peso e aceleração da gravidade, Leis de Kepler, torque, máquinas simples, Lei da Gravitação Universal), Leis de conservação da energia e do movimento linear (trabalho e potência, energia cinética/potencial/mecânica, forças conservativas/dissipativas, conservação da energia, momento linear e sua conservação, colisões) · Língua Portuguesa — habilidades gerais (todos os campos): objetivo comunicativo dos gêneros, coesão textual lexical/referencial, tema/tese/argumentos, discurso direto/indireto, informação explícita/implícita, contexto sócio-histórico de produção/circulação, coerência e progressão temática, signos verbais/visuais, gramática tradicional x variação linguística; campos de atuação social — Vida Pessoal (relato pessoal, biodata, currículo web, perfis de redes sociais), Vida Pública (debate, assembleia, manifesto, propaganda política, charge, meme, slam), Jornalístico-Midiático (notícia, fotorreportagem, reportagem multimidiática, cartaz, spot, jingle), Estudo e Pesquisa (notícia de divulgação científica, verbete, infográfico, esquema, resumo, vlogs), Artístico-Literário (charge, tirinha, poema lírico, crônica, contos, canção, biografia) · Literatura: prosa contemporânea de autoria feminina, poesia africana, negritude na poesia brasileira, pobreza na prosa brasileira — autores: Ana Paula Tavares, Carolina Maria de Jesus, Geovani Martins, Castro Alves, Conceição Evaristo, Conceição Lima, Jarid Arraes, José Craveirinha, Noémia de Sousa, Paulina Chiziane · Matemática — Álgebra: conjuntos numéricos (naturais/inteiros/racionais/irracionais/reais, reta real), estudo geral de funções (gráfico, crescimento/decrescimento, sinal, extremos), função constante/afim/quadrática/exponencial, razão e proporção (direta/inversa); Geometria: triângulos, polígonos, polígonos regulares, quadriláteros notáveis, congruência de triângulos, semelhança de triângulos, relações métricas e trigonométricas no triângulo retângulo, áreas de figuras planas · Inglês: funções comunicativas, vocabulário essencial, interpretação de texto. Obs.: Filosofia e Sociologia não integram o Módulo I.";
const PISM_MOD2 = "[Oficial · Programa PISM/UFJF, ed. reformulada 2022, out/2022 — 118 págs.] Geografia — Urbanização e cidades: papel da acumulação de capital e do Estado na organização do espaço urbano; espaços da circulação e papel do setor terciário (indústria cultural, consumismo); cotidiano da paisagem urbana e fragmentação socioeconômica; redes urbanas, hierarquias e metropolização; interpretação cartográfica do espaço urbano. Espaço agrário e relações com o espaço urbano-industrial: formas de organização da produção agrária; modernização da agropecuária, complexos agroindustriais e organização territorial da agricultura brasileira; singularidades/contradições campo-cidade; conflitos pela terra e interesses divergentes; pluralidade cultural e demarcação de terras ribeirinhas/indígenas/quilombolas. Evolução da indústria e sua dinâmica na contemporaneidade: Revolução Industrial e desenvolvimento desigual da indústria; fatores de localização industrial; Divisão Internacional do Trabalho. As questões demográficas: distribuição espacial/crescimento/estrutura da população mundial e brasileira; mobilidade populacional no mundo e no Brasil; teorias e políticas demográficas; diversidade étnico-cultural da população; dinâmica territorial das comunidades tradicionais · História — Crise do Antigo Regime: Revoluções Inglesas do século XVII; Iluminismo (despotismo esclarecido em Portugal/Espanha, contradições — primeiras aparições do racismo); Revolução Industrial (consequências das máquinas, movimentos sociais, papel feminino); Revolução Francesa e Império Napoleônico (sociedades liberais burguesas, Direitos Humanos). Era das Revoluções e Independências nas Américas: conjurações mineira e baiana no Brasil colonial; Treze Colônias inglesas (Constituição de 1787); Haiti (Revolução Haitiana x Revolução Francesa); América espanhola (expansionismo napoleônico e independências). Construção dos Estados Nacionais e liberalismos no século XIX: revoluções liberais de 1820/1830/1848; Américas inglesa e espanhola (caudilhismo, expansão territorial dos EUA e escravidão). O Brasil no século XIX: transferência da Corte portuguesa; construção do Estado Imperial (Constituição de 1824, Revolução Pernambucana, Guerra da Cisplatina, Regência); sociedade e cultura no Brasil do XIX (D. Pedro II, povos indígenas, memória nacional); economia cafeeira e crise do trabalho escravo (leis graduais de emancipação, teorias raciais/imigração); crise do Império e instauração da República (Guerra do Paraguai, abolicionistas negros — Luiz Gama, José do Patrocínio, André Rebouças). Os mundos do trabalho no século XIX: doutrinas políticas/sociais europeias (liberalismo, socialismo, anarquismo, comunismo, nacionalismos — Comuna de Paris); imperialismos na África/Ásia/América (partilha afro-asiática, guerra dos boxers/ópio/bôeres, Império Americano na América Latina) · Biologia: diversidade dos seres vivos, Vírus (características, ecologia, viroses, vacinas), Bactérias (eubactérias/cianobactérias/Archaebacteria, antibióticos), Fungos, Algas, Protozoários (doenças e prevenção), Animais (desenvolvimento embrionário, poríferos/cnidários/protostômios/deuterostômios, adaptações evolutivas, importância na saúde pública), Plantas (criptógamas — briófitas/pteridófitas, fanerógamas — gimnospermas/angiospermas, tecidos vegetais, flor/fruto/semente) · Química: Constituição e Propriedades da Matéria (massa molar/eletronegatividade/NOX, compostos orgânicos — hidrocarbonetos e classes funcionais oxigenadas/nitrogenadas/halogenadas, nomenclatura IUPAC até 8 carbonos, interações intermoleculares — solvatação/micelas, ligações químicas — regra do octeto/Lewis/geometria molecular), Transformação da Matéria (soluções — coeficiente de solubilidade, concentração g/L-mol/L-%-ppm, diluição; energia nas transformações — endo/exotérmicas, Lei de Hess; quantidade de matéria; estequiometria), Química/Ambiente/Saúde/Vida (poluição da água/solo/ar por compostos orgânicos, fontes de energia solar/eólica/biomassa/fóssil/hidrelétrica) · Física: Oscilações (movimento harmônico simples, tipos de ondas, reflexão/refração/difração/interferência/polarização, ressonância, acústica — eco/reverberação/batimento/efeito Doppler, instrumentos musicais), Temperatura e calor (escalas termométricas, dilatação térmica, calor específico/capacidade térmica/calor latente, transmissão de calor, mudanças de fase), Termodinâmica (transformações gasosas, leis da termodinâmica, máquinas térmicas e frigoríficas, Ciclo de Carnot), Ótica (luz e cores, reflexão/refração, espelhos planos/esféricos, prismas, lentes esféricas, instrumentos óticos), Fluidos (densidade, pressão, Princípio de Pascal, Princípio de Arquimedes, Teorema de Stevin, vazão) · Português/Literatura: cumulativo ao Módulo I — habilidades gerais aprofundadas (seleções lexicais, modalização do discurso, coesão sequencial de causa/consequência/finalidade, intertextualidade/interdiscursividade, variação linguística); campos — Vida Pessoal (autobiografia, tutorial, resenha, roteiro, podcast), Vida Pública (debate político, abaixo-assinado, estatuto, regimento), Jornalístico-Midiático (parcialidade/imparcialidade em notícias, infográfico, artigo de opinião), Estudo e Pesquisa (produção/divulgação do conhecimento, relatório, reportagem científica), Artístico-Literário (história em quadrinho, crônica narrativa/jornalística/dissertativa, conto fantástico/maravilhoso, poema dramático); romance realista em Portugal e no Brasil, contos de autoria feminina brasileira, poesia modernista (ruptura/subjetividade/memória), povos indígenas na poesia — autores: Carlos Drummond de Andrade, Clarice Lispector, Eça de Queiroz, Eliane Potiguara, Gonçalves Dias, Lygia Fagundes Telles, Machado de Assis, Manuel Bandeira · Matemática — Álgebra: ciclo trigonométrico, funções seno e cosseno, trigonometria em triângulo qualquer (lei dos senos/cossenos), progressão aritmética (PA) e geométrica (PG — incluindo PG convergente, juros simples/compostos), cálculo de grandezas (área/volume/capacidade/massa); Geometria: cálculo de área de superfície, área e volume de sólidos geométricos (prismas/pirâmides/cilindro/cone/esfera), planificações de sólidos; Estatística e Probabilidade: medidas de tendência central (média/moda/mediana) e dispersão (amplitude/variância/desvio padrão), tabelas e gráficos de frequência (colunas/barras/linhas/setores/histograma) · Inglês: gramática instrumental, interpretação de texto.";
const PISM_MOD3 = "[Oficial · Programa PISM/UFJF, ed. reformulada 2022, out/2022 — 118 págs.] Geografia — Desigualdades sociais, fluxos populacionais e contenções territoriais: mobilidade de trabalhadores e refugiados políticos/ambientais; fluxos turísticos e impactos; exploração do trabalho e Direitos Humanos; territorialidade dos movimentos sociais, ações afirmativas e interseccionalidades. Desenvolvimento desigual do capitalismo na contemporaneidade: globalização do capitalismo e mundo do trabalho; organização do poder econômico/político mundial (organismos internacionais, blocos econômicos, ONGs); ordem geopolítica mundial e nova Divisão Internacional do Trabalho; redes geográficas (materiais e imateriais) no mundo globalizado. Globalização e fragmentação na Nova Ordem Mundial: arranjo territorial/geopolítico pós-Segunda Guerra e Guerra Fria; mundo multipolar e hegemonia dos EUA; subdesenvolvimento, autoritarismo e populismo na América Latina; conflitos e tensões territoriais pós-Guerra Fria (regionalismos, separatismos, lutas identitárias étnicas/religiosas) · História — Brasil Republicano 1889-1945 (Mudanças, Autoritarismos e Resistências): implantação da República; Primeira República 1889-1930 (caráter oligárquico, Constituição de 1891); Era Vargas 1930-1945 (Constituição de 1934, Golpe do Estado Novo). Era dos Extremos (Guerra, Propaganda e Política de Massas): Primeira Guerra Mundial 1914-1918; Revolução Russa 1917; Crise de 1929 e ascensão do Fascismo (Itália/Alemanha); Fascismo e Segunda Guerra Mundial 1939-1945 (ideologias racistas/nazistas). Guerra Fria — O Mundo Dividido: blocos capitalista e socialista; Revolução Cubana 1953-1959; Guerra da Coreia 1950-1953 e Guerra do Vietnã 1955-1975; independências e pós-independências dos países africanos. Brasil: Uma Experiência Democrática 1945-1964: fim do Estado Novo ao Golpe Civil-Militar de 1964 (governos Vargas, JK, Jânio Quadros, João Goulart). A Ditadura Civil-Militar no Brasil e na América do Sul: Governo Castelo Branco a João Figueiredo 1964-1985; desdobramentos no Uruguai 1973-1985, Chile 1973-1990 e Argentina 1976-1983 (Operação Condor). Brasil: Das Diretas-Já à política contemporânea: Governo Sarney ao impeachment de Collor (Constituição de 1988); Plano Real (Itamar a FHC); de Lula às Jornadas de Junho de 2013; desdobramentos dos dias atuais. Mundo contemporâneo: Queda do Muro de Berlim 1989 e fim da URSS 1991; EUA e a Guerra ao Terror (11 de setembro de 2001); Primavera Árabe 2010; minorias sociais contra exclusão social e política (mulheres, LGBTQIA+, negros, indígenas) · Sociologia — A Sociologia como ciência e seus modelos de explicação: senso comum x pensamento científico; Ciências Sociais como leitura crítica da realidade social; desnaturalização/estranhamento de condutas sociais; teorias dos autores clássicos Marx, Weber e Durkheim. Indivíduo, Sociedade, Instituições Sociais e seus papéis: socialização; papel da família/instituições religiosas/escola/trabalho/mídia/política. Identidade e Cultura: constituição de identidades individuais/coletivas; conceitos antropológicos de cultura, etnocentrismo, alteridade e diversidade. Trabalho, produção, tecnologias e estratificação: produção e trabalho, Divisão Internacional do Trabalho; terra/trabalho/violência, marcadores sociais e desigualdades no Brasil; sistemas econômicos e meio ambiente. Estrutura do mundo contemporâneo: indústria cultural; sociedades do consumo; globalização e mudanças sociais. Identidades e conflitos: diversidade cultural (povos originários, ciganos, quilombolas, ribeirinhas); lutas sociais e questões identitárias. Conflitos, Desigualdades Sociais, Múltiplas expressões da Violência e Direitos Humanos: gênero/raça/classe/religião/envelhecimento e discriminação no Brasil; violência e criminalidade na sociabilidade contemporânea; Direitos Humanos; sociabilidades juvenis; relações de poder/dominação/ideologias. Democracia, Participação Política e Cidadania: construção da democracia no Brasil; sistema eleitoral brasileiro e representatividade; Estado de Direito, cidadania, direitos/deveres, minorias e Movimentos Sociais · Filosofia: conhecimento (condições/limites/tipos — senso comum, opinião, tradição, filosófico, científico; objeto e sujeito de conhecimento), atitude de conhecimento (não dogmática, não-saber socrático, dúvida cartesiana, sapere aude kantiano, epoché husserliana), funções da Filosofia (definir, explicar, compreender, especular, criticar), lógica (princípios da identidade/não contradição/terceiro excluído/razão suficiente), verdade (científica e metafísica; correspondência, coerência, utilidade), escolas (Ceticismo, Irracionalismo, Racionalismo, Empirismo, Apriorismo), objeto de conhecimento (realismo e idealismo, fenômeno/essência/coisa em si), tipos de ciência (formais/naturais/biológicas/humanas, aplicadas/puras), liberdade (autodeterminação, responsabilidade, determinismo), ética (motivação da ação humana — virtude/felicidade/prazer/valor/dever/utilidade) · Biologia: Fundamentos de ecologia (fluxo de matéria e energia, cadeia/teia alimentar, ciclos biogeoquímicos, dinâmica populacional, bioacumulação, sucessão ecológica, biomas), Problemas ambientais (poluição solo/ar/água, camada de ozônio, efeito estufa/aquecimento global/emergência climática, impactos nos biomas brasileiros, pandemias, resíduos sólidos, energias renováveis), Hereditariedade (Leis de Mendel, dominância entre alelos, interação gênica, grupos sanguíneos, herança ligada ao sexo, heredogramas, mutações), Biotecnologia (engenharia genética, clonagem, organismos geneticamente modificados, genética molecular forense), Teorias evolucionistas (processos evolutivos, Equilíbrio de Hardy-Weinberg), Evidências evolutivas (anatomia comparada, biologia molecular, fósseis), Reprodução humana e sexualidade (sistemas genitais, ciclo menstrual, hormônios sexuais, contracepção, ISTs) · Química: Constituição e Propriedades da Matéria (modelo atômico de Bohr, reações nucleares — isótopos, compostos orgânicos/inorgânicos — polímeros, ácidos e bases de Brönsted-Lowry, interações intermoleculares, isomeria), Transformação da Matéria (pilhas eletroquímicas e potenciais, eletrólise e galvanização, oxirredução, velocidade das reações — teoria das colisões/catalisadores, equilíbrio químico — Le Chatelier/Ka/Kb/pH, reações orgânicas — halogenação/hidrogenação/esterificação/hidrólise), Química/Ambiente/Saúde/Vida (aquecimento global/chuva ácida/camada de ozônio, química em medicamentos/agrotóxicos/polímeros, descarte de resíduos sólidos/reciclagem, produção e proteção de metais — alumínio/ferro/aço/corrosão, bafômetro, sabões e detergentes, ácidos graxos cis/trans, biodiesel) · Física: Eletrostática (cargas elétricas, Lei de Coulomb, campo elétrico, potencial elétrico, capacitores), Eletricidade (corrente elétrica, Lei de Ohm, circuitos elétricos de corrente contínua), Energia Elétrica (corrente alternada, indução magnética, Lei de Biot-Savart, Lei de Ampère), Eletromagnetismo (força de Lorentz, fluxo magnético, Leis de Faraday e Lenz, transformadores e motores elétricos), Noções de física quântica e relatividade restrita (efeito fotoelétrico, dualidade partícula-onda, modelo atômico de Bohr, espectros atômicos, dilatação do tempo e contração do comprimento) · Português/Literatura: cumulativo aos módulos anteriores; campos — Vida Pessoal (carta aberta, carta de solicitação/reclamação, panfleto), Vida Pública (discursos políticos, propagandas, políticas públicas), Jornalístico-Midiático (manipulação da verdade em discursos jornalísticos, documentários, editorial), Estudo e Pesquisa (concepções de ciência e método científico, ensaio, artigo de divulgação científica), Artístico-Literário (crônica-ensaio/filosófica/histórica, conto psicológico, romance psicológico, poema épico); colonialismo/anticolonialismo na poesia, narrativa de autoria indígena, romance regionalista brasileiro, vanguardas poéticas e projetos de identidade nacional, representações de homoafetividade — autores: Aílton Krenak, Ana Cristina Cesar, Augusto de Campos, Caetano Veloso, Caio Fernando Abreu, Daniel Munduruku, Graciliano Ramos, Itamar Vieira Júnior, Luís Vaz de Camões, Natália Borges Polesso, Oswald de Andrade, Patrícia Lino, Tomás Antônio Gonzaga · Matemática — Álgebra: sistemas lineares (m equações/n incógnitas, classificação, interpretação geométrica), logaritmos e função logarítmica (abalos sísmicos, pH, radioatividade, matemática financeira); Geometria: geometria analítica — estudo de ponto e reta (distância entre pontos, ponto médio, coeficientes da reta); Números: princípio fundamental da contagem (princípio aditivo/multiplicativo, arranjo/combinação/permutação simples); Estatística e Probabilidade: probabilidade (espaço amostral, eventos sucessivos).";

// FUVEST — Programa do Vestibular 2026 (FUVEST/USP, publicado dez/2024), organizado por 4 áreas BNCC
const FUVEST_CONTENT = "FONTE: Programa do Vestibular 2026 — FUVEST/USP (Dezembro/2024) · Prova estruturada por competências e habilidades (matriz própria inspirada na BNCC), cobrando as 4 áreas em ambas as fases · Linguagens e suas Tecnologias (Arte, Educação Física, Língua Inglesa, Língua Portuguesa): gêneros textuais amplos (anedota, artigo de opinião, bula, charge, crônica, editorial, ensaio, fábula, manifesto, reportagem etc.), tipologias textuais, coesão/coerência, modalização, sintaxe, intertextualidade; movimentos literários completos — Classicismo, Barroco, Arcadismo, Romantismo, Realismo, Simbolismo, Parnasianismo, Pré-Modernismo, Modernismo; literatura brasileira, portuguesa, indígena, africana e latino-americana via lista de leituras obrigatórias; variação linguística e preconceito linguístico; Redação explora habilidades de Linguagens com múltiplos gêneros textuais possíveis e argumentação retórica com fontes verificadas · Matemática e suas Tecnologias: conjuntos numéricos (naturais, inteiros, racionais, reais), notação científica, PA/PG, plano cartesiano (retas, circunferências, sistemas lineares até 3x3), funções (1º/2º grau, racionais, modulares, exponenciais, logarítmicas, trigonométricas), geometria plana e espacial (áreas, volumes, semelhança, trigonometria, poliedros, corpos redondos), análise combinatória, probabilidade, estatística (medidas de tendência central, dispersão e posição) · Ciências da Natureza e suas Tecnologias (Física, Química, Biologia integradas): Física — mecânica clássica, termodinâmica, eletromagnetismo, óptica, ondas, física moderna (efeito fotoelétrico, radioatividade), astrofísica/cosmologia (Big Bang, evolução estelar); Química — estequiometria, termoquímica, equilíbrio químico, eletroquímica, ciclos biogeoquímicos, química orgânica, tabela periódica, ligações químicas, polímeros; Biologia — citologia, genética/DNA, evolução (teoria sintética), ecologia, fisiologia humana (sistemas do corpo), parasitologia (Schistosoma mansoni, Ascaris lumbricoides, Ancylostoma duodenale, Taenia solium/saginata, Giardia sp., Trichomonas vaginalis, Trypanosoma cruzi, Plasmodium sp.), vacinas e saúde pública · Ciências Humanas e Sociais Aplicadas (Filosofia, Geografia, História, Sociologia): Filosofia — história da filosofia (Antiga, Medieval, Renascentista/Moderna, Contemporânea), epistemologia, ética e filosofia política, estética, lógica/argumentação, antropologia filosófica; Geografia — espaço/território/fronteiras, geopolítica, migrações, urbanização, questão agrária, sustentabilidade, Direitos Humanos, povos indígenas e quilombolas; História — Antiguidade à contemporaneidade, capitalismo, revoluções, ditaduras latino-americanas, Direitos Humanos (mesmos eixos temáticos de Geografia com foco histórico-temporal); Sociologia — cultura, modernidade, mídia/redes sociais, pensamento social brasileiro, trabalho, consumo, movimentos sociais, racismo/gênero, Direitos Humanos.";

// PASES Etapa 1 — Cebraspe/UFV, organizado por áreas do conhecimento (BNCC)
const PASES_MOD1 = "FONTE: Edital nº 1 – PASES 1/UFV – Triênio 2025-2027 (Cebraspe), 8/8/2025 · Prova: 50 questões objetivas — Linguagens 14q, Ciências Humanas 12q, Matemática 12q, Ciências da Natureza 12q (peso 1,00 cada) · Língua Portuguesa: estrutura do texto, gêneros textuais, coesão e coerência, pronomes, conectivos, intertextualidade, estrutura dissertativo-argumentativa, figuras de linguagem, sintaxe (frase/oração/período simples), variação linguística · Literatura: linguagem literária, texto literário x não literário, autor/leitor/contexto, história literária, leitura crítica e comparativa, obras de autoria negra/indígena/mulheres, Quinhentismo, Barroco, Arcadismo · Língua Inglesa: informação explícita/implícita, intenção comunicativa, estratégias de leitura, recursos linguísticos (pronomes, tempos verbais, conectores, modais), gêneros textuais, diversidade linguístico-cultural · Língua Espanhola: identificação de informação específica, leitura crítica, conteúdo gramatical/lexical, variação linguística · Arte: história geral da arte (pré-história ao renascimento, arte africana), arte no Brasil (pré-colonial, cerâmica Marajoara, arte indígena e afro-brasileira), música clássica/popular até séc. XX, danças folclóricas, teatro medieval/moderno, arte-tecnologia · Educação Física: práticas corporais, saúde e estilo de vida ativo, história das ginásticas e esportes, danças folclóricas e afro-brasileiras, jogos e brincadeiras · História: Pré-História e História, fontes históricas; escravidão na Antiguidade (Roma, Grécia, Egito, reinos africanos), sistema escravista na América; alteridade (povos indígenas, tráfico transatlântico séc. XVI-XIX, Inquisição, Monarquia compósita portuguesa); Medievo (cristianismo, reinos bárbaros, impérios bizantino/carolíngio, feudalismo) · Filosofia: atitude filosófica, mitologias, tragédias gregas, Pré-Socráticos, metafísica, filosofias indígenas e africanas, antropologia filosófica, ética, lógica (proposições, falácias, dedução/indução) · Sociologia: origem da Sociologia, senso comum x conhecimento científico, cultura e identidade, etnocentrismo, relativismo cultural, socialização e instituições sociais · Geografia: espaço/lugar/território/paisagem, cartografia (escalas, coordenadas, projeções), relação natureza-sociedade, globalização, espaço geográfico brasileiro (domínios morfoclimáticos) · Matemática: números reais, potências, radiciação, notação científica, sistemas do 1º grau, funções (1º/2º grau, exponencial, logarítmica), PA/PG, geometria plana (áreas), volume de sólidos, relações métricas no triângulo retângulo, trigonometria, probabilidade e estatística · Biologia: metabolismo celular (fotossíntese, respiração celular, fermentação), efeito estufa e aquecimento global, bioacumulação e biomagnificação, ciclos biogeoquímicos (carbono, nitrogênio, água, fósforo) · Física: máquinas simples e torque, cinemática, Leis de Newton, quantidade de movimento, energia cinética/potencial/mecânica, astronomia (Leis de Kepler, gravitação universal), vetores e gráficos de movimento · Química: metodologia científica, propriedades da matéria, métodos de separação, transformações físicas/químicas, leis ponderais (Lavoisier, Proust), modelos atômicos, Tabela Periódica, ligações químicas";
const PASES_MOD2 = "Biologia: Genética Mendeliana e Cromossômica, Evolução, Ecologia · Química: Funções Inorgânicas, Estequiometria, Termoquímica, Cinética Química, Equilíbrio Químico · Física: Thermologia, Óptica Geométrica, Ondulatória, Hidrostática · Matemática: Geometria Plana, Progressões Aritméticas e Geométricas, Logaritmos e Exponenciais, Combinatória e Probabilidade · Português/Literatura: Sintaxe, Semântica, Barroco, Arcadismo, Romantismo · História: Idade Moderna, Colonização do Brasil, Século XIX e Revoluções · Geografia: Dinâmica Econômica, Urbanização, Industrialização, Questões Ambientais";
const PASES_MOD3 = "Biologia: Fisiologia Animal, Fisiologia Vegetal, Embriologia, Microbiologia, Imunologia, Biologia Molecular · Química: Química Orgânica completa, Eletroquímica, Soluções e Propriedades Coligativas · Física: Eletrostática, Eletrodinâmica, Magnetismo, Eletromagnetismo, Física Moderna e Contemporânea · Matemática: Geometria Espacial, Geometria Analítica, Estatística, Trigonometria completa · Português/Literatura: Concordância, Regência, Crase, Modernismo brasileiro, Literatura Contemporânea · História: Brasil República, I e II Guerras Mundiais, Guerra Fria, Brasil Contemporâneo · Geografia: Brasil: Regiões, Biomas e Questões Ambientais, Geopolítica Contemporânea";

// Seriado UFMG (PSAS) Etapa 1 — 45 questões objetivas + 1 discursiva interdisciplinar (confirmado UFMG)
const PSAS_MOD1 = "FONTE: Documento Norteador da Etapa 1 — Seriado UFMG, aprovado 17/6/2025 (Pró-Reitoria de Graduação/UFMG) · Prova: 1 dia, até 4h — 45 questões objetivas (peso 1) + 1-2 questões discursivas (peso 4) · Conteúdo cumulativo da 1ª série do EM, organizado nas 4 áreas da BNCC · Linguagens e suas Tecnologias: Língua Portuguesa e Literaturas (leitura e produção textual, gêneros discursivos, variação linguística, coesão/coerência), Língua Estrangeira Inglês ou Espanhol (compreensão leitora, recursos linguísticos), Artes (Visuais/Música/Teatro/Dança — história e linguagens), Educação Física (práticas corporais, saúde) — habilidades BNCC códigos EM13LP*/EM13LGG* · Matemática e suas Tecnologias: números, álgebra, funções, geometria plana, probabilidade e estatística — códigos EM13MAT* · Ciências da Natureza e suas Tecnologias: Biologia (citologia, ecologia, bioquímica básica), Física (cinemática, Leis de Newton, energia), Química (matéria, estrutura atômica, tabela periódica, ligações) — códigos EM13CNT* · Ciências Humanas e Sociais Aplicadas: Filosofia (atitude filosófica, mitologia, Pré-Socráticos), Geografia (cartografia, relevo, hidrografia, dinâmica da Terra), História (Antiguidade — Egito, Grécia, Roma, Feudalismo e Idade Média), Sociologia (origem da disciplina, cultura e sociedade) — códigos EM13CHS* · Obras de Literatura e Artes indicadas para a Etapa 1 (critério: domínio público, diversidade de autoria/gênero/etnia): obras literárias em português + obras de música, dança, teatro, pintura, escultura, cinema ou fotografia — lista divulgada junto ao edital de cada ciclo em ufmg.br/seriadoufmg";
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
    // CONFIRMADO — Edital 10/2026 (COPESE/UFJF), PISM 2027: inscrições 27/07 15h a 14/08/2026 18h, pagamento até 17/08
    registrationOpensAt: "2026-07-27",
    registrationClosesAt: "2026-08-14",
    registrationNote: "Inscrições abertas de 27/07/2026 (15h) a 14/08/2026 (18h) — edital 10/2026 COPESE/UFJF. Pagamento da taxa até 17/08.",
    registrationUrl: "https://www2.ufjf.br/copese/",
  },
  {
    id: "pases-ufv", name: "PASES", fullName: "Programa de Avaliação Seriada para Ingresso na UFV",
    university: ["UFV"],
    // CONFIRMADO (Edital nº 1 – PASES 1/UFV, triênio 2025-2027): Etapa 1 aplicada em 30/11/2025.
    // Para o triênio seguinte (2026-2028, aplicável à Livia), datas ainda não publicadas — estimativa por padrão (fim de novembro)
    date: "2026-11-29", color: "#16a34a",
    medicineAvg: 86, medicineCutNote: "Processo seriado — 3 etapas (Cebraspe) · Prova única de 50 questões: Linguagens 14, C.Humanas 12, Matemática 12, C.Natureza 12 · Etapa 3 = nota do ENEM (sem prova própria) · Peso final: Etapa1 25% + Etapa2 35% + Etapa3 40%",
    phases: 3, selected: true, type: "Seriado",
    subjects: ALL_SUBJECTS,
    phaseLabels: ["Etapa 1", "Etapa 2", "Etapa 3"],
    phaseDates: ["2026-11-29", "2027-11-28", "2028-11-26"],
    phaseSubjects: [
      ["Português", "Literatura", "Inglês", "Arte", "Educação Física", "Biologia", "Física", "Química", "Matemática", "História", "Geografia"],
      [...MOD1_SUBJECTS, "Arte", "Educação Física"],
      [...ALL_SUBJECTS],
    ],
    phaseContents: [PASES_MOD1, PASES_MOD2, PASES_MOD3],
    registrationNote: "Inscrições ainda não abertas — edital do triênio 2026-2028 ainda não publicado.",
    registrationUrl: "https://www.cebraspe.org.br/concursos/pases_1_ufv_25_27",
  },
  {
    id: "psas-ufmg", name: "Seriado UFMG", fullName: "Seriado UFMG — Processo Seletivo de Avaliação Seriada",
    university: ["UFMG"],
    // CONFIRMADO (Documento Norteador Etapa 1): 1ª etapa do 1º ciclo (2025-2027) aplicada em 14/12/2025.
    // Ciclo seguinte (2026-2028, aplicável à Livia) ainda sem edital — estimativa por padrão (meados de dezembro)
    date: "2026-12-13", color: "#dc2626",
    medicineAvg: 94, medicineCutNote: "Processo seriado — 3 etapas (BNCC), 30% das vagas · Etapa 1: 45 objetivas (peso1) + discursiva (peso4) · Etapa 3: Redação + 35 objetivas + discursivas da área do curso · Obras de Literatura/Artes obrigatórias por etapa (ufmg.br/seriadoufmg)",
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
    // CONFIRMADO — Edital nº 1183/2026 (UFMG): Etapa 1 do ciclo 2026-2028 teve inscrições
    // de 15/06 a 22/07/2026 — JÁ ENCERRADAS. Prova em 12-13/12/2026. Confira se já se inscreveu.
    registrationOpensAt: "2026-06-15",
    registrationClosesAt: "2026-07-22",
    registrationNote: "Inscrições da Etapa 1 (ciclo 2026-2028) já ENCERRADAS — foram de 15/06 a 22/07/2026, edital 1183/2026 (Copeve/UFMG). Confira se já se inscreveu!",
    registrationUrl: "https://www.ufmg.br/seriadoufmg/",
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
    phaseLabels: ["1ª Fase (objetiva)", "2ª Fase (dissertativa + redação)"],
    phaseContents: [FUVEST_CONTENT, FUVEST_CONTENT],
    registrationNote: "Inscrições ainda não abertas — normalmente abrem em agosto, para prova em novembro.",
    registrationUrl: "https://www.fuvest.br/",
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

// Gastos mensais fixos (transcritos do caderno) — datas de vencimento (nextDue) são estimativas,
// ajuste conforme a data real de cada conta. Não inclui itens marcados "x" no caderno (Higgsfield,
// ChatGPT, Academia) por não estarem sendo cobrados no momento.
export const RECURRING_EXPENSES: RecurringExpense[] = [
  // Contas de casa — 670
  { id: "re-agua", name: "Água", value: 150, frequency: "Mensal", category: "Contas de casa", nextDue: "2026-08-05", paid: false, color: "var(--c-blue)", emoji: "💧" },
  { id: "re-luz", name: "Luz", value: 300, frequency: "Mensal", category: "Contas de casa", nextDue: "2026-08-05", paid: false, color: "var(--c-amber)", emoji: "💡" },
  { id: "re-internet", name: "Internet", value: 220, frequency: "Mensal", category: "Contas de casa", nextDue: "2026-08-05", paid: false, color: "var(--c-cyan)", emoji: "📶" },

  // Alimentação
  { id: "re-alimentacao-casa", name: "Alimentação (casa)", value: 2000, frequency: "Mensal", category: "Alimentação", nextDue: "2026-08-05", paid: false, color: "var(--c-green)", emoji: "🍽️" },

  // Transporte
  { id: "re-van", name: "Van", value: 310, frequency: "Mensal", category: "Transporte", nextDue: "2026-08-05", paid: false, color: "var(--text-muted)", emoji: "🚐" },

  // Empréstimo
  { id: "re-emprestimo", name: "Empréstimo", value: 600, frequency: "Mensal", category: "Empréstimo", nextDue: "2026-08-05", paid: false, color: "var(--c-rose)", emoji: "🏦" },

  // Assinaturas
  { id: "re-discord", name: "Discord", value: 26, frequency: "Mensal", category: "Assinaturas", nextDue: "2026-08-05", paid: false, color: "var(--secondary)", emoji: "🎮" },
  { id: "re-netflix", name: "Netflix", value: 50, frequency: "Mensal", category: "Assinaturas", nextDue: "2026-08-05", paid: false, color: "var(--danger)", emoji: "📺" },
  { id: "re-claude", name: "Claude", value: 110, frequency: "Mensal", category: "Assinaturas", nextDue: "2026-08-05", paid: false, color: "var(--accent)", emoji: "🤖" },
  { id: "re-google-one", name: "Google One", value: 50, frequency: "Mensal", category: "Assinaturas", nextDue: "2026-08-05", paid: false, color: "var(--c-blue)", emoji: "☁️" },
  { id: "re-spotify", name: "Spotify", value: 25, frequency: "Mensal", category: "Assinaturas", nextDue: "2026-08-05", paid: false, color: "var(--c-green)", emoji: "🎵" },

  // Cartão de crédito
  { id: "re-cartao", name: "Cartão de crédito", value: 2000, frequency: "Mensal", category: "Cartão de crédito", nextDue: "2026-08-05", paid: false, color: "var(--c-rose)", emoji: "💳" },

  // Lazer & Compras
  { id: "re-livros", name: "Livros", value: 330, frequency: "Mensal", category: "Lazer & Compras", nextDue: "2026-08-05", paid: false, color: "var(--secondary)", emoji: "📚" },

  // Estudos
  { id: "re-assaad", name: "Plataforma Assaad", value: 300, frequency: "Mensal", category: "Estudos", nextDue: "2026-08-05", paid: false, color: "var(--secondary)", emoji: "📖" },
  { id: "re-escola", name: "Escola", value: 1900, frequency: "Mensal", category: "Estudos", nextDue: "2026-08-05", paid: false, color: "var(--secondary)", emoji: "🏫" },

  // Trabalho
  { id: "re-utmify", name: "Utmify", value: 250, frequency: "Mensal", category: "Trabalho", nextDue: "2026-08-05", paid: false, color: "var(--c-amber)", emoji: "📊" },

  // Salão / Trabalho
  { id: "re-raykou", name: "Raykou", value: 600, frequency: "Mensal", category: "Salão / Trabalho", nextDue: "2026-08-05", paid: false, color: "var(--c-lilac)", emoji: "💇‍♀️" },
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

// Baseado nos gastos fixos mensais do caderno, com categorias normais de gasto (total R$9.221)
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: "bc-estudos", name: "Estudos", emoji: "🏫", percentage: 24, spent: 2200, color: "var(--secondary)" },
  { id: "bc-cartao", name: "Cartão de crédito", emoji: "💳", percentage: 21, spent: 2000, color: "var(--c-rose)" },
  { id: "bc-alimentacao", name: "Alimentação", emoji: "🍽️", percentage: 21, spent: 2000, color: "var(--c-green)" },
  { id: "bc-casa", name: "Contas de casa", emoji: "🏠", percentage: 7, spent: 670, color: "var(--c-blue)" },
  { id: "bc-salao", name: "Salão / Trabalho", emoji: "💇‍♀️", percentage: 7, spent: 600, color: "var(--c-lilac)" },
  { id: "bc-emprestimo", name: "Empréstimo", emoji: "🏦", percentage: 7, spent: 600, color: "var(--danger)" },
  { id: "bc-lazer", name: "Lazer & Compras", emoji: "🛍️", percentage: 4, spent: 330, color: "var(--c-amber)" },
  { id: "bc-transporte", name: "Transporte", emoji: "🚐", percentage: 3, spent: 310, color: "var(--text-muted)" },
  { id: "bc-assinaturas", name: "Assinaturas", emoji: "📱", percentage: 3, spent: 261, color: "var(--accent)" },
  { id: "bc-trabalho", name: "Trabalho", emoji: "📊", percentage: 3, spent: 250, color: "var(--c-amber)" },
];

// ---- Trabalho ----
// "project" referencia o id de um WorkProject (src/lib/work-projects.ts), configurável em Configurações.
export type WorkSession = {
  id: string;
  project: string;
  description: string;
  date: string;
  hours: number;
  revenue?: number;
};

export const WORK_SESSIONS: WorkSession[] = [];

export type WorkTask = {
  id: string;
  project: string; // id de um WorkProject, ou "Pessoal" para tarefas sem projeto
  name: string;
  status: "Não iniciada" | "Em andamento" | "Concluída";
  priority: "Alta" | "Média" | "Baixa";
  due?: string;
};

export const WORK_TASKS: WorkTask[] = [];

// ---- Saúde (corpo + nutrição) ----
export type BodyMeasurement = {
  date: string;
  weight: number; // kg
  bodyFat?: number; // %
  waist?: number; // cm
  hip?: number; // cm
};

export const BODY_MEASUREMENTS: BodyMeasurement[] = [];

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

export const PRODUCT_REVIEWS: ProductReview[] = [];

// ---- Histórico de consultas IA ----
export type ConsultationMessage = { role: "user" | "ai"; content: string; time: string };
export type ConsultationSession = {
  id: string;
  persona: "Psicólogo" | "Nutricionista" | "Personal" | "Dermatologista" | "Mentor de Estudos";
  title: string;
  date: string;
  messages: ConsultationMessage[];
};

export const CONSULTATION_SESSIONS: ConsultationSession[] = [];
