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
          encontros: { select: { _count: { select: { attendances: true } } } },
        },
      }),
    ]);

  const stats = { totalTurmas, totalFormadores, totalAlunos, totalEncontros, totalPresencas };

  // Estatísticas por turma para os gráficos.
  const estatisticas = turmas.map((t) => {
    const alunos = t._count.crismandos;
    const nEncontros = t.encontros.length;
    const presencas = t.encontros.reduce((s, e) => s + e._count.attendances, 0);
    const esperado = alunos * nEncontros;
    const faltas = Math.max(0, esperado - presencas);
    const frequencia = esperado > 0 ? (presencas / esperado) * 100 : 0;
    return { id: t.id, nome: t.nome, alunos, encontros: nEncontros, presencas, faltas, frequencia };
  });

  const turmasLeves = turmas.map((t) => ({ id: t.id, nome: t.nome, _count: t._count, formadores: t.formadores }));

  return (
    <DonoClient
      coordenadorasIniciais={coordenadoras}
      stats={stats}
      turmas={JSON.parse(JSON.stringify(turmasLeves))}
      estatisticas={estatisticas}
      nome={session!.user?.name ?? ""}
    />
  );
}
