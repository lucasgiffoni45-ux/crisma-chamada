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

  return (
    <CoordenadoraClient
      turmasIniciais={JSON.parse(JSON.stringify(turmas))}
      formadoresIniciais={JSON.parse(JSON.stringify(formadores))}
      sabadosIniciais={JSON.parse(JSON.stringify(sabados))}
      encontros={JSON.parse(JSON.stringify(encontros))}
      ano={ano}
    />
  );
}
