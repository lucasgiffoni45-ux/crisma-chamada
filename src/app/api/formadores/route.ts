import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: lista formadores e suas turmas (coordenadora).
export async function GET() {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const formadores = await prisma.user.findMany({
    where: { role: "formador" },
    select: {
      id: true,
      name: true,
      email: true,
      turmas: { include: { turma: { select: { id: true, nome: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(formadores);
}

// POST: cadastra um formador (upsert por e-mail) e opcionalmente já atribui a uma turma.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { nome, email, turmaId } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
  const emailLower = email.toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: emailLower },
    update: { role: "formador", ...(nome ? { name: nome } : {}) },
    create: { email: emailLower, name: nome ?? null, role: "formador" },
  });

  if (turmaId) {
    await prisma.formadorTurma.upsert({
      where: { userId_turmaId: { userId: user.id, turmaId } },
      update: {},
      create: { userId: user.id, turmaId },
    });
  }
  await registrarLog(session, "cadastrou formador", emailLower);
  return NextResponse.json(user, { status: 201 });
}
