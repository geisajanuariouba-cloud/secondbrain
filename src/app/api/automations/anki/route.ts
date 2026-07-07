import { NextRequest, NextResponse } from "next/server";

const ANKI_URL = process.env.ANKI_CONNECT_URL ?? "http://localhost:8765";

async function ankiRequest(action: string, params: Record<string, unknown> = {}) {
  const res = await fetch(ANKI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: 6, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// GET /api/automations/anki?action=status — verifica se Anki está rodando
// GET /api/automations/anki?action=due — retorna cards devidos hoje
// GET /api/automations/anki?action=decks — lista baralhos
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "status";

  try {
    if (action === "status") {
      const version = await ankiRequest("version");
      return NextResponse.json({ connected: true, version });
    }

    if (action === "due") {
      // Busca cards devidos em todos os decks
      const decks: string[] = await ankiRequest("deckNames");
      const dueCards: { deck: string; count: number }[] = [];

      for (const deck of decks) {
        const cardIds: number[] = await ankiRequest("findCards", { query: `deck:"${deck}" is:due` });
        if (cardIds.length > 0) {
          dueCards.push({ deck, count: cardIds.length });
        }
      }

      const totalDue = dueCards.reduce((s, d) => s + d.count, 0);
      return NextResponse.json({ connected: true, totalDue, decks: dueCards });
    }

    if (action === "decks") {
      const decks: string[] = await ankiRequest("deckNames");
      return NextResponse.json({ connected: true, decks });
    }

    if (action === "sync") {
      await ankiRequest("sync");
      return NextResponse.json({ ok: true, message: "Anki sincronizado com AnkiWeb" });
    }

    return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Anki não está aberto ou AnkiConnect não instalado
    return NextResponse.json(
      { connected: false, error: msg, hint: "Abra o Anki Desktop e instale o plugin AnkiConnect (código 2055492159)" },
      { status: 503 }
    );
  }
}

// POST /api/automations/anki — adiciona card
export async function POST(req: NextRequest) {
  const { deck, front, back, tags } = await req.json();

  if (!deck || !front || !back) {
    return NextResponse.json({ error: "deck, front e back são obrigatórios" }, { status: 400 });
  }

  try {
    const noteId = await ankiRequest("addNote", {
      note: {
        deckName: deck,
        modelName: "Basic",
        fields: { Front: front, Back: back },
        tags: tags ?? [],
        options: { allowDuplicate: false },
      },
    });
    return NextResponse.json({ ok: true, noteId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
