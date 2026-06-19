import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export const metadata = { title: "Termos de Uso — Crisma Chamada" };

export default function TermosPage() {
  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-violet-50 ring-1 ring-violet-100">
          <Cruz className="w-6 h-6 text-amber-600" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold text-violet-900 leading-tight">Termos de Uso</h1>
          <p className="text-sm text-stone-500">Crisma — Chamada</p>
        </div>
      </div>

      <Card className="p-6 space-y-5 text-sm text-stone-700 leading-relaxed">
        <p className="text-xs text-stone-400">Última atualização: 19/06/2026</p>

        <Secao titulo="1. O que é o serviço">
          O Crisma Chamada é um sistema online para registro de presença e organização de turmas de catequese,
          oferecido às paróquias e suas coordenações. Ao usar, você concorda com estes termos.
        </Secao>

        <Secao titulo="2. Quem pode usar">
          O acesso é concedido a coordenadoras, formadores e alunos vinculados a uma paróquia cadastrada. Cada usuário
          é responsável por manter sua conta Google segura e por usar o sistema apenas para fins da catequese.
        </Secao>

        <Secao titulo="3. Responsabilidades de quem usa">
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            <li>Inserir dados verdadeiros e ter autorização para cadastrar dados de terceiros (incluindo menores).</li>
            <li>Não compartilhar dados de alunos fora da finalidade da catequese.</li>
            <li>Não tentar acessar dados de outra organização/paróquia.</li>
          </ul>
        </Secao>

        <Secao titulo="4. Planos e pagamento">
          Há um período de avaliação gratuito. Após esse período, o uso contínuo depende de assinatura ativa, conforme
          os planos informados na tela de assinatura. Em caso de não pagamento, o acesso de criação/edição pode ser
          suspenso, sem exclusão dos dados já cadastrados.
        </Secao>

        <Secao titulo="5. Dados pessoais e privacidade">
          O tratamento de dados segue a nossa <Link href="/privacidade" className="text-violet-700 hover:underline">Política de Privacidade</Link>,
          em conformidade com a LGPD. Dados de menores são tratados com consentimento dos responsáveis.
        </Secao>

        <Secao titulo="6. Disponibilidade e limitações">
          Empenhamo-nos para manter o serviço disponível, mas ele é fornecido “como está”, podendo haver interrupções
          para manutenção. Não nos responsabilizamos por indisponibilidades de provedores externos (hospedagem, login).
        </Secao>

        <Secao titulo="7. Alterações">
          Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas pelos canais da coordenação.
        </Secao>

        <Secao titulo="8. Contato">
          Dúvidas sobre estes termos: fale com a coordenação responsável pelo sistema.
        </Secao>

        <p className="text-xs text-stone-400 border-t border-stone-100 pt-4">
          Documento modelo. Para uso comercial, recomenda-se revisão por profissional jurídico.
        </p>
      </Card>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-violet-700 hover:underline">← Voltar ao início</Link>
      </div>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-violet-900 mb-1">{titulo}</h2>
      <div>{children}</div>
    </section>
  );
}
