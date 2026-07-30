export type WorkProject = {
  id: string; // também usado como valor de "project" nas tarefas/sessões
  name: string;
  emoji: string;
  color: string;
  description: string;
};

const STORAGE_KEY = "work-projects";

export const DEFAULT_WORK_PROJECTS: WorkProject[] = [
  { id: "Salão", name: "Salão", emoji: "💇‍♀️", color: "var(--c-lilac)", description: "Salão de beleza — atendimentos" },
  { id: "Sypoza", name: "Sypoza", emoji: "🚀", color: "var(--c-blue)", description: "Startup — estratégia & pitch" },
  { id: "Optimio", name: "Optimio", emoji: "⚙️", color: "var(--primary)", description: "Produto digital — desenvolvimento" },
];

export function loadWorkProjects(): WorkProject[] {
  if (typeof window === "undefined") return DEFAULT_WORK_PROJECTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as WorkProject[];
  } catch { /* ignore */ }
  return DEFAULT_WORK_PROJECTS;
}

export function saveWorkProjects(projects: WorkProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
