"use client";

import { useState } from "react";

type Formador = { id: string; name: string | null; email: string | null; turmas: { turmaId: string }[] };
type Turma = { id: string; nome: string; formadores: { user: { id: string; name: string | null; email: string | null } }[]; _count: { crismandos: number } };
type Sabado = { id: string; data: string; temEncontro: boolean; recesso: boolean; horario: string | null; mensagem: string | null };
type Encontro = { id: string; data: string; turma: { nome: string }; tema: string | null; attendances: { crismando: { nome: string } }[] };

export default function CoordenadoraClient({ turmasIniciais, formadoresIniciais, sabadosIniciais, encontros, ano }: {
  turmasIniciais: Turma[]; formadoresIniciais: Formador[]; sabadosIniciais: Sabado[]; encontros: Encontro[]; ano: number;
}) {
  const [aba, setAba] = useState<"turmas" | "formadores" | "calendario" | "historico" | "log">("turmas");
  const [turmas, setTurmas] = useState(turmasIniciais);
  const [formadores, setFormadores] = useState(formadoresIniciais);
  const [sabados, setSabados] = useState(sabadosIniciais);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600" fill="currentColor" aria-hidden="true">
            <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z" />
          </svg>
          <h1 className="text-2xl font-bold text-violet-800">Painel da Coordenadora</h1>
        </div>
        <a href="/api/auth/signout" className="text-sm text-stone-400 hover:text-stone-600">Sair</a>
      </div>

      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {(["turmas", "formadores", "calendario", "historico", "log"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition ${aba === a ? "border-b-2 border-violet-600 text-violet-600" : "text-gray-500 hover:text-gray-700"}`}>
            {a === "turmas" ? "Turmas" : a === "formadores" ? "Formadores" : a === "calendario" ? "Calendário" : a === "historico" ? "Histórico" : "Registro"}
          </button>
        ))}
      </div>

      {aba === "turmas" && <AbaTurmas turmas={turmas} setTurmas={setTurmas} />}
      {aba === "formadores" && <AbaFormadores formadores={formadores} setFormadores={setFormadores} turmas={turmas} />}
      {aba === "calendario" && <AbaCalendario sabados={sabados} setSabados={setSabados} ano={ano} />}
      {aba === "historico" && <AbaHistorico encontros={encontros} />}
      {aba === "log" && <AbaLog />}
    </div>
  );
}

function AbaTurmas({ turmas, setTurmas }: { turmas: Turma[]; setTurmas: (t: Turma[]) => void }) {
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
        <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome da turma (ex: Turma A)" className="border rounded-lg px-3 py-2 text-sm flex-1" />
        <button className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white text-sm hover:bg-violet-700">Criar</button>
      </form>
      <div className="bg-white rounded-xl shadow divide-y">
        {turmas.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhuma turma.</p>}
        {turmas.map((t) => (
          <div key={t.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t.nome}</p>
              <p className="text-xs text-gray-400">
                {t._count.crismandos} aluno(s) · {t.formadores.map((f) => f.user.name ?? f.user.email).join(", ") || "sem formador"}
              </p>
            </div>
            <button onClick={() => remover(t.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbaFormadores({ formadores, setFormadores, turmas }: { formadores: Formador[]; setFormadores: (f: Formador[]) => void; turmas: Turma[] }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

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

  async function alternarTurma(formadorId: string, turmaId: string, atribuir: boolean) {
    await fetch(`/api/formadores/${formadorId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turmaId, atribuir }) });
    setFormadores(formadores.map((f) => f.id === formadorId
      ? { ...f, turmas: atribuir ? [...f.turmas, { turmaId }] : f.turmas.filter((t) => t.turmaId !== turmaId) }
      : f));
  }

  async function remover(id: string) {
    if (!confirm("Remover este formador?")) return;
    await fetch(`/api/formadores/${id}`, { method: "DELETE" });
    setFormadores(formadores.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={cadastrar} className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold text-gray-700 text-sm">Novo formador</h2>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="border rounded-lg px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="E-mail (conta Google)" className="border rounded-lg px-3 py-2 text-sm" />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white text-sm hover:bg-violet-700">Cadastrar</button>
      </form>
      <div className="bg-white rounded-xl shadow divide-y">
        {formadores.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhum formador.</p>}
        {formadores.map((f) => (
          <div key={f.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-sm">{f.name ?? "(sem nome)"}</p>
                <p className="text-xs text-gray-400">{f.email}</p>
              </div>
              <button onClick={() => remover(f.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {turmas.map((t) => {
                const atribuido = f.turmas.some((x) => x.turmaId === t.id);
                return (
                  <button key={t.id} onClick={() => alternarTurma(f.id, t.id, !atribuido)}
                    className={`text-xs px-2 py-1 rounded-full border ${atribuido ? "bg-violet-600 text-white border-violet-600" : "text-gray-500 border-gray-300"}`}>
                    {t.nome}
                  </button>
                );
              })}
              {turmas.length === 0 && <span className="text-xs text-gray-400">Crie turmas primeiro.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 mb-3">Calendário de {ano} ainda não gerado.</p>
          <button onClick={gerar} disabled={gerando} className="rounded-lg bg-violet-600 px-6 py-2 font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {gerando ? "Gerando..." : `Gerar sábados de ${ano}`}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y">
          {sabados.map((s) => (
            <div key={s.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{new Date(s.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" })}</span>
                <div className="flex gap-1">
                  <button onClick={() => atualizar(s, { temEncontro: true, recesso: false })}
                    className={`text-xs px-2 py-1 rounded ${s.temEncontro && !s.recesso ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>Encontro</button>
                  <button onClick={() => atualizar(s, { temEncontro: false, recesso: true })}
                    className={`text-xs px-2 py-1 rounded ${s.recesso ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>Recesso</button>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="time" defaultValue={s.horario ?? ""} onBlur={(e) => atualizar(s, { horario: e.target.value })}
                  className="border rounded px-2 py-1 text-xs w-28" />
                <input maxLength={50} defaultValue={s.mensagem ?? ""} placeholder="Recado (máx. 50)" onBlur={(e) => atualizar(s, { mensagem: e.target.value })}
                  className="border rounded px-2 py-1 text-xs flex-1" />
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
      <div className="text-center">
        <a href="/api/relatorio" download className="text-sm text-violet-500 hover:underline">⬇ Exportar todas as presenças (CSV)</a>
      </div>
      {encontros.length === 0 && <p className="text-sm text-gray-400 text-center">Nenhum encontro realizado ainda.</p>}
      {encontros.map((e) => (
        <div key={e.id} className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold text-sm text-gray-700">{e.turma.nome} — {new Date(e.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
          {e.tema && <p className="text-xs text-gray-500">Tema: {e.tema}</p>}
          <p className="text-xs text-gray-400 mb-1">{e.attendances.length} presença(s)</p>
          <p className="text-xs text-gray-600">{e.attendances.map((a) => a.crismando.nome).join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

function AbaLog() {
  const [logs, setLogs] = useState<any[] | null>(null);
  if (logs === null) {
    fetch("/api/log").then((r) => r.json()).then(setLogs).catch(() => setLogs([]));
    return <p className="text-sm text-gray-400 text-center">Carregando...</p>;
  }
  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {logs.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhuma movimentação registrada.</p>}
      {logs.map((l) => (
        <div key={l.id} className="px-4 py-2 text-xs flex justify-between gap-2">
          <span className="text-gray-700"><b>{l.autor}</b> {l.acao}{l.alvo ? ` — ${l.alvo}` : ""}</span>
          <span className="text-gray-400 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString("pt-BR")} {new Date(l.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      ))}
    </div>
  );
}
