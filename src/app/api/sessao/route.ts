import { NextResponse } from "next/server";
import { auth, isTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessao = await prisma.chamadaSessao.findFirst({
    where: { ativa: true },
    orderBy: { abertaEm: "desc" },
  });
  return NextResponse.json(sessao ?? null);
}

export async function POST() {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.chamadaSessao.updateMany({ where: { ativa: true }, data: { ativa: false, fechadaEm: new Date() } });
  const sessao = await prisma.chamadaSessao.create({ data: {} });
  return NextResponse.json(sessao, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.chamadaSessao.updateMany({ where: { ativa: true }, data: { ativa: false, fechadaEm: new Date() } });
  return NextResponse.json({ ok: true });
}
