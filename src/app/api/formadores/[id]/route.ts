import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, registrarLog, orgIdDe } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Confirma que o formador e a turma pertencem à organização da coordenadora.
async function naMinhaOrg(session: any, formadorId: string, turmaId?: string) {
  const org = orgIdDe(session);
  if (!org) return false;
  const formador = await prisma.user.findUnique({ where: { id: formadorId }, select: { orgId: true } });
  if (!formador || formador.orgId !== org) return false;
  if (turmaId) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId }, select: { orgId: true } });
    if (!turma || turma.orgId !== org) return false;
  }
  return true;
}

// PATCH: atribui/desatribui o formador de uma turma.
// body: { turmaId, atribuir: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const { turmaId, atribuir } = await req.json();
  if (!turmaId) return NextResponse.json({ error: "turmaId é obrigatório" }, { status: 400 });
  if (!(await naMinhaOrg(session, id, turmaId))) {
    return NextResponse.json({ error: "Formador ou turma fora da sua organização" }, { status: 403 });
  }

  if (atribuir) {
    await prisma.formadorTurma.upsert({
      where: { userId_turmaId: { userId: id, turmaId } },
      update: {},
      create: { userId: id, turmaId },
    });
    await registrarLog(session, "atribuiu formador à turma", `${id} → ${turmaId}`);
  } else {
    await prisma.formadorTurma.deleteMany({ where: { userId: id, turmaId } });
    await registrarLog(session, "desatribuiu formador da turma", `${id} ✗ ${turmaId}`);
  }
  return NextResponse.json({ ok: true });
}

// DELETE: remove o papel de formador (preserva o usuário e o histórico).
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await naMinhaOrg(session, id))) {
    return NextResponse.json({ error: "Formador fora da sua organização" }, { status: 403 });
  }
  const alvo = await prisma.user.findUnique({ where: { id } });
  await prisma.formadorTurma.deleteMany({ where: { userId: id } });
  await prisma.user.update({ where: { id }, data: { role: "student", orgId: null } });
  await registrarLog(session, "removeu formador", alvo?.email ?? id);
  return NextResponse.json({ ok: true });
}
