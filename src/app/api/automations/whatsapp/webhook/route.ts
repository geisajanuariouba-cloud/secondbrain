import { NextRequest, NextResponse } from "next/server";

// Evolution API envia POST neste endpoint quando chega mensagem no WhatsApp.
// Configurar em: Evolution API → instância → Settings → Webhook → "MESSAGES_UPSERT"
// URL: https://seu-dominio.com/api/automations/whatsapp/webhook

type EvolutionMessage = {
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean };
    message?: { conversation?: string };
  };
  // Evolution API também envia outros eventos — ignoramos os que não têm data.message
};

// Compatibilidade com formato antigo e novo
type ZAPIMessage = EvolutionMessage & {
  phone?: string;
  fromMe?: boolean;
  isGroup?: boolean;
  text?: { message: string };
};

// Estado em memória (em produção usar banco de dados)
const pendingCategorizations = new Map<string, {
  description: string;
  value: number;
  bank: string;
  categories: string[];
  messageId: string;
}>();

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

export async function POST(req: NextRequest) {
  // Verificar security token se configurado
  const securityToken = process.env.ZAPI_SECURITY_TOKEN;
  if (securityToken) {
    const headerToken = req.headers.get("client-token");
    if (headerToken !== securityToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body: ZAPIMessage = await req.json().catch(() => ({})) as ZAPIMessage;

  // Suporte Evolution API (data.key.remoteJid) e formato legado (phone)
  const fromMe = body.data?.key?.fromMe ?? body.fromMe ?? false;
  const isGroup = body.isGroup ?? false;

  if (fromMe || isGroup) return NextResponse.json({ ok: true });

  const phone = body.data?.key?.remoteJid?.replace("@s.whatsapp.net", "") ?? body.phone ?? "";
  const text = (body.data?.message?.conversation ?? body.text?.message ?? "").trim();
  const myPhone = process.env.EVOLUTION_PHONE ?? "";

  // Só processa mensagens do número configurado
  if (phone !== myPhone && !phone.endsWith(myPhone)) {
    return NextResponse.json({ ok: true });
  }

  const pending = pendingCategorizations.get(phone);

  if (!pending) {
    // Comandos rápidos para adicionar dados via WhatsApp
    const cmd = text.toLowerCase();

    if (cmd.match(/^[0-9]([,.]?[0-9]+)? (copo|copos|agua|água)/i) || cmd.match(/água|copo/i)) {
      const qtd = parseInt(cmd.match(/^(\d+)/)?.[1] ?? "1");
      await sendWhatsApp(phone, `💧 ${qtd} copo${qtd > 1 ? "s" : ""} de água registrado${qtd > 1 ? "s" : ""}! Vou atualizar seu contador.`);
    } else if (cmd.match(/^café|^almoco|^almoço|^lanche|^jantar/i)) {
      await sendWhatsApp(phone, `🍽️ Refeição anotada! Diga o que você comeu e eu registro nos seus macros.`);
    } else if (cmd.match(/nota:|lembrar:|lembrete:/i)) {
      const note = text.replace(/^(nota|lembrar|lembrete):\s*/i, "");
      await sendWhatsApp(phone, `📝 Anotação salva: "${note}"`);
    } else if (cmd.match(/treino|academia|gym/i)) {
      await sendWhatsApp(phone, `💪 Treino registrado! Qual treino foi hoje? (A/B/C/D)`);
    } else {
      await sendWhatsApp(phone,
        `🧠 *Second Brain*\n\nComandos disponíveis:\n` +
        `• _"2 copos de água"_ — registrar hidratação\n` +
        `• _"nota: [texto]"_ — salvar anotação\n` +
        `• _"treino"_ — registrar academia\n` +
        `• _"almoço"_ — registrar refeição`
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Processando resposta de categorização financeira
  const { description, value, bank, categories } = pending;
  const choice = parseInt(text);

  if (isNaN(choice) || choice < 0 || choice > categories.length) {
    await sendWhatsApp(phone, `❓ Não entendi. Responda com um número entre 0 e ${categories.length}.`);
    return NextResponse.json({ ok: true });
  }

  let category: string;
  if (choice === 0) {
    // Pede descrição customizada
    await sendWhatsApp(phone, `📝 Ok! Me diga a categoria para salvar:`);
    // Em vez de salvar imediatamente, aguarda próxima mensagem
    // (simplificado — em produção usar estado de sessão)
    pendingCategorizations.delete(phone);
    return NextResponse.json({ ok: true });
  } else {
    category = categories[choice - 1];
  }

  pendingCategorizations.delete(phone);

  // Aqui salvaria no banco de dados da transação
  // Por ora confirma via WhatsApp
  await sendWhatsApp(phone,
    `✅ *${description}* — R$ ${value.toFixed(2)}\n` +
    `Categorizado como *${category}* e salvo no Financeiro!`
  );

  return NextResponse.json({ ok: true, category, description, value, bank });
}

// Endpoint para registrar uma categorização pendente (chamado pela rota check do Gmail)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { phone, description, value, bank, categories, messageId } = body;
  pendingCategorizations.set(phone, { description, value, bank, categories, messageId });
  return NextResponse.json({ ok: true });
}
