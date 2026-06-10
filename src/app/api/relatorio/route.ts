import { NextResponse } from "next/server";
import { auth, isTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const sessoes = await prisma.chamadaSessao.findMany({
    orderBy: { abertaEm: "desc" },
    include: {
      attendances: {
        include: { crismando: true },
        orderBy: { marcadaEm: "asc" },
      },
    },
  });

  const linhas = ["Data,Hora,Nome,E-mail"];
  for (const s of sessoes) {
    for (const a of s.attendances) {
      const data = new Date(a.marcadaEm).toLocaleDateString("pt-BR");
      const hora = new Date(a.marcadaEm).toLocaleTimeString("pt-BR");
      linhas.push(`${data},${hora},"${a.crismando.nome}",${a.crismando.email}`);
    }
  }

  return new NextResponse(linhas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chamada-crisma.csv"`,
    },
  });
}
