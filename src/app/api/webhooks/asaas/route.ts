import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recebe os eventos do Asaas e atualiza a assinatura da organização.
// Configure no Asaas a URL: https://crisma-chamada.vercel.app/api/webhooks/asaas
// e (opcional) um token de acesso, salvo em ASAAS_WEBHOOK_TOKEN.
export async function POST(req: NextRequest) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;
  if (tokenEsperado && req.headers.get("asaas-access-token") !== tokenEsperado) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const event: string | undefined = body?.event;
  const payment = body?.payment;
  if (!event) return NextResponse.json({ ok: true });

  // Acha a organização pela referência externa ou pela assinatura.
  const orgId: string | undefined = payment?.externalReference;
  const subscriptionId: string | undefined = payment?.subscription;
  const org = orgId
    ? await prisma.organizacao.findUnique({ where: { id: orgId } })
    : subscriptionId
      ? await prisma.organizacao.findFirst({ where: { asaasSubscriptionId: subscriptionId } })
      : null;
  if (!org) return NextResponse.json({ ok: true, ignorado: true });

  const data: any = {};
  if (["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_RECEIVED_IN_CASH"].includes(event)) {
    // Soma um ciclo a partir de hoje ou do período atual (se ainda futuro).
    const agora = Date.now();
    const base = org.periodoFim && new Date(org.periodoFim).getTime() > agora ? new Date(org.periodoFim).getTime() : agora;
    const meses = Number(payment?.value) >= 300 ? 12 : 1;
    data.assinaturaStatus = "ativa";
    data.periodoFim = new Date(base + meses * 30 * 24 * 60 * 60 * 1000);
  } else if (event === "PAYMENT_OVERDUE") {
    data.assinaturaStatus = "atrasada";
  } else if (["SUBSCRIPTION_DELETED", "PAYMENT_REFUNDED", "PAYMENT_DELETED"].includes(event)) {
    data.assinaturaStatus = "cancelada";
  } else {
    return NextResponse.json({ ok: true }); // evento não tratado
  }

  await prisma.organizacao.update({ where: { id: org.id }, data });
  await prisma.logAtividade.create({ data: { orgId: org.id, papel: "sistema", acao: `Asaas: ${event}`, alvo: org.nome } });
  return NextResponse.json({ ok: true });
}
