import { NextRequest, NextResponse } from "next/server";
import { auth, podeGerenciarTurma, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: detalhe do encontro com presenças ao vivo e anotações.
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const encontro = await prisma.encontro.findUnique({
    where: { id },
    include: {
      turma: { select: { id: true, nome: true } },
      attendances: {
        include: { crismando: { select: { id: true, nome: true } } },
        orderBy: { marcadaEm: "asc" },
      },
      anotacoes: true,
    },
  });
  if (!encontro) return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, encontro.turmaId))) {
    return NextResponse.json({ error: "Sem acesso a este encontro" }, { status: 403 });
  }
  return NextResponse.json(encontro);
}

// PATCH: salva tema/lição de casa e/ou fecha o encontro.
// body: { tema?, licaoDeCasa?, fechar?: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const encontro = await prisma.encontro.findUnique({ where: { id } });
  if (!encontro) return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
  if (!(await podeGerenciarTurma(session, encontro.turmaId))) {
    return NextResponse.json({ error: "Sem acesso a este encontro" }, { status: 403 });
  }

  const { tema, licaoDeCasa, fechar } = await req.json();
  const data: any = {};
  if (tema !== undefined) data.tema = tema || null;
  if (licaoDeCasa !== undefined) data.licaoDeCasa = licaoDeCasa || null;
  if (fechar) {
    data.ativa = false;
    data.fechadoEm = new Date();
  }
  const atualizado = await prisma.encontro.update({ where: { id }, data });
  if (fechar) await registrarLog(session, "encerrou encontro", new Date(encontro.data).toLocaleDateString("pt-BR"));
  return NextResponse.json(atualizado);
}
