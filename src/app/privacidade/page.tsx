import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export const metadata = { title: "Política de Privacidade — Crisma Chamada" };

export default function PrivacidadePage() {
  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-violet-50 ring-1 ring-violet-100">
          <Cruz className="w-6 h-6 text-amber-600" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold text-violet-900 leading-tight">Política de Privacidade</h1>
          <p className="text-sm text-stone-500">Crisma — Chamada · em conformidade com a LGPD (Lei 13.709/2018)</p>
        </div>
      </div>

      <Card className="p-6 space-y-5 text-sm text-stone-700 leading-relaxed">
        <p className="text-xs text-stone-400">Última atualização: 18/06/2026</p>

        <Secao titulo="1. Quem é o responsável (controlador)">
          Os dados são tratados pela coordenação da catequese responsável por cada turma. Para exercer seus direitos
          ou tirar dúvidas, fale com a coordenadora da sua paróquia ou pelo e-mail de contato informado por ela.
        </Secao>

        <Secao titulo="2. Quais dados coletamos">
          Nome, e-mail, contato/WhatsApp, idade e data de nascimento, sacramentos recebidos, informações de saúde
          relevantes (alergias e necessidades especiais), nome dos pais/responsáveis, endereço, estado civil,
          série escolar e os registros de presença nos encontros. Opcionalmente, mediante <b>consentimento específico
          do responsável</b>, uma <b>foto</b> do(a) aluno(a) — usada apenas para identificação pela coordenação.
        </Secao>

        <Secao titulo="3. Para que usamos">
          Exclusivamente para a <b>gestão da catequese</b>: organização das turmas, controle de presença, comunicação
          com o aluno e responsáveis, e cuidado individual (ex.: alergias). Não usamos os dados para publicidade.
        </Secao>

        <Secao titulo="4. Dados de menores de idade">
          Tratamos dados de adolescentes e crianças com base no <b>consentimento dos pais ou responsáveis</b>, coletado
          na ficha de inscrição da catequese, sempre no melhor interesse do menor.
        </Secao>

        <Secao titulo="5. Quem tem acesso (e o que vê)">
          O acesso é por necessidade, controlado por papel:
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            <li><b>Formador</b>: vê apenas os alunos da sua turma (dados pedagógicos e de cuidado).</li>
            <li><b>Coordenadora</b>: vê apenas os dados da <b>sua organização</b> — nunca de outra paróquia/coordenação.</li>
            <li><b>Administração do sistema</b>: acesso técnico para manutenção.</li>
          </ul>
          Cada organização é <b>isolada</b>: um(a) coordenador(a) não acessa os dados de outra. A <b>foto</b> do(a)
          aluno(a), quando fornecida, é visível <b>apenas à coordenação</b> (não ao formador).
        </Secao>

        <Secao titulo="6. Compartilhamento">
          Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Utilizamos provedores de
          tecnologia apenas para hospedar o sistema com segurança (servidores e login), que atuam como operadores.
        </Secao>

        <Secao titulo="7. Segurança">
          Acesso somente por login com conta Google, permissões por papel, conexão criptografada (HTTPS) e
          registro das principais ações (quem fez o quê) para responsabilização.
        </Secao>

        <Secao titulo="8. Por quanto tempo guardamos">
          Enquanto durar a participação na catequese. Após a conclusão, os dados podem ser arquivados para fins de
          histórico/certificação e eliminados mediante solicitação do titular ou responsável.
        </Secao>

        <Secao titulo="9. Seus direitos (art. 18 da LGPD)">
          Você (ou o responsável pelo menor) pode solicitar a qualquer momento: confirmação e <b>acesso</b> aos dados,
          <b> correção</b>, <b>eliminação</b>, <b>portabilidade</b> e informações sobre o tratamento. Basta pedir à
          coordenadora responsável.
        </Secao>

        <Secao titulo="10. Contato">
          Dúvidas ou solicitações sobre seus dados: procure a coordenadora da sua turma/paróquia.
        </Secao>

        <p className="text-xs text-stone-400 border-t border-stone-100 pt-4">
          Este documento é um modelo informativo e pode ser ajustado pela paróquia. Para uso comercial em larga escala,
          recomenda-se revisão por profissional jurídico especializado em proteção de dados.
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
