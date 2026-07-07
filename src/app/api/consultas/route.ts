import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 400 });
  }

  // Formatar mensagens para o Gemini
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? "Erro Gemini" }, { status: 500 });

  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Não consegui processar.";
  return NextResponse.json({ text });
}
