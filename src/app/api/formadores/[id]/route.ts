import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const alvo = await prisma.user.findUnique({ where: { id } });
  await prisma.formadorTurma.deleteMany({ where: { userId: id } });
  await prisma.user.update({ where: { id }, data: { role: "student" } });
  await registrarLog(session, "removeu formador", alvo?.email ?? id);
  return NextResponse.json({ ok: true });
}
