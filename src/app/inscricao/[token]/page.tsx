import { prisma } from "@/lib/prisma";
import { rotulosDe } from "@/lib/segmentos";
import { Cruz, Card } from "@/components/ui";
import InscricaoForm from "./InscricaoForm";

export const metadata = { title: "Inscrição — Crisma Chamada" };

export default async function InscricaoPublicaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const org = await prisma.organizacao.findUnique({ where: { inscricaoToken: token } });

  if (!org || !org.inscricaoAberta) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 mb-4">
            <Cruz className="w-8 h-8 text-amber-300" />
          </span>
          <h1 className="font-display text-2xl font-bold text-violet-950">Inscrições encerradas</h1>
          <p className="mt-2 text-stone-500">No momento esta paróquia não está recebendo inscrições. Procure a coordenação.</p>
        </Card>
      </main>
    );
  }

  const r = rotulosDe(org.segmento);
  return <InscricaoForm token={token} orgNome={org.nome} rotulos={r} />;
}
