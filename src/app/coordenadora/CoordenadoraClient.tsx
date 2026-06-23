"use client";

import { useState } from "react";
import { BarChart, DonutTaxa } from "@/components/Charts";
import { PageHeader, SairLink, SectionTitle, Card, Botao, Badge, Avatar, EmptyState, LogTimeline, Rodape } from "@/components/ui";

type Formador = { id: string; name: string | null; email: string | null; turmas: { turmaId: string }[] };
type Turma = {
  id: string;
  nome: string;
  formadores: { user: { id: string; name: string | null; email: string | null } }[];
  _count: { crismandos: number };
};
type Sabado = { id: string; data: string; temEncontro: boolean; recesso: boolean; horario: string | null; mensagem: string | null };
type Encontro = { id: string; data: string; turma: { nome: string }; tema: string | null; attendances: { crismando: { nome: string } }[] };
type Estat = { id: string; nome: string; alunos: number; encontros: number; presencas: number; faltas: number; frequencia: number };
type AlunoDetalhe = {
  id: string; nome: string; email: string | null; contato: string | null; idade: number | null;
  dataNascimento: string | null; sacramentos: string | null; alergias: string | null; necessidades: string | null;
  nomePai: string | null; nomeMae: string | null; endereco: string | null; estadoCivil: string | null; serieEscolar: string | null; telefone: string | null;
  turma: { nome: string };
};

type Assinatura = { ativa: boolean; status: string; diasRestantes: number | null; mensagem: string } | null;

export default function CoordenadoraClient({ turmasIniciais, formadoresIniciais, sabadosIniciais, encontros, estatisticas, alunos, assinatura, ano }: {
  turmasIniciais: Turma[]; formadoresIniciais: Formador[]; sabadosIniciais: Sabado[]; encontros: Encontro[]; estatisticas: Estat[]; alunos: AlunoDetalhe[]; assinatura: Assinatura; ano: number;
}) {
  const [aba, setAba] = useState<"geral" | "turmas" | "formadores" | "alunos" | "calendario" | "historico" | "log">("geral");
  const [turmas, setTurmas] = useState(turmasIniciais);
  const [formadores, setFormadores] = useState(formadoresIniciais);
  const [sabados, setSabados] = useState(sabadosIniciais);

  // Atribui/desatribui um formador a uma turma, atualizando os dois estados.
  async function atribuir(formadorId: string, turmaId: string, marcar: boolean) {
    await fetch(`/api/formadores/${formadorId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turmaId, atribuir: marcar }),
    });
    setFormadores((prev) => prev.map((f) => f.id === formadorId
      ? { ...f, turmas: marcar ? [...f.turmas, { turmaId }] : f.turmas.filter((t) => t.turmaId !== turmaId) }
      : f));
    setTurmas((prev) => prev.map((t) => {
      if (t.id !== turmaId) return t;
      if (marcar) {
        const f = formadores.find((x) => x.id === formadorId);
        return { ...t, formadores: [...t.formadores, { user: { id: formadorId, name: f?.name ?? null, email: f?.email ?? null } }] };
      }
      return { ...t, formadores: t.formadores.filter((ft) => ft.user.id !== formadorId) };
    }));
  }

  const rotulo = (a: typeof aba) => (a === "geral" ? "Visão geral" : a === "turmas" ? "Turmas" : a === "formadores" ? "Formadores" : a === "alunos" ? "Alunos" : a === "calendario" ? "Calendário" : a === "historico" ? "Histórico" : "Registro");
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <PageHeader titulo="Painel da Coordenadora" selo="Coordenadora" right={<SairLink />} />

      {assinatura && (!assinatura.ativa || (assinatura.diasRestantes != null && assinatura.diasRestantes <= 7)) && (
        <a href="/assinatura" className={`mb-4 flex items-center justify-between gap-2 rounded-2xl px-4 py-3 ring-1 ${assinatura.ativa ? "bg-amber-50 ring-amber-200 text-amber-900" : "bg-rose-50 ring-rose-200 text-rose-900"}`}>
          <span className="text-sm font-medium">{assinatura.ativa ? "⏳ " : "🔒 "}{assinatura.mensagem}{!assinatura.ativa ? " As alterações estão bloqueadas." : ""}</span>
          <span className="text-xs font-semibold underline whitespace-nowrap">Ver planos →</span>
        </a>
      )}

      <div className="flex gap-1 mb-6 border-b border-stone-200 overflow-x-auto">
        {(["geral", "turmas", "formadores", "alunos", "calendario", "historico", "log"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition -mb-px border-b-2 ${aba === a ? "border-amber-400 text-violet-900" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {rotulo(a)}
          </button>
        ))}
      </div>

      {aba === "geral" && <AbaGeral estatisticas={estatisticas} />}
      {aba === "turmas" && <AbaTurmas turmas={turmas} setTurmas={setTurmas} formadores={formadores} atribuir={atribuir} />}
      {aba === "formadores" && <AbaFormadores formadores={formadores} setFormadores={setFormadores} turmas={turmas} />}
      {aba === "alunos" && <AbaAlunos alunos={alunos} />}
      {aba === "calendario" && <AbaCalendario sabados={sabados} setSabados={setSabados} ano={ano} />}
      {aba === "historico" && <AbaHistorico encontros={encontros} />}
      {aba === "log" && <LogTimeline />}
      <Rodape />
    </div>
  );
}

function AbaGeral({ estatisticas }: { estatisticas: Estat[] }) {
  const totAlunos = estatisticas.reduce((s, e) => s + e.alunos, 0);
  const totPresencas = estatisticas.reduce((s, e) => s + e.presencas, 0);
  const totFaltas = estatisticas.reduce((s, e) => s + e.faltas, 0);
  const freqGeral = totPresencas + totFaltas > 0 ? (totPresencas / (totPresencas + totFaltas)) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DonutTaxa titulo="Frequência geral" percentual={freqGeral} />
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-4 flex flex-col justify-center gap-2">
          <Linha rotulo="Alunos" valor={totAlunos} />
          <Linha rotulo="Presenças" valor={totPresencas} />
          <Linha rotulo="Faltas" valor={totFaltas} />
        </div>
      </div>
      <BarChart titulo="Alunos por turma" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.alunos }))} />
      <BarChart titulo="Faltas por turma" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.faltas }))} cor="bg-red-400" />
      <BarChart titulo="Frequência por turma (%)" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.frequencia }))} sufixo="%" maxFixo={100} cor="bg-green-500" />
      <p className="text-xs text-stone-400 text-center">Faltas estimadas = (alunos × encontros) − presenças registradas.</p>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500">{rotulo}</span>
      <span className="text-xl font-bold text-violet-800">{valor}</span>
    </div>
  );
}

function AbaTurmas({ turmas, setTurmas, formadores, atribuir }: {
  turmas: Turma[]; setTurmas: (t: Turma[]) => void; formadores: Formador[]; atribuir: (fId: string, tId: string, m: boolean) => void;
}) {
  const [nome, setNome] = useState("");

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/turmas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) });
    if (res.ok) {
      const t = await res.json();
      setTurmas([...turmas, { ...t, formadores: [], _count: { crismandos: 0 } }].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNome("");
    }
  }
  async function remover(id: string) {
    if (!confirm("Remover esta turma e todos os seus dados?")) return;
    await fetch("/api/turmas", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTurmas(turmas.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={criar} className="flex gap-2 bg-white p-4 rounded-xl shadow">
        <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome da turma (ex: Turma A)" className="border border-stone-300 rounded-xl px-3 py-2 text-sm flex-1" />
        <button className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white text-sm hover:bg-violet-800">Criar</button>
      </form>
      {turmas.length === 0 && <p className="p-4 text-sm text-stone-400 text-center bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70">Nenhuma turma.</p>}
      {turmas.map((t) => {
        const naoAtribuidos = formadores.filter((f) => !f.turmas.some((x) => x.turmaId === t.id));
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{t.nome}</p>
                <p className="text-xs text-stone-400">{t._count.crismandos} aluno(s)</p>
              </div>
              <button onClick={() => remover(t.id)} className="text-xs text-red-400 hover:text-red-600">Remover turma</button>
            </div>

            <div>
              <p className="text-xs font-semibold text-stone-500 mb-1">Formadores desta turma</p>
              {t.formadores.length === 0 && <p className="text-xs text-stone-400">Nenhum formador atribuído.</p>}
              <div className="flex flex-wrap gap-2">
                {t.formadores.map((f) => (
                  <span key={f.user.id} className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-800 border border-violet-200 rounded-full pl-3 pr-1 py-1">
                    {f.user.name ?? f.user.email}
                    <button onClick={() => atribuir(f.user.id, t.id, false)} className="w-4 h-4 rounded-full hover:bg-violet-200 text-violet-500" title="Remover da turma">✕</button>
                  </span>
                ))}
              </div>
            </div>

            {naoAtribuidos.length > 0 && (
              <select defaultValue="" onChange={(e) => { if (e.target.value) { atribuir(e.target.value, t.id, true); e.target.value = ""; } }}
                className="border border-stone-300 rounded-xl px-3 py-2 text-sm w-full text-stone-600">
                <option value="">+ Adicionar formador à turma…</option>
                {naoAtribuidos.map((f) => <option key={f.id} value={f.id}>{f.name ?? f.email}</option>)}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AbaFormadores({ formadores, setFormadores, turmas }: { formadores: Formador[]; setFormadores: (f: Formador[]) => void; turmas: Turma[] }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  const nomeTurma = (id: string) => turmas.find((t) => t.id === id)?.nome ?? "?";

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/formadores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email }) });
    const data = await res.json();
    if (res.ok) {
      setFormadores([...formadores, { id: data.id, name: data.name, email: data.email, turmas: [] }]);
      setNome(""); setEmail("");
    } else setErro(data.error ?? "Erro");
  }

  async function remover(id: string) {
    if (!confirm("Remover este formador?")) return;
    await fetch(`/api/formadores/${id}`, { method: "DELETE" });
    setFormadores(formadores.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={cadastrar} className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold text-stone-700 text-sm">Novo formador</h2>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="E-mail (conta Google)" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white text-sm hover:bg-violet-800">Cadastrar</button>
      </form>
      <p className="text-xs text-stone-400 px-1">A atribuição às turmas é feita na aba <b>Turmas</b>.</p>
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 divide-y">
        {formadores.length === 0 && <p className="p-4 text-sm text-stone-400 text-center">Nenhum formador.</p>}
        {formadores.map((f) => (
          <div key={f.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{f.name ?? "(sem nome)"}</p>
              <p className="text-xs text-stone-400">{f.email}</p>
              <p className="text-xs text-violet-700 mt-0.5">
                {f.turmas.length ? f.turmas.map((t) => nomeTurma(t.turmaId)).join(", ") : "sem turma"}
              </p>
            </div>
            <button onClick={() => remover(f.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbaAlunos({ alunos }: { alunos: AlunoDetalhe[] }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const filtrados = alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()));
  // Agrupa por turma.
  const porTurma = filtrados.reduce<Record<string, AlunoDetalhe[]>>((acc, a) => {
    (acc[a.turma.nome] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno pelo nome…" className="border border-stone-300 rounded-xl px-3 py-2 text-sm w-full bg-white" />
      <p className="text-xs text-stone-400">{filtrados.length} aluno(s). Toque num nome para ver todos os dados.</p>
      {Object.keys(porTurma).length === 0 && <Card><EmptyState icon="👤" titulo="Nenhum aluno encontrado" /></Card>}
      {Object.entries(porTurma).map(([turma, lista]) => (
        <div key={turma}>
          <SectionTitle>{turma} <span className="text-stone-400 font-normal text-base">· {lista.length}</span></SectionTitle>
          <Card className="divide-y divide-stone-100">
            {lista.map((a) => (
              <div key={a.id} className="px-4 py-2.5">
                <button onClick={() => setAberto(aberto === a.id ? null : a.id)} className="w-full flex items-center gap-3 text-left">
                  <Avatar nome={a.nome} size={34} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{a.nome}{a.idade ? <span className="text-stone-400 font-normal">, {a.idade}</span> : ""}</p>
                    {!a.email && <Badge tom="amber">sem e-mail</Badge>}
                  </div>
                  <span className="text-xs text-stone-400">{aberto === a.id ? "▲" : "▼"}</span>
                </button>
                {aberto === a.id && (
                  <div className="mt-3 ml-1 pl-3 border-l-2 border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600">
                    <Campo r="E-mail" v={a.email} />
                    <Campo r="WhatsApp" v={a.contato} />
                    <Campo r="Telefone" v={a.telefone} />
                    <Campo r="Nascimento" v={a.dataNascimento} />
                    <Campo r="Sacramentos" v={a.sacramentos} />
                    <Campo r="Alergias" v={a.alergias} />
                    <Campo r="Necessidades" v={a.necessidades} />
                    <Campo r="Estado civil" v={a.estadoCivil} />
                    <Campo r="Série escolar" v={a.serieEscolar} />
                    <Campo r="Nome do pai" v={a.nomePai} />
                    <Campo r="Nome da mãe" v={a.nomeMae} />
                    <Campo r="Endereço" v={a.endereco} />
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

function Campo({ r, v }: { r: string; v: string | null }) {
  if (!v) return null;
  return <p><span className="text-stone-400">{r}:</span> <span className="text-stone-700">{v}</span></p>;
}

function AbaCalendario({ sabados, setSabados, ano }: { sabados: Sabado[]; setSabados: (s: Sabado[]) => void; ano: number }) {
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    await fetch("/api/calendario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ano }) });
    const res = await fetch(`/api/calendario?ano=${ano}`);
    setSabados(await res.json());
    setGerando(false);
  }

  async function atualizar(s: Sabado, patch: Partial<Sabado>) {
    const novo = { ...s, ...patch };
    setSabados(sabados.map((x) => (x.id === s.id ? novo : x)));
    await fetch("/api/calendario", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, ...patch }) });
  }

  return (
    <div className="space-y-4">
      {sabados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-6 text-center">
          <p className="text-stone-500 mb-3">Calendário de {ano} ainda não gerado.</p>
          <button onClick={gerar} disabled={gerando} className="rounded-lg bg-violet-700 px-6 py-2 font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
            {gerando ? "Gerando..." : `Gerar sábados de ${ano}`}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 divide-y">
          {sabados.map((s) => (
            <div key={s.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{new Date(s.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" })}</span>
                <div className="flex gap-1">
                  <button onClick={() => atualizar(s, { temEncontro: true, recesso: false })}
                    className={`text-xs px-2 py-1 rounded ${s.temEncontro && !s.recesso ? "bg-green-600 text-white" : "bg-stone-100 text-stone-500"}`}>Encontro</button>
                  <button onClick={() => atualizar(s, { temEncontro: false, recesso: true })}
                    className={`text-xs px-2 py-1 rounded ${s.recesso ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-500"}`}>Recesso</button>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="time" defaultValue={s.horario ?? ""} onBlur={(e) => atualizar(s, { horario: e.target.value })}
                  className="border border-stone-300 rounded-lg px-2 py-1 text-xs w-28" />
                <input maxLength={50} defaultValue={s.mensagem ?? ""} placeholder="Recado (máx. 50)" onBlur={(e) => atualizar(s, { mensagem: e.target.value })}
                  className="border border-stone-300 rounded-lg px-2 py-1 text-xs flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AbaHistorico({ encontros }: { encontros: Encontro[] }) {
  return (
    <div className="space-y-4">
      <SectionTitle acao={<a href="/api/relatorio" download className="text-xs text-violet-600 hover:underline">⬇ CSV completo</a>}>Histórico de encontros</SectionTitle>
      {encontros.length === 0 && <Card><EmptyState icon="📅" titulo="Nenhum encontro realizado ainda" /></Card>}
      {encontros.map((e) => (
        <Card key={e.id} className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-violet-900">{e.turma.nome}</p>
            <Badge tom="violet">{new Date(e.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</Badge>
          </div>
          {e.tema && <p className="text-xs text-stone-500 mt-0.5">Tema: {e.tema}</p>}
          <p className="text-xs text-stone-400 mt-1 mb-2">{e.attendances.length} presença(s)</p>
          <div className="flex flex-wrap gap-1">
            {e.attendances.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full pl-1 pr-2 py-0.5">
                <Avatar nome={a.crismando.nome} size={18} /> {a.crismando.nome.split(" ")[0]}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
