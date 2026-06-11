import { auth, isDono } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DonoClient from "./DonoClient";

export default async function DonoPage() {
  const session = await auth();
  if (!isDono(session)) redirect("/");

  const [coordenadoras, totalTurmas, totalFormadores, totalAlunos, totalEncontros, totalPresencas, turmas] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: "coordenadora" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.turma.count(),
      prisma.user.count({ where: { role: "formador" } }),
      prisma.crismando.count(),
      prisma.encontro.count(),
      prisma.attendance.count(),
      prisma.turma.findMany({
        orderBy: { nome: "asc" },
        include: {
          _count: { select: { crismandos: true, encontros: true } },
          formadores: { include: { user: { select: { name: true, email: true } } } },
        },
      }),
    ]);

  const stats = { totalTurmas, totalFormadores, totalAlunos, totalEncontros, totalPresencas };

  return (
    <DonoClient
      coordenadorasIniciais={coordenadoras}
      stats={stats}
      turmas={JSON.parse(JSON.stringify(turmas))}
      nome={session!.user?.name ?? ""}
    />
  );
}
