import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Aluno marca presença a partir do token do QR daquele encontro/sábado.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Faça login para confirmar presença" }, { status: 401 });
  }

  const { token } = await req.json();

  const encontro = await prisma.encontro.findFirst({
    where: { token, ativa: true },
  });
  if (!encontro) {
    return NextResponse.json({ error: "Chamada encerrada ou QR inválido" }, { status: 400 });
  }

  // O aluno só marca presença na própria turma (mesmo e-mail cadastrado nela).
  const crismando = await prisma.crismando.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });
  if (!crismando) {
    return NextResponse.json({ error: "Seu e-mail não está cadastrado em nenhuma turma" }, { status: 403 });
  }
  if (crismando.turmaId !== encontro.turmaId) {
    return NextResponse.json({ error: "Este QR é de outra turma" }, { status: 403 });
  }

  try {
    const attendance = await prisma.attendance.create({
      data: { crismandoId: crismando.id, encontroId: encontro.id, userId: session.user.id },
    });
    return NextResponse.json({ ok: true, marcadaEm: attendance.marcadaEm, nome: crismando.nome });
  } catch {
    return NextResponse.json({ error: "Presença já registrada neste encontro" }, { status: 409 });
  }
}
