import { NextResponse } from "next/server";

export async function GET() {
  const gmail = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const gmailConnected = !!(gmail && process.env.GOOGLE_REFRESH_TOKEN);
  // Gemini Flash é gratuito — aistudio.google.com
  const claude = !!process.env.GEMINI_API_KEY;
  // Evolution API é gratuita e open source — github.com/EvolutionAPI/evolution-api
  const whatsapp = !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_INSTANCE && process.env.EVOLUTION_API_KEY);
  const kindle = !!process.env.KINDLE_EMAIL;
  const ankiUrl = process.env.ANKI_CONNECT_URL ?? "http://localhost:8765";

  let anki = false;
  try {
    const res = await fetch(ankiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "version", version: 6 }),
      signal: AbortSignal.timeout(2000),
    });
    const data = await res.json();
    anki = typeof data.result === "number";
  } catch {
    anki = false;
  }

  return NextResponse.json({ gmail, gmailConnected, claude, whatsapp, anki, kindle });
}
