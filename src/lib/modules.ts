import {
  LayoutDashboard,
  CalendarHeart,
  GraduationCap,
  Wallet,
  BookOpen,
  Dumbbell,
  Palette,
  ShoppingBag,
  Sparkles,
  Utensils,
  Droplets,
  Settings,
  Trophy,
  BarChart3,
  Briefcase,
  HeartPulse,
  Bot,
  Target,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  accent: string;
  groupLabel?: string; // renders a section divider above this item
};

export const MODULES: ModuleDef[] = [
  // ── CORE ──
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard, available: true, accent: "var(--primary)", groupLabel: "CORE" },
  { key: "rotina", label: "Rotina", href: "/rotina", icon: CalendarHeart, available: true, accent: "var(--c-pink)" },
  { key: "estudos", label: "Estudos", href: "/estudos", icon: GraduationCap, available: true, accent: "var(--secondary)" },
  { key: "vestibulares", label: "Vestibulares", href: "/vestibulares", icon: Trophy, available: true, accent: "var(--c-amber)" },
  // ── VIDA ──
  { key: "financeiro", label: "Financeiro", href: "/financeiro", icon: Wallet, available: true, accent: "var(--success)", groupLabel: "VIDA" },
  { key: "saude", label: "Saúde", href: "/saude", icon: HeartPulse, available: true, accent: "var(--c-rose)" },
  { key: "alimentacao", label: "Alimentação", href: "/alimentacao", icon: Utensils, available: true, accent: "var(--c-green)" },
  { key: "agua", label: "Água", href: "/agua", icon: Droplets, available: true, accent: "var(--c-blue)" },
  { key: "selfcare", label: "Self Care", href: "/self-care", icon: Sparkles, available: true, accent: "var(--c-lilac)" },
  { key: "academia", label: "Academia", href: "/academia", icon: Dumbbell, available: true, accent: "var(--c-rose)" },
  // ── PESSOAL ──
  { key: "livros", label: "Livros", href: "/livros", icon: BookOpen, available: true, accent: "var(--c-amber)", groupLabel: "PESSOAL" },
  { key: "hobbies", label: "Hobbies", href: "/hobbies", icon: Palette, available: true, accent: "var(--c-cyan)" },
  { key: "compras", label: "Compras & Viagens", href: "/compras", icon: ShoppingBag, available: true, accent: "var(--accent)" },
  { key: "trabalho", label: "Trabalho", href: "/trabalho", icon: Briefcase, available: true, accent: "var(--c-cyan)" },
  { key: "metas", label: "Metas", href: "/metas", icon: Target, available: true, accent: "var(--c-amber)" },
  // ── INSIGHTS ──
  { key: "metricas", label: "Métricas", href: "/metricas", icon: BarChart3, available: true, accent: "var(--primary)", groupLabel: "INSIGHTS" },
  { key: "consultas", label: "Consultas IA", href: "/consultas", icon: Bot, available: true, accent: "var(--secondary)" },
  // ── SISTEMA ──
  { key: "config", label: "Configurações", href: "/configuracoes", icon: Settings, available: true, accent: "var(--text-secondary)", groupLabel: "SISTEMA" },
];
