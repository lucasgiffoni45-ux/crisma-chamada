# Arquitetura multi-segmento (catequese → escola, música, artes marciais…)

O app é, no fundo, um **motor de presença genérico**. A ideia é o MESMO sistema
atender vários nichos só trocando o **vocabulário** (e alguns campos opcionais),
sem reescrever a lógica.

## O que já é genérico (não precisa mexer)
- Multi-tenant: cada cliente é uma `Organizacao` isolada.
- Papéis: Dono → Coordenadora → Formador → Aluno.
- Presença (QR + manual), turmas, encontros, gráficos, relatórios, calendário.
- Assinatura/cobrança (trial, Asaas) e LGPD.

## O que muda por nicho: só o VOCABULÁRIO
Cada organização tem um campo **`segmento`** (`Organizacao.segmento`). Os rótulos
de cada segmento ficam em **`src/lib/segmentos.ts`**:

| Conceito interno | catequese | escola | música | artes marciais |
|---|---|---|---|---|
| encontro | encontro | aula | aula | treino |
| formador | formador | professor | professor | instrutor |
| coordenador | coordenadora | coordenação | coordenação | coordenação |
| campo extra | sacramentos ✓ | — | — | — |

O Dono define o segmento de cada organização no **Painel do Dono → Assinaturas**.

## Como EVOLUIR (incremental e barato)
1. **Novo nicho:** adicione uma entrada em `SEGMENTOS` (e em `SEGMENTOS_LISTA`) no
   `src/lib/segmentos.ts`. Pronto — o nicho existe.
2. **Aplicar os rótulos na tela:** onde hoje há texto fixo ("aluno", "turma",
   "encontro", "formador"), troque por `rotulos.aluno`, `rotulos.encontro`, etc.,
   passando `rotulosDe(org.segmento)` do server para o client. Pode ser feito
   tela por tela, sem parar o app.
3. **Campos específicos:** use `rotulos.mostrarSacramentos` para esconder o campo
   de sacramentos fora da catequese. O mesmo padrão serve para campos futuros
   (ex.: "faixa/graduação" nas artes marciais).

## Cobrança por aluno (ideia do Lucas)
Hoje o plano é por organização. Para cobrar **por quantidade de aluno** (bom para
escolas), o caminho é: contar `crismandos` da organização e aplicar uma tabela de
faixas (ex.: até 50 alunos R$ X, até 100 R$ Y). O `assinatura.ts` já centraliza a
lógica — dá para acrescentar isso sem mexer no resto.

## Resumo
- Motor: pronto e genérico.
- Vocabulário: centralizado em `segmentos.ts` (fácil de estender).
- Próximo passo (quando quiser): aplicar os rótulos nas telas, tela por tela.
