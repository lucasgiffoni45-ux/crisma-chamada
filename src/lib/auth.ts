import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      // Vincula o login Google a um usuário já cadastrado com o mesmo e-mail
      // (coordenadoras/formadores são pré-cadastrados pelo papel acima deles).
      // Seguro aqui: o e-mail é verificado pelo Google e os e-mails são de confiança.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      let role = (user as any).role ?? "student";

      // Seed do Dono: se o e-mail bater com OWNER_EMAIL e o papel ainda não
      // foi definido, promove a "dono" e persiste no banco.
      const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
      if (ownerEmail && session.user.email?.toLowerCase() === ownerEmail && role !== "dono") {
        await prisma.user.update({ where: { id: user.id }, data: { role: "dono" } });
        role = "dono";
      }

      (session.user as any).role = role;
      (session.user as any).orgId = (user as any).orgId ?? null;
      return session;
    },
  },
});

export type Papel = "dono" | "coordenadora" | "formador" | "student";

export function papelDe(session: any): Papel {
  return (session?.user?.role as Papel) ?? "student";
}

export function isDono(session: any) {
  return papelDe(session) === "dono";
}

export function isCoordenadora(session: any) {
  return papelDe(session) === "coordenadora";
}

export function isFormador(session: any) {
  return papelDe(session) === "formador";
}

// Organização (tenant) do usuário logado. Dono = null (vê tudo).
export function orgIdDe(session: any): string | null {
  return (session?.user?.orgId as string | null) ?? null;
}

// Verifica se o formador logado está atribuído à turma informada.
export async function formadorPodeTurma(userId: string, turmaId: string) {
  const vinculo = await prisma.formadorTurma.findUnique({
    where: { userId_turmaId: { userId, turmaId } },
  });
  return !!vinculo;
}

// Dono manda em tudo; coordenadora só na SUA organização; formador só nas turmas dele.
export async function podeGerenciarTurma(session: any, turmaId: string) {
  const papel = papelDe(session);
  if (papel === "dono") return true;
  if (papel === "coordenadora") {
    const org = orgIdDe(session);
    if (!org) return false;
    const turma = await prisma.turma.findUnique({ where: { id: turmaId }, select: { orgId: true } });
    return !!turma && turma.orgId === org;
  }
  if (papel === "formador") return formadorPodeTurma(session.user.id, turmaId);
  return false;
}

// IDs das turmas que o usuário pode ver/gerenciar (undefined = todas, só Dono).
export async function turmasAcessiveis(session: any): Promise<string[] | undefined> {
  const papel = papelDe(session);
  if (papel === "dono") return undefined; // vê tudo
  if (papel === "coordenadora") {
    const org = orgIdDe(session);
    if (!org) return [];
    const turmas = await prisma.turma.findMany({ where: { orgId: org }, select: { id: true } });
    return turmas.map((t) => t.id);
  }
  if (papel === "formador") {
    const vinculos = await prisma.formadorTurma.findMany({
      where: { userId: session.user.id },
      select: { turmaId: true },
    });
    return vinculos.map((v) => v.turmaId);
  }
  return [];
}

// Registro leve de auditoria. Nunca lança erro para não quebrar o fluxo principal.
export async function registrarLog(
  session: any,
  acao: string,
  alvo?: string
) {
  try {
    await prisma.logAtividade.create({
      data: {
        userId: session?.user?.id ?? null,
        orgId: orgIdDe(session),
        papel: papelDe(session),
        acao,
        alvo: alvo ?? null,
      },
    });
  } catch {
    // silencioso de propósito
  }
}
