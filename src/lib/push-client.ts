"use client";

import { createClient } from "@/lib/supabase/client";

const PUSH_SUB_KEY = "push-subscription";
export const NOTIF_PREFS_KEY = "notif-prefs";

export type NotifPrefs = {
  anki: boolean;
  agua: boolean;
  resumoEstudos: boolean;
  vestibular: boolean;
  habitos: boolean;
  metas: boolean;
};

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  anki: true,
  agua: true,
  resumoEstudos: true,
  vestibular: true,
  habitos: false,
  metas: false,
};

export function loadNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIF_PREFS;
  try {
    const saved = localStorage.getItem(NOTIF_PREFS_KEY);
    return saved ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(saved) } : DEFAULT_NOTIF_PREFS;
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

export function saveNotifPrefs(prefs: NotifPrefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getUserId(): Promise<string | null> {
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}

/** Requests permission, registers the service worker and subscribes this device to push. */
export async function enablePush(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) return { ok: false, error: "Notificações push não são suportadas neste navegador." };

  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Você precisa estar logada para ativar notificações." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, error: "Permissão de notificação negada." };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, error: "Chave VAPID não configurada no servidor." };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const supabase = createClient();
  await supabase.from("user_data").upsert(
    { user_id: userId, key: PUSH_SUB_KEY, value: subscription.toJSON(), updated_at: new Date().toISOString() },
    { onConflict: "user_id,key" }
  );

  return { ok: true };
}

export async function disablePush(): Promise<void> {
  const userId = await getUserId();
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  }
  if (userId) {
    const supabase = createClient();
    await supabase.from("user_data").delete().eq("user_id", userId).eq("key", PUSH_SUB_KEY);
  }
}

export async function isPushEnabled(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return !!subscription;
}
