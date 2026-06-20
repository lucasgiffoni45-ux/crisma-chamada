import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export const metadata = {
  title: "Crisma Chamada — Chamada da catequese sem papel",
  description: "QR Code para o aluno, painel para o formador, relatórios para a coordenação. Teste grátis por 30 dias.",
};

export default function VendasPage() {
  return (
    <main className="text-stone-800">
      {/* HERO */}
      <section className="relative overflow-hidden bg-violet-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-400/15 ring-1 ring-amber-300/30 mb-5">
            <Cruz className="w-9 h-9 text-amber-300" />
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            Chamada da catequese, sem papel e sem dor de cabeça
          </h1>
          <p className="mt-4 text-lg text-violet-200/90 max-w-xl mx-auto">
            QR Code para o aluno, painel para o formador, relatórios para a coordenação. Pronto em minutos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/api/auth/signin" className="rounded-xl bg-amber-400 text-violet-950 px-6 py-3 font-semibold hover:bg-amber-300 transition shadow">
              Teste grátis por 30 dias
            </Link>
            <a href="mailto:lucas.giffoni45@gmail.com?subject=Quero%20conhecer%20o%20Crisma%20Chamada" className="rounded-xl ring-1 ring-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition">
              Falar com a gente
            </a>
          </div>
          <p className="mt-3 text-xs text-violet-300/80">Sem cartão de crédito · Dados protegidos (LGPD)</p>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" />
      </section>

      {/* BENEFÍCIOS */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl font-bold text-violet-900 text-center mb-8">Por que usar</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Beneficio emoji="📲" titulo="Presença em 1 toque">O aluno escaneia o QR ou o formador marca na lista. Sem papel, sem caderninho.</Beneficio>
          <Beneficio emoji="📊" titulo="Frequência automática">Veja faltas por turma e por aluno, e quem está sumindo — em gráficos simples.</Beneficio>
          <Beneficio emoji="🔒" titulo="Seguro e por papel">Cada formador vê só a sua turma; coordenação vê tudo da paróquia. Dados protegidos.</Beneficio>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white/60 border-y border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="font-display text-3xl font-bold text-violet-900 text-center mb-8">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Passo n="1" titulo="Cadastre a turma">A coordenadora cria as turmas e os formadores; o formador cadastra os alunos.</Passo>
            <Passo n="2" titulo="Abra o encontro">No sábado, o formador abre a chamada e o app gera um QR Code do dia.</Passo>
            <Passo n="3" titulo="Acompanhe">Os presentes aparecem na hora; a coordenação vê relatórios e exporta em CSV.</Passo>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl font-bold text-violet-900 text-center mb-2">Planos</h2>
        <p className="text-center text-stone-500 mb-8">Comece grátis. Assine quando quiser.</p>
        <div className="grid sm:grid-cols-3 gap-4 items-start">
          <Plano nome="Grátis" preco="R$ 0" detalhe="para começar" itens={["1 turma", "Presença por QR", "Até ~15 alunos"]} />
          <Plano nome="Paróquia" preco="R$ 39,90" detalhe="/mês" destaque itens={["Turmas e alunos ilimitados", "Todos os recursos", "Relatórios e gráficos", "Suporte por e-mail"]} />
          <Plano nome="Diocese" preco="Sob consulta" detalhe="várias paróquias" itens={["Tudo do Paróquia", "Várias organizações", "Atendimento dedicado"]} />
        </div>
        <p className="text-center text-xs text-stone-400 mt-4">Plano anual da Paróquia: R$ 399 (2 meses grátis).</p>
      </section>

      {/* FAQ */}
      <section className="bg-white/60 border-y border-stone-200">
        <div className="max-w-2xl mx-auto px-6 py-14">
          <h2 className="font-display text-3xl font-bold text-violet-900 text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-3">
            <Faq p="Precisa instalar algo?">Não. Funciona pelo navegador do celular ou computador. Dá para adicionar à tela inicial como um app.</Faq>
            <Faq p="O aluno precisa de e-mail?">Para marcar pelo QR, sim (login Google). Sem e-mail, o formador marca presença na lista normalmente.</Faq>
            <Faq p="É seguro com dados de menores?">Sim. Acesso por papel, conexão criptografada e Política de Privacidade conforme a LGPD.</Faq>
            <Faq p="Posso cancelar quando quiser?">Sim. Sem fidelidade. Seus dados não são apagados ao cancelar.</Faq>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-violet-900">Pronto para experimentar?</h2>
        <p className="mt-2 text-stone-500">Leva poucos minutos para começar. Teste grátis por 30 dias.</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/api/auth/signin" className="rounded-xl bg-violet-900 text-white px-6 py-3 font-semibold hover:bg-violet-950 transition shadow ring-1 ring-amber-300/20">
            Começar agora
          </Link>
          <a href="mailto:lucas.giffoni45@gmail.com?subject=Quero%20conhecer%20o%20Crisma%20Chamada" className="rounded-xl ring-1 ring-stone-300 px-6 py-3 font-semibold text-stone-700 hover:bg-stone-100 transition">
            Falar com a gente
          </a>
        </div>
        <div className="mt-8 flex gap-3 justify-center text-xs text-stone-400">
          <Link href="/privacidade" className="hover:text-stone-600">Privacidade</Link>
          <span>·</span>
          <Link href="/termos" className="hover:text-stone-600">Termos de Uso</Link>
          <span>·</span>
          <Link href="/" className="hover:text-stone-600">Entrar</Link>
        </div>
      </section>
    </main>
  );
}

function Beneficio({ emoji, titulo, children }: { emoji: string; titulo: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-display text-lg font-semibold text-violet-900">{titulo}</h3>
      <p className="text-sm text-stone-600 mt-1">{children}</p>
    </Card>
  );
}

function Passo({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-900 text-amber-300 font-bold mb-2">{n}</span>
      <h3 className="font-semibold text-violet-900">{titulo}</h3>
      <p className="text-sm text-stone-600 mt-1">{children}</p>
    </div>
  );
}

function Plano({ nome, preco, detalhe, itens, destaque }: { nome: string; preco: string; detalhe: string; itens: string[]; destaque?: boolean }) {
  return (
    <Card className={`p-5 ${destaque ? "ring-2 ring-amber-300" : ""}`}>
      {destaque && <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-600 mb-1">Mais escolhido</p>}
      <p className="font-display text-xl font-semibold text-violet-900">{nome}</p>
      <p className="text-3xl font-bold text-violet-900 mt-1">{preco}<span className="text-sm font-normal text-stone-400"> {detalhe}</span></p>
      <ul className="text-sm text-stone-600 mt-3 space-y-1">
        {itens.map((i) => <li key={i}>✓ {i}</li>)}
      </ul>
    </Card>
  );
}

function Faq({ p, children }: { p: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-semibold text-violet-900 text-sm">{p}</p>
      <p className="text-sm text-stone-600 mt-1">{children}</p>
    </Card>
  );
}
