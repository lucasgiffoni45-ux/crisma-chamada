import { NextRequest, NextResponse } from "next/server";
import { auth, turmasAcessiveis } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// CSV de presenças. Coordenadora/dono: tudo; formador: só suas turmas.
// Aceita ?turmaId= para filtrar.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const turmaId = req.nextUrl.searchParams.get("turmaId") ?? undefined;
  const acessiveis = await turmasAcessiveis(session);

  const where: any = {};
  if (acessiveis !== undefined) {
    if (turmaId && !acessiveis.includes(turmaId)) {
      return NextResponse.json({ error: "Turma fora do seu acesso" }, { status: 403 });
    }
    where.turmaId = turmaId ? turmaId : { in: acessiveis };
  } else if (turmaId) {
    where.turmaId = turmaId;
  }

  const encontros = await prisma.encontro.findMany({
    where,
    orderBy: { data: "desc" },
    include: {
      turma: { select: { nome: true } },
      attendances: { include: { crismando: true }, orderBy: { marcadaEm: "asc" } },
    },
  });

  const linhas = ["Turma,Data do encontro,Hora da presença,Nome,E-mail"];
  for (const e of encontros) {
    const dataEnc = new Date(e.data).toLocaleDateString("pt-BR");
    for (const a of e.attendances) {
      const hora = new Date(a.marcadaEm).toLocaleTimeString("pt-BR");
      linhas.push(`"${e.turma.nome}",${dataEnc},${hora},"${a.crismando.nome}",${a.crismando.email}`);
    }
  }

  return new NextResponse("﻿" + linhas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chamada-crisma.csv"`,
    },
  });
}
