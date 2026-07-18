"use client";

import { useState, useEffect } from "react";
import { Search, Command, Bell, X, LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { greeting } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Topbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dateLabel, setDateLabel] = useState("");
  const [greetingText, setGreetingText] = useState("Olá");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const today = new Date();
    setDateLabel(today.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }));
    setGreetingText(greeting(today));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Livia";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-bg/70 px-5 backdrop-blur-xl lg:px-8">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight" suppressHydrationWarning>
          {greetingText}, {displayName} 👋
        </p>
        <p className="truncate text-xs capitalize text-text-muted" suppressHydrationWarning>{dateLabel}</p>
      </div>

      <button className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover md:flex">
        <Search size={16} />
        <span>Buscar…</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold">
          <Command size={10} /> K
        </kbd>
      </button>

      {/* Notificações */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifs((v) => !v); setShowUser(false); }}
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>
        {showNotifs && (
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-bold">Notificações</p>
              <button onClick={() => setShowNotifs(false)} className="text-text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              Nenhuma notificação por enquanto
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />

      {/* Avatar / menu do usuário */}
      <div className="relative">
        <button
          onClick={() => { setShowUser((v) => !v); setShowNotifs(false); }}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white transition-opacity hover:opacity-80"
        >
          {initials}
        </button>
        {showUser && (
          <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-border bg-surface shadow-xl">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-text-muted">{user?.email ?? ""}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => { setShowUser(false); router.push("/perfil"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
              >
                <User size={15} /> Perfil
              </button>
              <button
                onClick={() => { setShowUser(false); router.push("/configuracoes"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
              >
                <Settings size={15} /> Configurações
              </button>
              <div className="mx-3 my-1 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut size={15} /> Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {(showNotifs || showUser) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotifs(false); setShowUser(false); }}
        />
      )}
    </header>
  );
}
