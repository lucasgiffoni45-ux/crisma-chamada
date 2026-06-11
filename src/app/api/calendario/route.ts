import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, registrarLog, papelDe } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: lista os sábados do calendário (compartilhado). ?ano filtra por ano.
export async function GET(req: NextRequest) {
  const session = await auth();
  const papel = papelDe(session);
  if (!session?.user?.id || papel === "student") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const ano = req.nextUrl.searchParams.get("ano");
  const where: any = {};
  if (ano) {
    where.data = {
      gte: new Date(`${ano}-01-01T00:00:00`),
      lte: new Date(`${ano}-12-31T23:59:59`),
    };
  }
  const sabados = await prisma.calendarioSabado.findMany({ where, orderBy: { data: "asc" } });
  return NextResponse.json(sabados);
}

// POST: gera todos os sábados de um ano (idempotente). body: { ano }  — coordenadora.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Apenas a coordenadora planeja o calendário" }, { status: 401 });
  }
  const { ano } = await req.json();
  const year = Number(ano);
  if (!year) return NextResponse.json({ error: "Ano inválido" }, { status: 400 });

  // Encontra todos os sábados do ano usando UTC (getUTCDay() === 6) e fixa o
  // horário em 12:00 UTC. Assim o fuso do Brasil (UTC-3) nunca empurra a data
  // para o dia anterior — o que antes fazia aparecer sexta no lugar de sábado.
  const datas: Date[] = [];
  const d = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1); // primeiro sábado
  for (; d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 7)) {
    datas.push(new Date(d));
  }

  // Limpa os sábados já gerados deste ano (evita duplicatas e remove dados
  // antigos com horário errado) antes de recriar.
  await prisma.calendarioSabado.deleteMany({
    where: { data: { gte: new Date(`${year}-01-01T00:00:00Z`), lte: new Date(`${year}-12-31T23:59:59Z`) } },
  });
  await prisma.calendarioSabado.createMany({
    data: datas.map((data) => ({ data, temEncontro: true, recesso: false })),
    skipDuplicates: true,
  });
  await registrarLog(session, "gerou calendário do ano", String(year));
  return NextResponse.json({ ok: true, total: datas.length });
}

// PATCH: atualiza um sábado (tem encontro / recesso / horário / mensagem ≤50). Coordenadora.
// body: { id, temEncontro?, recesso?, horario?, mensagem? }
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id, temEncontro, recesso, horario, mensagem } = await req.json();
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const data: any = {};
  if (temEncontro !== undefined) data.temEncontro = !!temEncontro;
  if (recesso !== undefined) data.recesso = !!recesso;
  if (horario !== undefined) data.horario = horario || null;
  if (mensagem !== undefined) data.mensagem = mensagem ? String(mensagem).slice(0, 50) : null;

  const sabado = await prisma.calendarioSabado.update({ where: { id }, data });
  await registrarLog(session, "ajustou calendário", new Date(sabado.data).toLocaleDateString("pt-BR"));
  return NextResponse.json(sabado);
}
