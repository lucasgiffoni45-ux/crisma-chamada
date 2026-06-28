import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, orgIdDe, podeGerenciarTurma, registrarLog } from "@/lib/auth";
import { podeEscrever } from "@/lib/assinatura";
import { prisma } from "@/lib/prisma";

// POST: aprova (cria o aluno na turma escolhida) ou recusa a inscrição.
// body: { acao: "aprovar", turmaId } | { acao: "recusar" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const insc = await prisma.inscricao.findUnique({ where: { id } });
  if (!insc || insc.orgId !== orgIdDe(session)) {
    return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
  }
  if (insc.status !== "pendente") {
    return NextResponse.json({ error: "Esta inscrição já foi processada" }, { status: 409 });
  }

  const { acao, turmaId } = await req.json();

  if (acao === "recusar") {
    await prisma.inscricao.update({ where: { id }, data: { status: "recusada" } });
    await registrarLog(session, "recusou inscrição", insc.nome);
    return NextResponse.json({ ok: true });
  }

  if (acao === "aprovar") {
    if (!(await podeEscrever(session))) {
      return NextResponse.json({ error: "Assinatura inativa. Renove para aprovar." }, { status: 402 });
    }
    if (!turmaId || !(await podeGerenciarTurma(session, turmaId))) {
      return NextResponse.json({ error: "Escolha uma turma da sua organização" }, { status: 400 });
    }
    try {
      await prisma.crismando.create({
        data: {
          nome: insc.nome, email: insc.email, contato: insc.contato,
          dataNascimento: insc.dataNascimento, sacramentos: insc.sacramentos,
          alergias: insc.alergias, necessidades: insc.necessidades,
          nomePai: insc.nomePai, nomeMae: insc.nomeMae, endereco: insc.endereco,
          estadoCivil: insc.estadoCivil, serieEscolar: insc.serieEscolar,
          telefone: insc.telefone, comunidade: insc.comunidade, comunidadeEncontros: insc.comunidadeEncontros,
          fotoBase64: insc.fotoBase64, turmaId,
        },
      });
    } catch {
      return NextResponse.json({ error: "Já existe aluno com esse e-mail" }, { status: 409 });
    }
    await prisma.inscricao.update({ where: { id }, data: { status: "aprovada" } });
    await registrarLog(session, "aprovou inscrição", insc.nome);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
