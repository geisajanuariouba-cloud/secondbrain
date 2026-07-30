"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Star, Play, Pause, Lightbulb, CheckCircle2, Tv, Plus, X, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { HOBBY_PROJECTS, WATCHLIST } from "@/lib/data";

type HobbyProject = {
  id: string;
  name: string;
  description: string;
  status: "Ativo" | "Em pausa" | "Concluído" | "Ideia";
  category: "Criativo" | "Pessoal";
  color: string;
  hours?: number;
};

type MediaItem = {
  id: string;
  title: string;
  type: "Série" | "Filme" | "Anime" | "Livro" | "Podcast" | "Documentário";
  status: "Assistindo" | "Quero ver" | "Concluído" | "Finalizado" | "Lista";
  rating?: number;
  genre?: string;
};

const STATUS_COLORS: Record<string, string> = {
  Ativo: "var(--c-green)",
  "Em pausa": "var(--c-amber)",
  Concluído: "var(--secondary)",
  Ideia: "var(--c-cyan)",
  Assistindo: "var(--accent)",
  Finalizado: "var(--c-green)",
  "Quero ver": "var(--text-muted)",
  Lista: "var(--text-muted)",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Ativo: <Play size={13} />,
  "Em pausa": <Pause size={13} />,
  Concluído: <CheckCircle2 size={13} />,
  Ideia: <Lightbulb size={13} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Criativo: "var(--c-rose)",
  Pessoal: "var(--c-cyan)",
};

const MEDIA_TYPE_EMOJI: Record<string, string> = {
  Série: "📺",
  Filme: "🎬",
  Anime: "🎌",
  Documentário: "🎥",
  Livro: "📖",
  Podcast: "🎙️",
};

const PROJECT_STATUS_CYCLE: HobbyProject["status"][] = ["Ativo", "Em pausa", "Concluído", "Ideia"];

const STORAGE_KEY = "hobbies-data";

export default function HobbiesPage() {
  const [projects, setProjects] = useState<HobbyProject[]>(() => {
    if (typeof window === "undefined") return HOBBY_PROJECTS as HobbyProject[];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.projects ?? (HOBBY_PROJECTS as HobbyProject[]);
      }
      return HOBBY_PROJECTS as HobbyProject[];
    } catch {
      return HOBBY_PROJECTS as HobbyProject[];
    }
  });

  const [watchlist, setWatchlist] = useState<MediaItem[]>(() => {
    if (typeof window === "undefined") return WATCHLIST as MediaItem[];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.watchlist ?? (WATCHLIST as MediaItem[]);
      }
      return WATCHLIST as MediaItem[];
    } catch {
      return WATCHLIST as MediaItem[];
    }
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    category: "Pessoal" as HobbyProject["category"],
    status: "Ativo" as HobbyProject["status"],
    description: "",
    hours: "",
  });

  const [mediaForm, setMediaForm] = useState({
    title: "",
    type: "Série" as MediaItem["type"],
    status: "Quero ver" as MediaItem["status"],
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, watchlist }));
  }, [projects, watchlist]);

  const active = projects.filter((p) => p.status === "Ativo");
  const watchingNow = watchlist.filter((w) => w.status === "Assistindo");

  function cycleStatus(id: string) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const idx = PROJECT_STATUS_CYCLE.indexOf(p.status);
        const next = PROJECT_STATUS_CYCLE[(idx + 1) % PROJECT_STATUS_CYCLE.length];
        return { ...p, status: next };
      })
    );
  }

  function handleAddProject() {
    if (!projectForm.name.trim()) return;
    const colors = ["var(--accent)", "var(--secondary)", "var(--c-rose)", "var(--c-cyan)", "var(--c-amber)"];
    const newProject: HobbyProject = {
      id: `hp-${Date.now()}`,
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      status: projectForm.status,
      category: projectForm.category,
      color: colors[Math.floor(Math.random() * colors.length)],
      hours: projectForm.hours ? Number(projectForm.hours) : undefined,
    };
    setProjects((prev) => [...prev, newProject]);
    setProjectForm({ name: "", category: "Pessoal", status: "Ativo", description: "", hours: "" });
    setShowProjectForm(false);
  }

  function handleAddMedia() {
    if (!mediaForm.title.trim()) return;
    const newMedia: MediaItem = {
      id: `w-${Date.now()}`,
      title: mediaForm.title.trim(),
      type: mediaForm.type,
      status: mediaForm.status,
    };
    setWatchlist((prev) => [...prev, newMedia]);
    setMediaForm({ title: "", type: "Série", status: "Quero ver" });
    setShowMediaForm(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader
        title="Hobbies"
        subtitle="Vida além dos estudos e do trabalho"
        icon={<Palette size={24} />}
        accent="var(--c-cyan)"
        action={<Badge color="var(--c-cyan)">{active.length} hobbies ativos</Badge>}
      />

      {/* Hobbies */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Lightbulb size={16} style={{ color: "var(--c-cyan)" }} />
              Meus hobbies
            </span>
          </SectionTitle>
          <button
            onClick={() => setShowProjectForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <Plus size={13} /> Novo hobby
          </button>
        </div>

        <AnimatePresence>
          {showProjectForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-border bg-surface-2/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Novo hobby</p>
                  <button onClick={() => setShowProjectForm(false)} className="text-text-muted hover:text-text">
                    <X size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Nome</label>
                    <input
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      placeholder="Ex: Aprender violão"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Categoria</label>
                    <select
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as HobbyProject["category"] })}
                    >
                      {["Criativo", "Pessoal"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Status</label>
                    <select
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as HobbyProject["status"] })}
                    >
                      {PROJECT_STATUS_CYCLE.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Horas dedicadas</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      placeholder="Ex: 12"
                      value={projectForm.hours}
                      onChange={(e) => setProjectForm({ ...projectForm, hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Descrição</label>
                    <input
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      placeholder="Breve descrição"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-1.5 rounded-xl bg-c-cyan px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <Check size={13} /> Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-border bg-surface-2/40 p-4 transition-all"
              style={{ borderLeft: `3px solid ${p.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{p.description}</p>
                  {p.hours !== undefined && (
                    <p className="mt-1 text-xs text-text-muted">{p.hours}h dedicadas</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => cycleStatus(p.id)}
                    title="Clique para avançar status"
                    className="transition-transform hover:scale-105"
                  >
                    <Badge color={STATUS_COLORS[p.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[p.status]} {p.status}
                      </span>
                    </Badge>
                  </button>
                  <Badge color={CATEGORY_COLORS[p.category]}>{p.category}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Assistindo agora */}
      {watchingNow.length > 0 && (
        <Card>
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Tv size={16} style={{ color: "var(--accent)" }} />
              Assistindo agora
            </span>
          </SectionTitle>
          <div className="mt-3 space-y-2">
            {watchingNow.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
              >
                <span className="text-2xl">{MEDIA_TYPE_EMOJI[item.type]}</span>
                <div className="flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.genre} · {item.type}</p>
                </div>
                {item.rating && (
                  <div className="flex items-center gap-1 text-sm" style={{ color: "var(--c-amber)" }}>
                    <Star size={14} fill="currentColor" />
                    <span className="font-bold">{item.rating}</span>
                  </div>
                )}
                <Badge color={STATUS_COLORS[item.status]}>{item.status}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista completa de mídia */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Tv size={16} style={{ color: "var(--c-cyan)" }} />
              Séries, Filmes & Animes
            </span>
          </SectionTitle>
          <button
            onClick={() => setShowMediaForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <Plus size={13} /> Nova mídia
          </button>
        </div>

        <AnimatePresence>
          {showMediaForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-border bg-surface-2/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Nova mídia</p>
                  <button onClick={() => setShowMediaForm(false)} className="text-text-muted hover:text-text">
                    <X size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Título</label>
                    <input
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      placeholder="Ex: Succession"
                      value={mediaForm.title}
                      onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Tipo</label>
                    <select
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      value={mediaForm.type}
                      onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value as MediaItem["type"] })}
                    >
                      {["Série", "Filme", "Anime", "Livro", "Podcast"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-muted">Status</label>
                    <select
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-cyan/40"
                      value={mediaForm.status}
                      onChange={(e) => setMediaForm({ ...mediaForm, status: e.target.value as MediaItem["status"] })}
                    >
                      {["Assistindo", "Quero ver", "Concluído"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setShowMediaForm(false)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddMedia}
                    className="flex items-center gap-1.5 rounded-xl bg-c-cyan px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <Check size={13} /> Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 space-y-2">
          {watchlist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3"
            >
              <span className="text-xl">{MEDIA_TYPE_EMOJI[item.type] ?? "🎬"}</span>
              <div className="flex-1">
                <p className={`font-medium ${item.status === "Finalizado" || item.status === "Concluído" ? "text-text-muted" : ""}`}>
                  {item.title}
                </p>
                <p className="text-xs text-text-muted">{item.genre ?? item.type}</p>
              </div>
              {item.rating && (
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--c-amber)" }}>
                  {"★".repeat(item.rating)}
                </div>
              )}
              <Badge color={STATUS_COLORS[item.status] ?? "var(--text-muted)"}>{item.status}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
