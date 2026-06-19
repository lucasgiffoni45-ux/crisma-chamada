import { auth, papelDe, orgIdDe } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { assinaturaDaOrg } from "@/lib/assinatura";
import { PageHeader, SairLink, Card, Badge } from "@/components/ui";

export const metadata = { title: "Assinatura — Crisma Chamada" };

export default async function AssinaturaPage() {
  const session = await auth();
  const papel = papelDe(session);
  if (!session?.user || papel === "student") redirect("/");

  const info = await assinaturaDaOrg(orgIdDe(session));
  const tom = info?.status === "ativa" || info?.status === "trial" ? "green" : info?.status ? "amber" : "stone";

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <PageHeader titulo="Assinatura" selo="Paróquia" right={<SairLink />} />

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">Situação atual:</span>
          {info ? <Badge tom={tom as any}>{info.mensagem}</Badge> : <Badge tom="stone">Sem organização</Badge>}
        </div>
        <p className="text-sm text-stone-600">
          O acesso é gratuito por <b>30 dias</b>. Depois disso, para continuar usando, a paróquia assina o plano abaixo.
        </p>
      </Card>

      <h2 className="font-display text-2xl font-bold text-violet-900 mt-8 mb-3">Planos</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="font-display text-xl font-semibold text-violet-900">Paróquia</p>
          <p className="text-3xl font-bold text-violet-900 mt-1">R$ 39,90<span className="text-sm font-normal text-stone-400">/mês</span></p>
          <ul className="text-sm text-stone-600 mt-3 space-y-1">
            <li>✓ Turmas e alunos ilimitados</li>
            <li>✓ Todos os recursos</li>
            <li>✓ Suporte por e-mail</li>
          </ul>
        </Card>
        <Card className="p-5 ring-2 ring-amber-300">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-semibold text-violet-900">Paróquia (anual)</p>
            <Badge tom="amber">2 meses grátis</Badge>
          </div>
          <p className="text-3xl font-bold text-violet-900 mt-1">R$ 399<span className="text-sm font-normal text-stone-400">/ano</span></p>
          <ul className="text-sm text-stone-600 mt-3 space-y-1">
            <li>✓ Tudo do mensal</li>
            <li>✓ Economia de ~R$ 80/ano</li>
          </ul>
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <p className="font-semibold text-stone-700 mb-1">Como assinar</p>
        <p className="text-sm text-stone-600">
          Para ativar ou renovar, entre em contato com a coordenação do sistema. Em breve a assinatura poderá ser feita
          direto pelo app (PIX, boleto ou cartão). Assim que o pagamento for confirmado, seu acesso é liberado.
        </p>
        <p className="text-sm text-stone-500 mt-2">Contato: <b>lucas.giffoni45@gmail.com</b></p>
      </Card>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-violet-700 hover:underline">← Voltar</Link>
      </div>
    </div>
  );
}
