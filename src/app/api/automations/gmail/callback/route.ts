import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/configuracoes?gmail_error=${error}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/configuracoes?gmail_error=no_code", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokenRes.ok || !tokens.refresh_token) {
    return NextResponse.redirect(new URL(`/configuracoes?gmail_error=token_failed`, req.url));
  }

  // Em produção salvar no banco. Aqui retornamos no redirect para o usuário
  // copiar para o .env.local (app pessoal/local).
  const redirectUrl = new URL("/configuracoes", req.url);
  redirectUrl.searchParams.set("gmail_connected", "1");
  redirectUrl.searchParams.set("refresh_token", tokens.refresh_token);
  return NextResponse.redirect(redirectUrl);
}
