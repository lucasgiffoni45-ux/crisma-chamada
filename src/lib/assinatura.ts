import { prisma } from "./prisma";
import { papelDe, orgIdDe } from "./auth";

export type Assinatura = {
  ativa: boolean;
  status: string; // ativa | trial | trial_vencido | atrasada | cancelada
  diasRestantes: number | null;
  mensagem: string;
};

type OrgLike = { assinaturaStatus: string; trialFim: Date | null; periodoFim: Date | null };

// Avalia a situação da assinatura de uma organização (função pura).
export function avaliarAssinatura(org: OrgLike): Assinatura {
  const agora = Date.now();
  const dias = (d: Date) => Math.max(0, Math.ceil((new Date(d).getTime() - agora) / 86400000));

  if (org.assinaturaStatus === "ativa") {
    if (org.periodoFim && new Date(org.periodoFim).getTime() < agora) {
      return { ativa: false, status: "atrasada", diasRestantes: 0, mensagem: "Assinatura vencida — renove para continuar." };
    }
    const d = org.periodoFim ? dias(org.periodoFim) : null;
    return { ativa: true, status: "ativa", diasRestantes: d, mensagem: d != null ? `Assinatura ativa — renova em ${d} dia(s).` : "Assinatura ativa." };
  }
  if (org.assinaturaStatus === "trial") {
    if (org.trialFim && new Date(org.trialFim).getTime() > agora) {
      const d = dias(org.trialFim);
      return { ativa: true, status: "trial", diasRestantes: d, mensagem: `Teste grátis — ${d} dia(s) restante(s).` };
    }
    return { ativa: false, status: "trial_vencido", diasRestantes: 0, mensagem: "Seu teste grátis terminou. Assine para continuar." };
  }
  return { ativa: false, status: org.assinaturaStatus, diasRestantes: 0, mensagem: "Assinatura inativa." };
}

// Carrega e avalia a assinatura de uma organização.
export async function assinaturaDaOrg(orgId: string | null): Promise<Assinatura | null> {
  if (!orgId) return null;
  const org = await prisma.organizacao.findUnique({
    where: { id: orgId },
    select: { assinaturaStatus: true, trialFim: true, periodoFim: true },
  });
  return org ? avaliarAssinatura(org) : null;
}

// Pode gravar (criar turma/aluno/encontro etc.)? Dono sempre pode; demais dependem da assinatura.
export async function podeEscrever(session: any): Promise<boolean> {
  if (papelDe(session) === "dono") return true;
  const info = await assinaturaDaOrg(orgIdDe(session));
  return !!info?.ativa;
}
