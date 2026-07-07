import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone, message } = await req.json();

  const url = process.env.EVOLUTION_API_URL;
  const instance = process.env.EVOLUTION_INSTANCE;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!url || !instance || !apiKey) {
    return NextResponse.json(
      { error: "EVOLUTION_API_URL, EVOLUTION_INSTANCE e EVOLUTION_API_KEY não configurados" },
      { status: 400 }
    );
  }

  const res = await fetch(`${url}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: phone, text: message }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao enviar WhatsApp", details: data }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}
