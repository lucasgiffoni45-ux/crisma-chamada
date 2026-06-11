import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: edita nome, contato, idade e/ou e-mail do aluno.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const aluno = await prisma.crismando.findUnique({ where: { id } });
  if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, aluno.turmaId))) {
    return NextResponse.json({ error: "Você não gerencia esta turma" }, { status: 403 });
  }

  const { nome, email, contato, idade } = await req.json();
  const data: any = {};
  if (nome !== undefined) data.nome = nome;
  if (email !== undefined) data.email = String(email).toLowerCase();
  if (contato !== undefined) data.contato = contato || null;
  if (idade !== undefined) data.idade = idade ? Number(idade) : null;

  try {
    const atualizado = await prisma.crismando.update({ where: { id }, data });
    await registrarLog(session, "editou aluno", aluno.nome);
    return NextResponse.json(atualizado);
  } catch {
    return NextResponse.json({ error: "E-mail já cadastrado em outro aluno" }, { status: 409 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const aluno = await prisma.crismando.findUnique({ where: { id } });
  if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, aluno.turmaId))) {
    return NextResponse.json({ error: "Você não gerencia esta turma" }, { status: 403 });
  }
  await prisma.crismando.delete({ where: { id } });
  await registrarLog(session, "removeu aluno", aluno.nome);
  return NextResponse.json({ ok: true });
}
