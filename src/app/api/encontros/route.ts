import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, turmasAcessiveis, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: lista encontros. ?turmaId filtra; ?ativa=1 retorna só os abertos.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const turmaId = req.nextUrl.searchParams.get("turmaId") ?? undefined;
  const apenasAtiva = req.nextUrl.searchParams.get("ativa") === "1";
  const acessiveis = await turmasAcessiveis(session);

  const where: any = {};
  if (acessiveis !== undefined) where.turmaId = { in: acessiveis };
  if (turmaId) where.turmaId = turmaId;
  if (apenasAtiva) where.ativa = true;

  const encontros = await prisma.encontro.findMany({
    where,
    orderBy: { data: "desc" },
    include: {
      turma: { select: { id: true, nome: true } },
      attendances: {
        include: { crismando: { select: { id: true, nome: true } } },
        orderBy: { marcadaEm: "asc" },
      },
    },
  });
  return NextResponse.json(encontros);
}

// POST: abre o encontro de um sábado para uma turma (gera token/QR).
// body: { turmaId, data, horario? }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { turmaId, data, horario } = await req.json();
  if (!turmaId || !data) {
    return NextResponse.json({ error: "Turma e data são obrigatórios" }, { status: 400 });
  }
  if (!(await podeGerenciarTurma(session, turmaId))) {
    return NextResponse.json({ error: "Você não gerencia esta turma" }, { status: 403 });
  }

  // Fecha qualquer encontro ainda aberto desta turma.
  await prisma.encontro.updateMany({
    where: { turmaId, ativa: true },
    data: { ativa: false, fechadoEm: new Date() },
  });

  const encontro = await prisma.encontro.create({
    data: { turmaId, data: new Date(data), horario: horario || null },
  });
  await registrarLog(session, "abriu encontro", new Date(data).toLocaleDateString("pt-BR"));
  return NextResponse.json(encontro, { status: 201 });
}
