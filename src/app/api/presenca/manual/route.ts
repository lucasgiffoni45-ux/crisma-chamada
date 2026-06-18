import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Formador/coordenadora marca ou desmarca a presença de um aluno num encontro.
// body: { encontroId, crismandoId, presente: boolean }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { encontroId, crismandoId, presente } = await req.json();
  if (!encontroId || !crismandoId) {
    return NextResponse.json({ error: "Encontro e aluno são obrigatórios" }, { status: 400 });
  }

  const encontro = await prisma.encontro.findUnique({ where: { id: encontroId } });
  if (!encontro) return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, encontro.turmaId))) {
    return NextResponse.json({ error: "Sem acesso a este encontro" }, { status: 403 });
  }

  const crismando = await prisma.crismando.findUnique({ where: { id: crismandoId } });
  if (!crismando || crismando.turmaId !== encontro.turmaId) {
    return NextResponse.json({ error: "Aluno não é desta turma" }, { status: 400 });
  }

  if (presente) {
    await prisma.attendance.upsert({
      where: { crismandoId_encontroId: { crismandoId, encontroId } },
      update: {},
      create: { crismandoId, encontroId, userId: session.user.id },
    });
  } else {
    await prisma.attendance.deleteMany({ where: { crismandoId, encontroId } });
  }
  await registrarLog(session, presente ? "marcou presença (manual)" : "removeu presença", crismando.nome);
  return NextResponse.json({ ok: true });
}
