import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Cria ou atualiza a anotação curta (≤50 chars) de um aluno num encontro.
// body: { encontroId, crismandoId, texto }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { encontroId, crismandoId, texto } = await req.json();
  if (!encontroId || !crismandoId) {
    return NextResponse.json({ error: "Encontro e aluno são obrigatórios" }, { status: 400 });
  }

  const encontro = await prisma.encontro.findUnique({ where: { id: encontroId } });
  if (!encontro) return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, encontro.turmaId))) {
    return NextResponse.json({ error: "Sem acesso a este encontro" }, { status: 403 });
  }

  const limpo = String(texto ?? "").slice(0, 50);

  const anotacao = await prisma.anotacaoAluno.upsert({
    where: { encontroId_crismandoId: { encontroId, crismandoId } },
    update: { texto: limpo },
    create: { encontroId, crismandoId, texto: limpo },
  });
  await registrarLog(session, "anotou sobre aluno", crismandoId);
  return NextResponse.json(anotacao, { status: 201 });
}
