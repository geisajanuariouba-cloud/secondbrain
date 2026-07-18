"use client";

import { useState, useEffect } from "react";
import { User, Mail, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, SectionTitle } from "@/components/ui/card";

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        setName(data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "");
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ data: { name } });
    setLoading(false);
    setMessage(error ? error.message : "Perfil atualizado!");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-extrabold">Perfil</h1>

      <Card>
        <SectionTitle>Informações da conta</SectionTitle>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Nome de exibição</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
              <User size={15} className="shrink-0 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="Seu nome"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 opacity-60">
              <Mail size={15} className="shrink-0 text-text-muted" />
              <span className="flex-1 text-sm">{email}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">O email não pode ser alterado aqui.</p>
          </div>

          {message && (
            <p className={`rounded-xl px-3 py-2 text-xs font-medium ${message.includes("!") ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={15} /> {loading ? "Salvando…" : "Salvar alterações"}
          </button>
        </form>
      </Card>
    </div>
  );
}
