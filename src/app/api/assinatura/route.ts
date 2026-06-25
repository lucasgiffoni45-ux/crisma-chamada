import { NextRequest, NextResponse } from "next/server";
import { auth, isDono, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { avaliarAssinatura } from "@/lib/assinatura";

// GET: lista as organizações e a situação de cada assinatura (Dono).
export async function GET() {
  const session = await auth();
  if (!isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const orgs = await prisma.organizacao.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      users: { where: { role: "coordenadora" }, select: { name: true, email: true } },
      _count: { select: { turmas: true } },
    },
  });
  const lista = orgs.map((o) => ({
    id: o.id,
    nome: o.nome,
    plano: o.plano,
    segmento: o.segmento,
    coordenadora: o.users[0]?.name ?? o.users[0]?.email ?? "—",
    turmas: o._count.turmas,
    info: avaliarAssinatura(o),
    periodoFim: o.periodoFim,
    trialFim: o.trialFim,
  }));
  return NextResponse.json(lista);
}

// POST: ativa/renova, cancela ou volta para teste (Dono).
// body: { orgId, acao: "ativar" | "cancelar" | "teste", meses?: number }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isDono(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { orgId, acao, meses, valor } = await req.json();
  if (!orgId || !acao) return NextResponse.json({ error: "orgId e ação são obrigatórios" }, { status: 400 });

  const data: any = {};
  if (acao === "ativar") {
    const m = Number(meses) || 1;
    const base = new Date();
    const atual = await prisma.organizacao.findUnique({ where: { id: orgId }, select: { periodoFim: true } });
    // Se já tem período futuro, soma a partir dele; senão a partir de hoje.
    const inicio = atual?.periodoFim && new Date(atual.periodoFim) > base ? new Date(atual.periodoFim) : base;
    data.assinaturaStatus = "ativa";
    data.periodoFim = new Date(inicio.getTime() + m * 30 * 24 * 60 * 60 * 1000);
    if (meses && Number(meses) >= 12) data.plano = "paroquia";
  } else if (acao === "cancelar") {
    data.assinaturaStatus = "cancelada";
  } else if (acao === "teste") {
    data.assinaturaStatus = "trial";
    data.trialFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (acao === "segmento") {
    const validos = ["catequese", "escola", "musica", "artes-marciais"];
    if (!validos.includes(valor)) return NextResponse.json({ error: "Segmento inválido" }, { status: 400 });
    data.segmento = valor;
  } else {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const org = await prisma.organizacao.update({ where: { id: orgId }, data });
  await registrarLog(session, `assinatura: ${acao}`, org.nome);
  return NextResponse.json({ ok: true, info: avaliarAssinatura(org) });
}
