// Cliente da API do Asaas (cobrança recorrente: PIX, boleto, cartão).
// Só fica ativo quando ASAAS_API_KEY estiver definida (sandbox ou produção).
const BASE = process.env.ASAAS_BASE_URL || "https://sandbox.asaas.com/api/v3";
const KEY = process.env.ASAAS_API_KEY;

export const PLANOS = {
  mensal: { value: 39.9, cycle: "MONTHLY" as const, meses: 1 },
  anual: { value: 399, cycle: "YEARLY" as const, meses: 12 },
};
export type PlanoAsaas = keyof typeof PLANOS;

export function asaasConfigurado() {
  return !!KEY;
}

async function asaas(path: string, method: string, body?: any) {
  const res = await fetch(BASE + path, {
    method,
    headers: { access_token: KEY!, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.description || `Erro Asaas (${res.status})`);
  }
  return data;
}

// Reaproveita o cliente pela referência da organização; cria se não existir.
export async function criarOuObterCliente(orgId: string, nome: string, email: string) {
  const busca = await asaas(`/customers?externalReference=${encodeURIComponent(orgId)}`, "GET");
  if (busca?.data?.length) return busca.data[0];
  return asaas("/customers", "POST", { name: nome, email, externalReference: orgId });
}

// Cria a assinatura recorrente e devolve o link de pagamento (invoiceUrl).
export async function criarAssinatura(customerId: string, orgId: string, plano: PlanoAsaas) {
  const p = PLANOS[plano];
  const hoje = new Date().toISOString().slice(0, 10);
  const sub = await asaas("/subscriptions", "POST", {
    customer: customerId,
    billingType: "UNDEFINED", // o pagador escolhe PIX / boleto / cartão
    value: p.value,
    nextDueDate: hoje,
    cycle: p.cycle,
    description: "Crisma Chamada — plano Paróquia",
    externalReference: orgId,
  });
  // A primeira cobrança traz a página de pagamento.
  const pays = await asaas(`/subscriptions/${sub.id}/payments`, "GET");
  const invoiceUrl = pays?.data?.[0]?.invoiceUrl ?? null;
  return { subscriptionId: sub.id as string, invoiceUrl };
}
