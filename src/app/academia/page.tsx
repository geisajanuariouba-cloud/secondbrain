import { Dumbbell, Plus, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, SectionTitle, Badge } from "@/components/ui/card";
import { EXERCISES } from "@/lib/data";

const CATEGORY_NAMES: Record<string, string> = {
  A: "Inferiores", B: "Costas & Bíceps", C: "Ombros & Tríceps", D: "Core", E: "Cardio",
};
const CATEGORY_COLORS: Record<string, string> = {
  A: "var(--c-rose)", B: "var(--secondary)", C: "var(--primary)", D: "var(--accent)", E: "var(--success)",
};

export default function AcademiaPage() {
  const categories = Array.from(new Set(EXERCISES.map((e) => e.category)));

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        title="Academia"
        subtitle="Treinos, fichas e evolução"
        icon={<Dumbbell size={24} />}
        accent="var(--c-rose)"
        action={
          <button className="flex items-center gap-2 rounded-xl bg-c-rose px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]">
            <Plus size={16} /> Registrar treino
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Treinos no mês" value={18} icon={<Dumbbell size={18} />} accent="var(--c-rose)" trend={6} />
        <StatCard index={1} label="Sequência" value="5 dias" icon={<Flame size={18} />} accent="var(--warning)" />
        <StatCard index={2} label="Fichas ativas" value={categories.length} icon={<Dumbbell size={18} />} accent="var(--secondary)" />
        <StatCard index={3} label="Exercícios" value={EXERCISES.length} icon={<Dumbbell size={18} />} accent="var(--primary)" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const exercises = EXERCISES.filter((e) => e.category === cat);
          const color = CATEGORY_COLORS[cat];
          return (
            <Card key={cat}>
              <SectionTitle
                action={<Badge color={color} soft={false}>Treino {cat}</Badge>}
              >
                {CATEGORY_NAMES[cat]}
              </SectionTitle>
              <div className="space-y-2">
                {exercises.map((e) => (
                  <div key={e.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                      <Dumbbell size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{e.name}</p>
                      <p className="truncate text-[11px] text-text-muted">{e.muscle.join(", ")}</p>
                    </div>
                    <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-bold">{e.sets}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
