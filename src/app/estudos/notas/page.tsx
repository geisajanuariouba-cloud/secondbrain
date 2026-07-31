"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileBarChart, ChevronLeft, Plus, X, Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { SUBJECTS } from "@/lib/data";
import { todayLocalISO } from "@/lib/date-utils";

type Note = {
  id: string;
  subject: string;
  title: string;
  content: string;
  date: string;
  color: string;
};

const NOTES_MOCK: Note[] = [
  {
    id: "n1", subject: "Biologia", title: "Divisão celular — resumo",
    content: "Mitose: 4 fases (prófase, metáfase, anáfase, telófase). Resultado: 2 células diploides idênticas.\nMeiose: 2 divisões. Resultado: 4 células haploides (gametas).",
    date: "2026-06-27", color: "var(--secondary)",
  },
  {
    id: "n2", subject: "Química", title: "pH e pOH — fórmulas",
    content: "pH = -log[H+] | pOH = -log[OH-]\npH + pOH = 14 (a 25°C)\nÁcido: pH < 7 | Neutro: pH = 7 | Base: pH > 7",
    date: "2026-06-25", color: "var(--accent)",
  },
  {
    id: "n3", subject: "História", title: "Era Vargas — linha do tempo",
    content: "1930: Revolução de 30 | 1937: Estado Novo (ditadura) | 1945: Deposição | 1950: Retorno eleito | 1954: Suicídio",
    date: "2026-06-24", color: "var(--text-secondary)",
  },
  {
    id: "n4", subject: "Física", title: "Leis de Newton",
    content: "1ª: Inércia — corpo em repouso/movimento constante sem força resultante.\n2ª: F = ma\n3ª: Ação e reação — forças iguais e opostas em corpos diferentes.",
    date: "2026-06-22", color: "var(--c-rose)",
  },
];

export default function NotasPage() {
  const [notes, setNotes] = useState<Note[]>(NOTES_MOCK);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubject, setNewSubject] = useState("Biologia");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem("notas-data");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  // Salvar ao mudar
  useEffect(() => {
    localStorage.setItem("notas-data", JSON.stringify(notes));
  }, [notes]);

  const subjectList = ["Todas", ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filtered = notes.filter((n) => {
    const matchSubject = selectedSubject === "Todas" || n.subject === selectedSubject;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const addNote = () => {
    if (!newTitle || !newContent) return;
    const subject = SUBJECTS.find((s) => s.name === newSubject);
    setNotes((prev) => [{
      id: `n${Date.now()}`,
      subject: newSubject,
      title: newTitle,
      content: newContent,
      date: todayLocalISO(),
      color: subject?.color ?? "var(--text-muted)",
    }, ...prev]);
    setNewTitle(""); setNewContent(""); setShowForm(false);
  };

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const startEdit = (note: Note) => {
    setEditing(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, title: editTitle, content: editContent } : n));
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        title="Notas"
        subtitle="Anotações por matéria"
        icon={<FileBarChart size={24} />}
        accent="var(--success)"
        action={
          <div className="flex items-center gap-2">
            <Link href="/estudos" className="grid h-9 w-9 place-items-center rounded-xl border border-border text-text-muted hover:text-text">
              <ChevronLeft size={18} />
            </Link>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
              <Plus size={15} /> Nova nota
            </button>
          </div>
        }
      />

      {/* Busca + filtro */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/60"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {subjectList.map((s) => {
            const subj = SUBJECTS.find((x) => x.name === s);
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: selectedSubject === s ? (subj?.color ?? "var(--primary)") : "var(--surface-2)",
                  color: selectedSubject === s ? "#fff" : "var(--text-secondary)",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-border bg-surface-2/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold">Nova nota</p>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-text-muted" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título" className="col-span-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
              <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none">
                {SUBJECTS.map((s) => <option key={s.key}>{s.name}</option>)}
              </select>
            </div>
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Conteúdo da nota..." rows={4} className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
            <button onClick={addNote} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>Salvar nota</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notas */}
      <div className="columns-1 gap-4 sm:columns-2">
        {filtered.map((note) => {
          const isExpanded = expanded === note.id;
          return (
            <div key={note.id} className="mb-4 break-inside-avoid">
              <motion.div layout className="overflow-hidden rounded-2xl border border-border bg-surface-2/40 transition-colors hover:bg-surface-hover">
                {/* Linha colorida */}
                <div className="h-1 w-full" style={{ background: note.color }} />
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge color={note.color}>{note.subject}</Badge>
                      {editing === note.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm font-bold outline-none focus:border-primary/60"
                        />
                      ) : (
                        <p className="mt-1.5 font-bold leading-tight">{note.title}</p>
                      )}
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="shrink-0 grid h-7 w-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-danger">
                      <X size={14} />
                    </button>
                  </div>
                  {editing === note.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(note.id)} className="rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ background: "var(--primary)" }}>Salvar</button>
                        <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1 text-xs font-semibold text-text-muted hover:text-text">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="mt-2 cursor-pointer overflow-hidden text-xs text-text-secondary"
                      style={{ maxHeight: isExpanded ? "none" : "3.5em" }}
                      onClick={() => setExpanded(isExpanded ? null : note.id)}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{new Date(note.date).toLocaleDateString("pt-BR")}</span>
                    <div className="flex items-center gap-2">
                      {isExpanded && editing !== note.id && (
                        <button onClick={() => startEdit(note)} className="text-[10px] font-semibold text-text-muted hover:text-text">editar</button>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : note.id)} className="text-[10px] font-semibold" style={{ color: note.color }}>
                        {isExpanded ? "ver menos" : "ver mais"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-12 text-center text-sm text-text-muted">Nenhuma nota encontrada.</div>
        )}
      </div>
    </div>
  );
}
