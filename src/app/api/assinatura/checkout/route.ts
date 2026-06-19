import { NextRequest, NextResponse } from "next/server";
import { auth, isCoordenadora, orgIdDe, registrarLog } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asaasConfigurado, criarOuObterCliente, criarAssinatura, PLANOS, PlanoAsaas } from "@/lib/asaas";

// POST: cria (ou reusa) a assinatura no Asaas e devolve o link de pagamento.
// body: { plano: "mensal" | "anual" }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isCoordenadora(session)) {
    return NextResponse.json({ error: "Apenas a coordenadora assina" }, { status: 401 });
  }
  if (!asaasConfigurado()) {
    return NextResponse.json({ error: "Pagamento online ainda não foi configurado. Fale com a coordenação." }, { status: 503 });
  }
  const orgId = orgIdDe(session);
  const email = session?.user?.email;
  if (!orgId || !email) return NextResponse.json({ error: "Sem organização" }, { status: 400 });

  const { plano } = await req.json();
  if (!(plano in PLANOS)) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const org = await prisma.organizacao.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });

  try {
    const cliente = await criarOuObterCliente(orgId, org.nome, email);
    const { subscriptionId, invoiceUrl } = await criarAssinatura(cliente.id, orgId, plano as PlanoAsaas);
    await prisma.organizacao.update({
      where: { id: orgId },
      data: { asaasCustomerId: cliente.id, asaasSubscriptionId: subscriptionId, plano: plano === "anual" ? "paroquia" : "paroquia" },
    });
    await registrarLog(session, "iniciou assinatura", plano);
    return NextResponse.json({ url: invoiceUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Falha ao criar a cobrança" }, { status: 502 });
  }
}
