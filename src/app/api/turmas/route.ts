import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, isDono, registrarLog, orgIdDe, podeGerenciarTurma } from "@/lib/auth";
import { podeEscrever } from "@/lib/assinatura";
import { prisma } from "@/lib/prisma";

// GET: coordenadora vê só as turmas da SUA organização; dono vê todas.
export async function GET() {
  const session = await auth();
  if (!isCoordenadora(session) && !isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const where = isDono(session) ? {} : { orgId: orgIdDe(session) };
  const turmas = await prisma.turma.findMany({
    where,
    orderBy: { nome: "asc" },
    include: {
      formadores: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { crismandos: true } },
    },
  });
  return NextResponse.json(turmas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Apenas a coordenadora cria turmas" }, { status: 401 });
  }
  if (!(await podeEscrever(session))) {
    return NextResponse.json({ error: "Assinatura inativa. Renove para continuar." }, { status: 402 });
  }
  const orgId = orgIdDe(session);
  if (!orgId) return NextResponse.json({ error: "Coordenadora sem organização" }, { status: 400 });
  const { nome } = await req.json();
  if (!nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  const turma = await prisma.turma.create({ data: { nome, orgId } });
  await registrarLog(session, "criou turma", nome);
  return NextResponse.json(turma, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!(await podeGerenciarTurma(session, id))) {
    return NextResponse.json({ error: "Turma fora da sua organização" }, { status: 403 });
  }
  const turma = await prisma.turma.findUnique({ where: { id } });
  await prisma.turma.delete({ where: { id } });
  await registrarLog(session, "removeu turma", turma?.nome ?? id);
  return NextResponse.json({ ok: true });
}
