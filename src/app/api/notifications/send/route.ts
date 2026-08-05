import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_HABITS_BY_DAY, getTodayKey } from "@/lib/habits";
import { VESTIBULARES_TARGETS } from "@/lib/data";

export const dynamic = "force-dynamic";

function todayLocalISOInBrazil(): string {
  // Server runs in UTC; Brasília is UTC-3 year-round.
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const ms = new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime();
  return Math.round(ms / 86400000);
}

type PushMessage = { title: string; body: string; tag?: string; url?: string };

function buildMorningMessages(): PushMessage[] {
  const today = todayLocalISOInBrazil();
  const messages: PushMessage[] = [];
  const milestones = new Set([30, 15, 7, 3, 1, 0]);

  for (const target of VESTIBULARES_TARGETS) {
    if (!target.selected) continue;
    for (const dateField of [target.date, target.registrationClosesAt] as (string | undefined)[]) {
      if (!dateField) continue;
      const diff = daysBetween(today, dateField);
      if (diff >= 0 && milestones.has(diff)) {
        const when = dateField === target.date ? "prova" : "fim das inscrições";
        messages.push({
          title: `${target.name} — ${diff === 0 ? "é hoje!" : `faltam ${diff} dias`}`,
          body: `${when === "prova" ? "Prova" : "Inscrições encerram"} de ${target.fullName} ${diff === 0 ? "é hoje" : `em ${diff} dias`}.`,
          tag: `vestibular-${target.id}-${dateField}`,
          url: "/vestibulares",
        });
      }
    }
  }
  return messages;
}

async function buildEveningMessages(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<PushMessage[]> {
  const messages: PushMessage[] = [];
  const today = todayLocalISOInBrazil();
  const dayKey = getTodayKey();
  const habitsToday = DEFAULT_HABITS_BY_DAY[dayKey] ?? [];

  const { data: checkedRow } = await admin
    .from("user_data")
    .select("value")
    .eq("user_id", userId)
    .eq("key", `rotina-checked-${today}`)
    .maybeSingle();

  const checked = (checkedRow?.value as Record<string, boolean>) ?? {};
  const doneCount = habitsToday.filter((h) => checked[h.id]).length;
  const total = habitsToday.length;

  messages.push({
    title: "Resumo do dia",
    body: total ? `Você concluiu ${doneCount}/${total} hábitos hoje.` : "Confira sua rotina de hoje.",
    tag: `resumo-${today}`,
    url: "/rotina",
  });

  if (total && doneCount < total) {
    messages.push({
      title: "Ainda dá tempo",
      body: `Faltam ${total - doneCount} itens da rotina de hoje.`,
      tag: `habitos-pendentes-${today}`,
      url: "/rotina",
    });
  }

  return messages;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") === "evening" ? "evening" : "morning";

  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(
    "mailto:sliviaaz.uba@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const admin = createAdminClient();
  const { data: subs, error } = await admin.from("user_data").select("user_id, value").eq("key", "push-subscription");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const morningMessages = slot === "morning" ? buildMorningMessages() : [];

  for (const row of subs ?? []) {
    const { data: prefsRow } = await admin
      .from("user_data")
      .select("value")
      .eq("user_id", row.user_id)
      .eq("key", "notif-prefs")
      .maybeSingle();
    const prefs = (prefsRow?.value as Record<string, boolean>) ?? {};

    let messages: PushMessage[] = [];
    if (slot === "morning") {
      if (prefs.vestibular !== false) messages = messages.concat(morningMessages);
    } else {
      const evening = await buildEveningMessages(admin, row.user_id as string);
      if (prefs.resumoEstudos !== false) messages.push(evening[0]);
      if (prefs.habitos && evening[1]) messages.push(evening[1]);
      if (prefs.agua !== false) {
        messages.push({ title: "Hidratação", body: "Já bebeu água suficiente hoje?", tag: "agua-lembrete", url: "/agua" });
      }
      if (prefs.anki !== false) {
        messages.push({ title: "Anki", body: "Hora de revisar seus flashcards de hoje.", tag: "anki-lembrete", url: "/estudos" });
      }
    }

    for (const msg of messages) {
      try {
        await webpush.sendNotification(row.value as webpush.PushSubscription, JSON.stringify(msg));
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("user_data").delete().eq("user_id", row.user_id).eq("key", "push-subscription");
        }
      }
    }
  }

  return NextResponse.json({ ok: true, slot, subscriptions: subs?.length ?? 0, sent });
}
