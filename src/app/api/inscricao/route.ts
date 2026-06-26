import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth, isCoordenadora, orgIdDe, registrarLog } from "@/lib/auth";
import { emailValido, limitar } from "@/lib/validar";
import { prisma } from "@/lib/prisma";

// POST: envio do formulário público (sem login). body inclui o token da org.
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  // Honeypot anti-spam: campo oculto que humano não preenche.
  if (b.website) return NextResponse.json({ ok: true });

  if (!b.token) return NextResponse.json({ error: "Link inválido" }, { status: 400 });
  const org = await prisma.organizacao.findUnique({ where: { inscricaoToken: b.token } });
  if (!org || !org.inscricaoAberta) {
    return NextResponse.json({ error: "As inscrições estão encerradas." }, { status: 403 });
  }
  if (!b.nome || String(b.nome).trim().length < 3) {
    return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });
  }
  if (b.email && !emailValido(b.email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (!b.consentimento) {
    return NextResponse.json({ error: "É necessário aceitar o uso dos dados (LGPD)." }, { status: 400 });
  }

  // Foto: opcional; aceita só imagem (data URL) e limita o tamanho.
  let foto: string | null = null;
  if (b.fotoBase64) {
    if (typeof b.fotoBase64 !== "string" || !b.fotoBase64.startsWith("data:image/") || b.fotoBase64.length > 500000) {
      return NextResponse.json({ error: "Foto inválida ou muito grande." }, { status: 400 });
    }
    foto = b.fotoBase64;
  }

  await prisma.inscricao.create({
    data: {
      orgId: org.id,
      nome: limitar(b.nome, 120)!,
      dataNascimento: limitar(b.dataNascimento, 30),
      contato: limitar(b.contato, 60),
      email: b.email ? String(b.email).toLowerCase().trim().slice(0, 120) : null,
      sacramentos: limitar(b.sacramentos, 120),
      alergias: limitar(b.alergias, 200),
      necessidades: limitar(b.necessidades, 200),
      nomePai: limitar(b.nomePai, 120),
      nomeMae: limitar(b.nomeMae, 120),
      endereco: limitar(b.endereco, 200),
      estadoCivil: limitar(b.estadoCivil, 40),
      serieEscolar: limitar(b.serieEscolar, 60),
      fotoBase64: foto,
    },
  });
  return NextResponse.json({ ok: true });
}

// GET: lista as inscrições da organização da coordenadora (pendentes por padrão).
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const orgId = orgIdDe(session);
  if (!orgId) return NextResponse.json([]);
  const status = req.nextUrl.searchParams.get("status") ?? "pendente";
  const inscricoes = await prisma.inscricao.findMany({
    where: { orgId, status },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(inscricoes);
}

// PATCH: abre/fecha as inscrições da organização e gera o link público se preciso.
// body: { abrir: boolean }
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const orgId = orgIdDe(session);
  if (!orgId) return NextResponse.json({ error: "Sem organização" }, { status: 400 });
  const { abrir } = await req.json();

  const org = await prisma.organizacao.findUnique({ where: { id: orgId } });
  const token = org?.inscricaoToken ?? randomUUID().replace(/-/g, "");
  const atualizada = await prisma.organizacao.update({
    where: { id: orgId },
    data: { inscricaoAberta: !!abrir, inscricaoToken: token },
  });
  await registrarLog(session, abrir ? "abriu inscrições" : "fechou inscrições");
  return NextResponse.json({ inscricaoAberta: atualizada.inscricaoAberta, inscricaoToken: atualizada.inscricaoToken });
}
