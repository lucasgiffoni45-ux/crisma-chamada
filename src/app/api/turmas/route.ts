import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, isDono, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: coordenadora/dono veem todas as turmas (com formadores e contagem de alunos).
export async function GET() {
  const session = await auth();
  if (!isCoordenadora(session) && !isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const turmas = await prisma.turma.findMany({
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
  const { nome } = await req.json();
  if (!nome) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  const turma = await prisma.turma.create({ data: { nome } });
  await registrarLog(session, "criou turma", nome);
  return NextResponse.json(turma, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await req.json();
  const turma = await prisma.turma.findUnique({ where: { id } });
  await prisma.turma.delete({ where: { id } });
  await registrarLog(session, "removeu turma", turma?.nome ?? id);
  return NextResponse.json({ ok: true });
}
