import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, registrarLog, orgIdDe } from "@/lib/auth";
import { podeEscrever } from "@/lib/assinatura";
import { emailValido } from "@/lib/validar";
import { prisma } from "@/lib/prisma";

// GET: lista os formadores da organização da coordenadora.
export async function GET() {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const formadores = await prisma.user.findMany({
    where: { role: "formador", orgId: orgIdDe(session) },
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

// POST: cadastra um formador na organização da coordenadora.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!(await podeEscrever(session))) {
    return NextResponse.json({ error: "Assinatura inativa. Renove para continuar." }, { status: 402 });
  }
  const orgId = orgIdDe(session);
  if (!orgId) return NextResponse.json({ error: "Coordenadora sem organização" }, { status: 400 });
  const { nome, email, turmaId } = await req.json();
  if (!email || !emailValido(email)) return NextResponse.json({ error: "Informe um e-mail válido" }, { status: 400 });
  const emailLower = email.toLowerCase().trim();

  // Não permite "roubar" um usuário que já é dono/coordenadora de outra organização.
  const existente = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existente && (existente.role === "dono" || existente.role === "coordenadora") && existente.orgId !== orgId) {
    return NextResponse.json({ error: "Este e-mail já tem outra função no sistema" }, { status: 409 });
  }

  const user = await prisma.user.upsert({
    where: { email: emailLower },
    update: { role: "formador", orgId, ...(nome ? { name: nome } : {}) },
    create: { email: emailLower, name: nome ?? null, role: "formador", orgId },
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
