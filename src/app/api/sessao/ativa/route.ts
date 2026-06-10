import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessao = await prisma.chamadaSessao.findFirst({
    where: { ativa: true },
    include: {
      attendances: {
        include: { crismando: true },
        orderBy: { marcadaEm: "asc" },
      },
    },
  });
  return NextResponse.json(sessao ?? null);
}
