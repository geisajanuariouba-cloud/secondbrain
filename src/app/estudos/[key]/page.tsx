import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Target, RefreshCw, FileText, Dumbbell, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { SUBJECTS, CONTENTS, type SubjectKey } from "@/lib/data";
import { formatHours, pct } from "@/lib/utils";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ key: s.key }));
}

export default async function SubjectPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const subject = SUBJECTS.find((s) => s.key === (key as SubjectKey));
  if (!subject) notFound();

  const contents = CONTENTS.filter((c) => c.subject === subject.key);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Link href="/estudos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-text">
        <ArrowLeft size={16} /> Voltar para Estudos
      </Link>

      <PageHeader
        title={subject.name}
        subtitle={`${formatHours(subject.hours)} estudadas · ${subject.questions} questões`}
        icon={<span className="text-lg font-extrabold">{subject.name.slice(0, 2)}</span>}
        accent={subject.color}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Horas" value={formatHours(subject.hours)} icon={<Clock size={18} />} accent={subject.color} />
        <StatCard index={1} label="Acerto" value={`${pct(subject.correct, subject.questions)}%`} icon={<Target size={18} />} accent="var(--success)" hint={`${subject.correct}/${subject.questions}`} />
        <StatCard index={2} label="Domínio" value={`${subject.mastery}%`} icon={<Target size={18} />} accent={subject.color} />
        <StatCard index={3} label="Revisões" value={subject.pendingRevisions} icon={<RefreshCw size={18} />} accent="var(--warning)" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Arquivos & PDFs", icon: FileText, color: "var(--c-blue)" },
          { label: "Resumos", icon: BookOpen, color: "var(--secondary)" },
          { label: "Exercícios", icon: Dumbbell, color: "var(--success)" },
        ].map((s) => (
          <button key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
            <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 14%, transparent)` }}>
              <s.icon size={20} />
            </span>
            <span className="text-sm font-bold">{s.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <SectionTitle action={<Badge color={subject.color}>{contents.length} conteúdos</Badge>}>
          Conteúdos de {subject.name}
        </SectionTitle>
        {contents.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Nenhum conteúdo registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {contents.map((c) => {
              const done = Object.values(c.steps).filter(Boolean).length;
              return (
                <div key={c.id} className="rounded-xl border border-border bg-surface-2/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold">{c.name}</p>
                    <span className="text-xs font-semibold text-text-muted">{done}/5 etapas</span>
                  </div>
                  <ProgressBar value={(done / 5) * 100} color={subject.color} />
                  {c.questions > 0 && (
                    <p className="mt-2 text-[11px] text-text-muted">
                      {c.correct}/{c.questions} questões · {pct(c.correct, c.questions)}% de acerto
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
