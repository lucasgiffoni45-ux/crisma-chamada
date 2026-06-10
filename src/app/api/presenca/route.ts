import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Faça login para confirmar presença" }, { status: 401 });
  }

  const { token } = await req.json();

  const sessao = await prisma.chamadaSessao.findFirst({
    where: { token, ativa: true },
  });
  if (!sessao) {
    return NextResponse.json({ error: "Chamada encerrada ou QR inválido" }, { status: 400 });
  }

  const crismando = await prisma.crismando.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });
  if (!crismando) {
    return NextResponse.json({ error: "Seu e-mail não está na lista desta turma" }, { status: 403 });
  }

  try {
    const attendance = await prisma.attendance.create({
      data: { crismandoId: crismando.id, sessaoId: sessao.id, userId: session.user.id },
    });
    return NextResponse.json({ ok: true, marcadaEm: attendance.marcadaEm, nome: crismando.nome });
  } catch {
    return NextResponse.json({ error: "Presença já registrada nesta chamada" }, { status: 409 });
  }
}
