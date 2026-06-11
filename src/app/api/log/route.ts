import { NextResponse } from "next/server";
import { auth, isCoordenadora, isDono } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Histórico leve de movimentações (coordenadora/dono). Últimos 100 registros.
export async function GET() {
  const session = await auth();
  if (!isCoordenadora(session) && !isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const logs = await prisma.logAtividade.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Anexa nome/e-mail de quem fez a ação.
  const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const mapa = Object.fromEntries(users.map((u) => [u.id, u]));

  const enriquecido = logs.map((l) => ({
    ...l,
    autor: l.userId ? mapa[l.userId]?.name ?? mapa[l.userId]?.email ?? "—" : "—",
  }));
  return NextResponse.json(enriquecido);
}
