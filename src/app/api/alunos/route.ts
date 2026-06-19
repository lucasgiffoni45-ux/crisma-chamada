import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, turmasAcessiveis, registrarLog } from "@/lib/auth";
import { podeEscrever } from "@/lib/assinatura";
import { prisma } from "@/lib/prisma";

// GET: lista alunos. Formador vê só das suas turmas; coordenadora/dono veem todos.
// Aceita ?turmaId= para filtrar uma turma específica.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const turmaId = req.nextUrl.searchParams.get("turmaId") ?? undefined;
  const acessiveis = await turmasAcessiveis(session);

  let where: any = {};
  if (acessiveis !== undefined) {
    // formador: restrito às turmas dele
    if (turmaId && !acessiveis.includes(turmaId)) {
      return NextResponse.json({ error: "Turma fora do seu acesso" }, { status: 403 });
    }
    where.turmaId = turmaId ? turmaId : { in: acessiveis };
  } else if (turmaId) {
    where.turmaId = turmaId;
  }

  const alunos = await prisma.crismando.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { turma: { select: { id: true, nome: true } } },
  });
  return NextResponse.json(alunos);
}

// POST: cadastra aluno numa turma. Formador só na própria turma.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!(await podeEscrever(session))) {
    return NextResponse.json({ error: "Assinatura inativa. Renove para continuar." }, { status: 402 });
  }
  const b = await req.json();
  const { nome, email, contato, idade, turmaId } = b;
  if (!nome || !turmaId) {
    return NextResponse.json({ error: "Nome e turma são obrigatórios" }, { status: 400 });
  }
  if (!(await podeGerenciarTurma(session, turmaId))) {
    return NextResponse.json({ error: "Você não gerencia esta turma" }, { status: 403 });
  }
  try {
    const aluno = await prisma.crismando.create({
      data: {
        nome,
        email: email ? String(email).toLowerCase() : null,
        contato: contato || null,
        idade: idade ? Number(idade) : null,
        dataNascimento: b.dataNascimento || null,
        sacramentos: b.sacramentos || null,
        alergias: b.alergias || null,
        necessidades: b.necessidades || null,
        nomePai: b.nomePai || null,
        nomeMae: b.nomeMae || null,
        endereco: b.endereco || null,
        estadoCivil: b.estadoCivil || null,
        serieEscolar: b.serieEscolar || null,
        telefone: b.telefone || null,
        turmaId,
      },
    });
    await registrarLog(session, "cadastrou aluno", nome);
    return NextResponse.json(aluno, { status: 201 });
  } catch {
    return NextResponse.json({ error: "E-mail já cadastrado em outro aluno" }, { status: 409 });
  }
}
