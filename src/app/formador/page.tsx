import { auth, isFormador } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormadorClient from "./FormadorClient";

export default async function FormadorPage() {
  const session = await auth();
  if (!isFormador(session)) redirect("/");

  const user = session!.user as { id: string; name?: string | null };
  const userId = user.id;
  const vinculos = await prisma.formadorTurma.findMany({
    where: { userId },
    include: {
      turma: {
        include: {
          crismandos: { orderBy: { nome: "asc" } },
          encontros: { where: { ativa: true }, take: 1 },
        },
      },
    },
  });

  const turmas = vinculos.map((v) => ({
    id: v.turma.id,
    nome: v.turma.nome,
    crismandos: v.turma.crismandos.map((c) => ({
      id: c.id, nome: c.nome, email: c.email, contato: c.contato, idade: c.idade,
    })),
    encontroAtivo: v.turma.encontros[0]
      ? { id: v.turma.encontros[0].id, token: v.turma.encontros[0].token,
          data: v.turma.encontros[0].data, horario: v.turma.encontros[0].horario,
          tema: v.turma.encontros[0].tema, licaoDeCasa: v.turma.encontros[0].licaoDeCasa }
      : null,
  }));

  const ano = new Date().getFullYear();
  const sabados = await prisma.calendarioSabado.findMany({
    where: { data: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31T23:59:59`) } },
    orderBy: { data: "asc" },
  });

  return <FormadorClient turmasIniciais={turmas} sabados={JSON.parse(JSON.stringify(sabados))} nome={user.name ?? ""} />;
}
