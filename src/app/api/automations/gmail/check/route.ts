import { NextRequest, NextResponse } from "next/server";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "Failed to refresh token");
  return data.access_token as string;
}

async function classifyTransaction(description: string, value: number, categories: string[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Classifique esta transação financeira em UMA das categorias abaixo, ou responda null se não tiver certeza.

Transação: "${description}" — R$ ${value.toFixed(2)}

Categorias: ${categories.join(", ")}

Responda APENAS com o nome exato da categoria (ex: "Alimentação") ou a palavra "null". Sem explicação.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (text === "null" || !categories.includes(text)) return null;
  return text;
}

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const url = process.env.EVOLUTION_API_URL;
  const instance = process.env.EVOLUTION_INSTANCE;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!url || !instance || !apiKey) return false;

  const res = await fetch(`${url}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: phone, text: message }),
  });
  return res.ok;
}

// Padrões de extração de e-mails por banco
const BANK_PARSERS: Record<string, (subject: string, snippet: string) => { description: string; value: number } | null> = {
  "@nubank.com.br": (subject, snippet) => {
    // Nubank envia: "Você usou R$ 87,50 no Mercado Livre"
    const match = snippet.match(/R\$\s*([\d.,]+).*?(?:no|em|para)\s+(.+?)(?:\.|$)/i)
      ?? subject.match(/R\$\s*([\d.,]+).*?(?:no|em|para)\s+(.+?)(?:\.|$)/i);
    if (!match) return null;
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    return { description: match[2].trim(), value };
  },
  "@itau.com.br": (subject, snippet) => {
    const match = (subject + " " + snippet).match(/R\$\s*([\d.,]+)[^a-z]*([A-Z][^R$\n]{3,40})/);
    if (!match) return null;
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    return { description: match[2].trim(), value };
  },
  "@inter.co": (subject, snippet) => {
    const match = (subject + " " + snippet).match(/R\$\s*([\d.,]+).*?([A-Za-z][^R$\n]{3,40})/);
    if (!match) return null;
    const value = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    return { description: match[2].trim(), value };
  },
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const bankPatterns: { senderPattern: string; bank: string; enabled: boolean }[] = body.bankPatterns ?? [];
  const categories: string[] = body.categories ?? [];
  const whatsappPhone = process.env.EVOLUTION_PHONE ?? body.whatsappPhone ?? "";

  const requiredEnvs = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN"];
  const missing = requiredEnvs.filter((k) => !process.env[k]);
  if (missing.length) {
    return NextResponse.json({ error: `Variáveis não configuradas: ${missing.join(", ")}` }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Falha ao obter token Gmail: ${msg}` }, { status: 401 });
  }

  const enabledBanks = bankPatterns.filter((b) => b.enabled);
  const query = enabledBanks.map((b) => `from:${b.senderPattern}`).join(" OR ");
  const gmailQuery = `(${query}) newer_than:1d`;

  // Busca mensagens nas últimas 24h
  const listRes = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(gmailQuery)}&maxResults=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const listData = await listRes.json();
  const messages: { id: string }[] = listData.messages ?? [];

  const results: { id: string; description: string; value: number; bank: string; category: string | null; whatsappSent: boolean }[] = [];

  for (const msg of messages) {
    const msgRes = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const msgData = await msgRes.json();

    const headers: { name: string; value: string }[] = msgData.payload?.headers ?? [];
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const snippet: string = msgData.snippet ?? "";

    // Identifica o banco pelo remetente
    const matchedBank = enabledBanks.find((b) => from.includes(b.senderPattern));
    if (!matchedBank) continue;

    const parser = BANK_PARSERS[matchedBank.senderPattern];
    const parsed = parser ? parser(subject, snippet) : null;
    if (!parsed) continue;

    // Tenta classificar automaticamente via Claude
    const category = await classifyTransaction(parsed.description, parsed.value, categories);

    let whatsappSent = false;
    if (!category && whatsappPhone) {
      const catList = categories.map((c, i) => `${i + 1}️⃣ ${c}`).join("\n");
      const message =
        `💸 *Nova transação detectada!*\n\n` +
        `*Descrição:* ${parsed.description}\n` +
        `*Valor:* R$ ${parsed.value.toFixed(2)}\n` +
        `*Banco:* ${matchedBank.bank}\n\n` +
        `Qual é a categoria?\n\n${catList}\n0️⃣ Outra — me diga qual`;
      whatsappSent = await sendWhatsApp(whatsappPhone, message);
    }

    results.push({ id: msg.id, ...parsed, bank: matchedBank.bank, category, whatsappSent });
  }

  return NextResponse.json({ processed: results.length, results });
}
