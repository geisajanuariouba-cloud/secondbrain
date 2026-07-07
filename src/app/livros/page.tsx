"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus, Star, X, Check, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { BOOKS } from "@/lib/data";
import { pct } from "@/lib/utils";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string[];
  status: "Lendo" | "Finalizado" | "Próxima Leitura" | "Pausado" | "Para ler" | "Concluído" | "Abandonado";
  currentPage: number;
  totalPages: number;
  rating?: number;
  coverUrl?: string;
};

const STATUS_COLOR: Record<string, string> = {
  Lendo: "var(--success)",
  Finalizado: "var(--primary)",
  Concluído: "var(--primary)",
  "Próxima Leitura": "var(--secondary)",
  "Para ler": "var(--secondary)",
  Pausado: "var(--c-pink)",
  Abandonado: "var(--danger)",
};

const STORAGE_KEY = "livros-data";

export default function LivrosPage() {
  const [books, setBooks] = useState<Book[]>(() => {
    if (typeof window === "undefined") return BOOKS as Book[];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : (BOOKS as Book[]);
    } catch {
      return BOOKS as Book[];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [pageInputs, setPageInputs] = useState<Record<string, string>>({});
  const [ratingHover, setRatingHover] = useState<Record<string, number>>({});

  const [form, setForm] = useState({
    title: "",
    author: "",
    totalPages: "",
    status: "Para ler" as Book["status"],
    coverUrl: "",
    genre: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const reading = books.filter((b) => b.status === "Lendo").length;
  const finished = books.filter((b) => b.status === "Finalizado" || b.status === "Concluído").length;
  const pagesRead = books.reduce((a, b) => a + b.currentPage, 0);

  function handleAddBook() {
    if (!form.title.trim() || !form.author.trim()) return;
    const newBook: Book = {
      id: `bk-${Date.now()}`,
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre ? [form.genre.trim()] : [],
      status: form.status,
      currentPage: 0,
      totalPages: Number(form.totalPages) || 0,
      coverUrl: form.coverUrl || undefined,
    };
    setBooks((prev) => [...prev, newBook]);
    setForm({ title: "", author: "", totalPages: "", status: "Para ler", coverUrl: "", genre: "" });
    setShowForm(false);
  }

  function updatePages(id: string, delta?: number) {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const rawInput = pageInputs[id];
        const newPage = delta !== undefined
          ? Math.min(b.totalPages, b.currentPage + delta)
          : rawInput !== undefined
            ? Math.min(b.totalPages, Math.max(0, Number(rawInput)))
            : b.currentPage;
        return { ...b, currentPage: isNaN(newPage) ? b.currentPage : newPage };
      })
    );
    setPageInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function setRating(id: string, rating: number) {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, rating } : b)));
  }

  async function sendToKindle(book: Book) {
    try {
      const res = await fetch("/api/automations/kindle/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: book.title, author: book.author }),
      });
      if (res.ok) {
        alert(`"${book.title}" enviado para o Kindle!`);
      } else {
        alert(`Erro ao enviar "${book.title}" (status ${res.status})`);
      }
    } catch {
      alert(`Erro de conexão ao enviar "${book.title}"`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Livros"
        subtitle="Sua biblioteca pessoal"
        icon={<BookOpen size={24} />}
        accent="var(--c-amber)"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-c-amber px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            <Plus size={16} /> Novo livro
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Lendo agora" value={reading} icon={<BookOpen size={18} />} accent="var(--success)" />
        <StatCard index={1} label="Finalizados" value={finished} icon={<BookOpen size={18} />} accent="var(--primary)" hint="Meta: 12 no ano" />
        <StatCard index={2} label="Páginas lidas" value={pagesRead.toLocaleString("pt-BR")} icon={<BookOpen size={18} />} accent="var(--secondary)" />
        <StatCard index={3} label="Na estante" value={books.length} icon={<BookOpen size={18} />} accent="var(--c-amber)" />
      </div>

      {/* Form de novo livro */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Novo livro</SectionTitle>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Título</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="Ex: Hábitos Atômicos"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Autor</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="Ex: James Clear"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Total de páginas</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="320"
                    value={form.totalPages}
                    onChange={(e) => setForm({ ...form, totalPages: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Status</label>
                  <select
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Book["status"] })}
                  >
                    {["Lendo", "Para ler", "Concluído", "Abandonado"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Gênero</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="Ex: Ficção científica"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-muted">Capa URL (opcional)</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-c-amber/40"
                    placeholder="https://..."
                    value={form.coverUrl}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBook}
                  className="flex items-center gap-2 rounded-xl bg-c-amber px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  <Check size={15} /> Adicionar livro
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <SectionTitle action={<Badge color="var(--c-amber)">{books.length} livros</Badge>}>Biblioteca</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b, i) => {
            const progress = pct(b.currentPage, b.totalPages);
            const statusColor = STATUS_COLOR[b.status] ?? "var(--text-muted)";
            const hover = ratingHover[b.id] ?? 0;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group overflow-hidden rounded-2xl border border-border bg-surface-2/40 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <div className="relative flex h-40 items-end justify-center overflow-hidden bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 p-4">
                  {b.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverUrl} alt={b.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                  ) : (
                    <BookOpen className="absolute right-3 top-3 text-text/20" size={40} />
                  )}
                  <span className="z-10 text-center text-sm font-extrabold leading-tight">{b.title}</span>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs text-text-muted">{b.author}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge color={statusColor}>{b.status}</Badge>
                    {/* Rating clicável */}
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setRatingHover({ ...ratingHover, [b.id]: star })}
                          onMouseLeave={() => setRatingHover({ ...ratingHover, [b.id]: 0 })}
                          onClick={() => setRating(b.id, star)}
                          className="transition-transform hover:scale-110"
                          style={{ color: star <= (hover || b.rating || 0) ? "var(--c-amber)" : "var(--border)" }}
                        >
                          <Star size={12} fill="currentColor" />
                        </button>
                      ))}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <ProgressBar value={progress} color={statusColor} />
                    <p className="mt-1 text-[11px] text-text-muted">{b.currentPage}/{b.totalPages} pág · {progress}%</p>
                  </div>

                  {/* Controles de páginas para livros "Lendo" */}
                  {b.status === "Lendo" && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updatePages(b.id, 10)}
                          className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold hover:bg-surface-2 transition-colors"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => updatePages(b.id, 25)}
                          className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold hover:bg-surface-2 transition-colors"
                        >
                          +25
                        </button>
                        <input
                          type="number"
                          placeholder="Pág."
                          className="w-14 rounded-lg border border-border bg-surface-2 px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-c-amber/40"
                          value={pageInputs[b.id] ?? ""}
                          onChange={(e) => setPageInputs({ ...pageInputs, [b.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") updatePages(b.id); }}
                        />
                        {pageInputs[b.id] !== undefined && (
                          <button
                            onClick={() => updatePages(b.id)}
                            className="rounded-lg bg-c-amber px-1.5 py-0.5 text-[11px] font-bold text-white"
                          >
                            OK
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botão Kindle */}
                  <button
                    onClick={() => sendToKindle(b)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1 text-[11px] font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                  >
                    <Send size={11} /> Enviar para Kindle
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
