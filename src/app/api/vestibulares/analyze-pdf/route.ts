import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const PROMPT = `Você é um especialista em vestibulares brasileiros de medicina.
Analise o edital/conteúdo programático enviado em PDF e extraia todos os tópicos de estudo organizados por matéria.

Retorne APENAS o texto formatado assim (sem JSON, sem markdown extra):

BIOLOGIA
• Citologia: estrutura celular, membranas, organelas
• Genética: leis de Mendel, cromossomos, mutações
• Ecologia: cadeias alimentares, biomas brasileiros
[continue com todos os tópicos de Biologia]

QUÍMICA
• Química geral: tabela periódica, ligações químicas
[continue...]

FÍSICA
• Mecânica: cinemática, dinâmica, energia
[continue...]

[e assim para cada matéria presente no edital]

Seja completo e preciso. Inclua TODOS os tópicos mencionados no documento.
Se o vestibular tiver fases separadas, organize indicando a fase antes dos tópicos.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Erro ao ler o formulário" }, { status: 400 });
  }

  const file = formData.get("pdf") as File | null;
  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Envie um arquivo PDF válido" }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "PDF muito grande (máx 20 MB)" }, { status: 400 });
  }

  // Convert PDF to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "application/pdf",
              data: base64,
            },
          },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    return NextResponse.json({ error: `Erro na API Gemini: ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    return NextResponse.json({ error: "Gemini não retornou conteúdo" }, { status: 502 });
  }

  return NextResponse.json({ content: text });
}
