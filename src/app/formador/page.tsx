import { auth, isFormador, orgIdDe } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormadorClient from "./FormadorClient";

export default async function FormadorPage() {
  const session = await auth();
  if (!isFormador(session)) redirect("/");

  const user = session!.user as { id: string; name?: string | null };
  const userId = user.id;
  const orgId = orgIdDe(session);
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

  const turmaIds = vinculos.map((v) => v.turma.id);

  // Todos os encontros das turmas do formador, com presenças, para os gráficos.
  const encontrosTurmas = await prisma.encontro.findMany({
    where: { turmaId: { in: turmaIds } },
    orderBy: { data: "asc" },
    include: { attendances: { select: { crismandoId: true } } },
  });

  const turmas = vinculos.map((v) => {
    const enc = encontrosTurmas.filter((e) => e.turmaId === v.turma.id);
    const fmt = (d: Date) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

    // Presentes por encontro (ao longo do tempo).
    const porEncontro = enc.map((e) => ({ label: fmt(e.data), valor: e.attendances.length }));

    // Presenças acumuladas por aluno.
    const porAluno = v.turma.crismandos.map((c) => ({
      label: c.nome,
      valor: enc.reduce((s, e) => s + (e.attendances.some((a) => a.crismandoId === c.id) ? 1 : 0), 0),
    }));

    // Alerta de evasão: ausente nos 2 últimos encontros realizados.
    const ultimos2 = enc.slice(-2);
    const ausenteNos2 = (cid: string) => ultimos2.length === 2 && ultimos2.every((e) => !e.attendances.some((a) => a.crismandoId === cid));

    return {
      id: v.turma.id,
      nome: v.turma.nome,
      totalEncontros: enc.length,
      crismandos: v.turma.crismandos.map((c) => ({
        id: c.id, nome: c.nome, email: c.email, contato: c.contato, idade: c.idade,
        dataNascimento: c.dataNascimento, sacramentos: c.sacramentos, alergias: c.alergias, necessidades: c.necessidades,
        alerta: ausenteNos2(c.id),
      })),
      encontroAtivo: v.turma.encontros[0]
        ? { id: v.turma.encontros[0].id, token: v.turma.encontros[0].token,
            data: v.turma.encontros[0].data, horario: v.turma.encontros[0].horario,
            tema: v.turma.encontros[0].tema, licaoDeCasa: v.turma.encontros[0].licaoDeCasa }
        : null,
      graficos: { porEncontro, porAluno },
    };
  });

  const ano = new Date().getFullYear();
  const sabados = await prisma.calendarioSabado.findMany({
    where: { orgId, data: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31T23:59:59`) } },
    orderBy: { data: "asc" },
  });

  return <FormadorClient turmasIniciais={JSON.parse(JSON.stringify(turmas))} sabados={JSON.parse(JSON.stringify(sabados))} nome={user.name ?? ""} />;
}
