import { auth, isCoordenadora } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CoordenadoraClient from "./CoordenadoraClient";

export default async function CoordenadoraPage() {
  const session = await auth();
  if (!isCoordenadora(session)) redirect("/");

  const ano = new Date().getFullYear();

  const [turmas, formadores, sabados, encontros] = await Promise.all([
    prisma.turma.findMany({
      orderBy: { nome: "asc" },
      include: {
        formadores: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { crismandos: true } },
        encontros: { select: { _count: { select: { attendances: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: "formador" },
      select: { id: true, name: true, email: true, turmas: { select: { turmaId: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.calendarioSabado.findMany({
      where: { data: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31T23:59:59`) } },
      orderBy: { data: "asc" },
    }),
    prisma.encontro.findMany({
      orderBy: { data: "desc" },
      take: 20,
      include: {
        turma: { select: { nome: true } },
        attendances: { include: { crismando: { select: { nome: true } } } },
      },
    }),
  ]);

  // Todos os alunos (coordenadora vê tudo), com a turma, para a aba de detalhes.
  const alunos = await prisma.crismando.findMany({
    orderBy: [{ turma: { nome: "asc" } }, { nome: "asc" }],
    include: { turma: { select: { nome: true } } },
  });

  // Estatísticas por turma (alunos, encontros, presenças, faltas estimadas, frequência %).
  const estatisticas = turmas.map((t) => {
    const alunos = t._count.crismandos;
    const nEncontros = t.encontros.length;
    const presencas = t.encontros.reduce((s, e) => s + e._count.attendances, 0);
    const esperado = alunos * nEncontros;
    const faltas = Math.max(0, esperado - presencas);
    const frequencia = esperado > 0 ? (presencas / esperado) * 100 : 0;
    return { id: t.id, nome: t.nome, alunos, encontros: nEncontros, presencas, faltas, frequencia };
  });

  // Remove o campo encontros (já agregado) antes de enviar ao client.
  const turmasLeves = turmas.map((t) => ({
    id: t.id, nome: t.nome, formadores: t.formadores, _count: t._count,
  }));

  return (
    <CoordenadoraClient
      turmasIniciais={JSON.parse(JSON.stringify(turmasLeves))}
      formadoresIniciais={JSON.parse(JSON.stringify(formadores))}
      sabadosIniciais={JSON.parse(JSON.stringify(sabados))}
      encontros={JSON.parse(JSON.stringify(encontros))}
      estatisticas={estatisticas}
      alunos={JSON.parse(JSON.stringify(alunos))}
      ano={ano}
    />
  );
}
