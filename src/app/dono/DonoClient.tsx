"use client";

import { useState } from "react";

type Coord = { id: string; name: string | null; email: string | null };
type Turma = {
  id: string;
  nome: string;
  _count: { crismandos: number; encontros: number };
  formadores: { user: { name: string | null; email: string | null } }[];
};
type Stats = { totalTurmas: number; totalFormadores: number; totalAlunos: number; totalEncontros: number; totalPresencas: number };

export default function DonoClient({
  coordenadorasIniciais,
  stats,
  turmas,
  nome,
}: {
  coordenadorasIniciais: Coord[];
  stats: Stats;
  turmas: Turma[];
  nome: string;
}) {
  const [aba, setAba] = useState<"visao" | "coordenadoras" | "registro">("visao");

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600" fill="currentColor" aria-hidden="true">
            <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z" />
          </svg>
          <h1 className="text-2xl font-bold text-violet-800">Painel do Dono</h1>
        </div>
        <a href="/api/auth/signout" className="text-sm text-stone-400 hover:text-stone-600">Sair</a>
      </div>
      <p className="text-sm text-stone-400 mb-6">Olá, {nome}. Você tem acesso total à plataforma.</p>

      <div className="flex gap-1 mb-6 border-b">
        {(["visao", "coordenadoras", "registro"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium transition ${aba === a ? "border-b-2 border-violet-700 text-violet-800" : "text-stone-500 hover:text-stone-700"}`}>
            {a === "visao" ? "Visão geral" : a === "coordenadoras" ? "Coordenadoras" : "Registro"}
          </button>
        ))}
      </div>

      {aba === "visao" && <AbaVisao stats={stats} turmas={turmas} />}
      {aba === "coordenadoras" && <AbaCoordenadoras inicial={coordenadorasIniciais} />}
      {aba === "registro" && <AbaRegistro />}
    </div>
  );
}

function AbaVisao({ stats, turmas }: { stats: Stats; turmas: Turma[] }) {
  const cards = [
    { rotulo: "Turmas", valor: stats.totalTurmas },
    { rotulo: "Formadores", valor: stats.totalFormadores },
    { rotulo: "Alunos", valor: stats.totalAlunos },
    { rotulo: "Encontros", valor: stats.totalEncontros },
    { rotulo: "Presenças", valor: stats.totalPresencas },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.rotulo} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-violet-800">{c.valor}</p>
            <p className="text-xs text-stone-500 mt-1">{c.rotulo}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-600 mb-2">Turmas</h2>
        <div className="bg-white rounded-xl shadow divide-y">
          {turmas.length === 0 && <p className="p-4 text-sm text-stone-400 text-center">Nenhuma turma criada ainda.</p>}
          {turmas.map((t) => (
            <div key={t.id} className="px-4 py-3">
              <p className="font-medium text-sm">{t.nome}</p>
              <p className="text-xs text-stone-400">
                {t._count.crismandos} aluno(s) · {t._count.encontros} encontro(s) ·{" "}
                {t.formadores.map((f) => f.user.name ?? f.user.email).join(", ") || "sem formador"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AbaCoordenadoras({ inicial }: { inicial: Coord[] }) {
  const [coords, setCoords] = useState(inicial);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/coordenadoras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email }),
    });
    const data = await res.json();
    if (res.ok) {
      setCoords((p) => [...p, data].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));
      setNome("");
      setEmail("");
    } else {
      setErro(data.error ?? "Erro ao cadastrar");
    }
  }

  async function remover(id: string) {
    if (!confirm("Remover esta coordenadora?")) return;
    await fetch("/api/coordenadoras", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCoords((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={adicionar} className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold text-stone-700">Nova coordenadora</h2>
        <input
          type="text" placeholder="Nome" value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <input
          type="email" placeholder="E-mail (conta Google)" value={email} required
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button type="submit" className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white hover:bg-violet-800 transition">
          Cadastrar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow divide-y">
        {coords.length === 0 && <p className="p-4 text-sm text-stone-400 text-center">Nenhuma coordenadora ainda.</p>}
        {coords.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-sm">{c.name ?? "(sem nome)"}</p>
              <p className="text-xs text-stone-400">{c.email}</p>
            </div>
            <button onClick={() => remover(c.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbaRegistro() {
  const [logs, setLogs] = useState<any[] | null>(null);
  if (logs === null) {
    fetch("/api/log").then((r) => r.json()).then(setLogs).catch(() => setLogs([]));
    return <p className="text-sm text-stone-400 text-center">Carregando...</p>;
  }
  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {logs.length === 0 && <p className="p-4 text-sm text-stone-400 text-center">Nenhuma movimentação registrada.</p>}
      {logs.map((l) => (
        <div key={l.id} className="px-4 py-2 text-xs flex justify-between gap-2">
          <span className="text-stone-700"><b>{l.autor}</b> {l.acao}{l.alvo ? ` — ${l.alvo}` : ""}</span>
          <span className="text-stone-400 whitespace-nowrap">
            {new Date(l.createdAt).toLocaleDateString("pt-BR")} {new Date(l.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ))}
    </div>
  );
}
