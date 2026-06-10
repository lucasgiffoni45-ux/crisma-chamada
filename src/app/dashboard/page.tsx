import { auth, isTeacher } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email || !isTeacher(session.user.email)) {
    redirect("/");
  }

  const [alunos, sessaoAtiva, ultimasSessoes] = await Promise.all([
    prisma.crismando.findMany({ orderBy: { nome: "asc" } }),
    prisma.chamadaSessao.findFirst({ where: { ativa: true } }),
    prisma.chamadaSessao.findMany({
      orderBy: { abertaEm: "desc" },
      take: 5,
      include: { attendances: { include: { crismando: true } } },
    }),
  ]);

  return (
    <DashboardClient
      alunos={alunos}
      sessaoAtiva={sessaoAtiva}
      ultimasSessoes={ultimasSessoes}
    />
  );
}
