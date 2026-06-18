import { NextRequest, NextResponse } from "next/server";
import { auth, isDono, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Apenas o Dono cadastra/remove coordenadoras.
export async function GET() {
  const session = await auth();
  if (!isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const coords = await prisma.user.findMany({
    where: { role: "coordenadora" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(coords);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { nome, email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
  }
  const emailLower = email.toLowerCase();

  // Cada coordenadora ganha sua própria organização (tenant isolado).
  const existente = await prisma.user.findUnique({ where: { email: emailLower } });
  const orgId = existente?.orgId
    ?? (await prisma.organizacao.create({ data: { nome: `Paróquia de ${nome ?? emailLower}` } })).id;

  const user = await prisma.user.upsert({
    where: { email: emailLower },
    update: { role: "coordenadora", orgId, ...(nome ? { name: nome } : {}) },
    create: { email: emailLower, name: nome ?? null, role: "coordenadora", orgId },
  });
  await registrarLog(session, "cadastrou coordenadora", emailLower);
  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await req.json();
  const alvo = await prisma.user.findUnique({ where: { id } });
  // Não apaga o usuário (preserva histórico), apenas rebaixa o papel.
  await prisma.user.update({ where: { id }, data: { role: "student" } });
  await registrarLog(session, "removeu coordenadora", alvo?.email ?? id);
  return NextResponse.json({ ok: true });
}
