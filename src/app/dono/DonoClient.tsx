"use client";

import { useState } from "react";
import { BarChart } from "@/components/Charts";
import { PageHeader, SairLink, SectionTitle, StatCard, Card, Botao, LogTimeline, EmptyState, Avatar } from "@/components/ui";

type Coord = { id: string; name: string | null; email: string | null };
type Turma = {
  id: string;
  nome: string;
  _count: { crismandos: number; encontros: number };
  formadores: { user: { name: string | null; email: string | null } }[];
};
type Estat = { id: string; nome: string; alunos: number; encontros: number; presencas: number; faltas: number; frequencia: number };
type Stats = { totalTurmas: number; totalFormadores: number; totalAlunos: number; totalEncontros: number; totalPresencas: number };

export default function DonoClient({
  coordenadorasIniciais,
  stats,
  turmas,
  estatisticas,
  nome,
}: {
  coordenadorasIniciais: Coord[];
  stats: Stats;
  turmas: Turma[];
  estatisticas: Estat[];
  nome: string;
}) {
  const [aba, setAba] = useState<"visao" | "coordenadoras" | "registro">("visao");

  const rotulo = (a: typeof aba) => (a === "visao" ? "Visão geral" : a === "coordenadoras" ? "Coordenadoras" : "Registro");
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <PageHeader titulo="Painel do Dono" selo="Dono" subtitulo={`Olá, ${nome}. Acesso total à plataforma.`} right={<SairLink />} />

      <div className="flex gap-1 mb-6 border-b border-stone-200 overflow-x-auto">
        {(["visao", "coordenadoras", "registro"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition -mb-px border-b-2 ${aba === a ? "border-amber-400 text-violet-900" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {rotulo(a)}
          </button>
        ))}
      </div>

      {aba === "visao" && <AbaVisao stats={stats} turmas={turmas} estatisticas={estatisticas} />}
      {aba === "coordenadoras" && <AbaCoordenadoras inicial={coordenadorasIniciais} />}
      {aba === "registro" && <LogTimeline />}
    </div>
  );
}

function AbaVisao({ stats, turmas, estatisticas }: { stats: Stats; turmas: Turma[]; estatisticas: Estat[] }) {
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
        {cards.map((c) => <StatCard key={c.rotulo} valor={c.valor} rotulo={c.rotulo} />)}
      </div>

      {estatisticas.length > 0 && (
        <div className="space-y-4">
          <BarChart titulo="Alunos por turma" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.alunos }))} />
          <BarChart titulo="Faltas por turma" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.faltas }))} cor="bg-rose-400" />
          <BarChart titulo="Frequência por turma (%)" dados={estatisticas.map((e) => ({ label: e.nome, valor: e.frequencia }))} sufixo="%" maxFixo={100} cor="bg-emerald-500" />
        </div>
      )}

      <div>
        <SectionTitle>Turmas</SectionTitle>
        <Card className="divide-y divide-stone-100">
          {turmas.length === 0 && <EmptyState icon="🎓" titulo="Nenhuma turma criada ainda" />}
          {turmas.map((t) => (
            <div key={t.id} className="px-4 py-3">
              <p className="font-medium text-sm text-stone-800">{t.nome}</p>
              <p className="text-xs text-stone-400">
                {t._count.crismandos} aluno(s) · {t._count.encontros} encontro(s) ·{" "}
                {t.formadores.map((f) => f.user.name ?? f.user.email).join(", ") || "sem formador"}
              </p>
            </div>
          ))}
        </Card>
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
      <Card className="p-4">
        <form onSubmit={adicionar} className="flex flex-col gap-3">
          <SectionTitle>Nova coordenadora</SectionTitle>
          <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <input type="email" placeholder="E-mail (conta Google)" value={email} required onChange={(e) => setEmail(e.target.value)}
            className="border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          {erro && <p className="text-rose-500 text-sm">{erro}</p>}
          <Botao type="submit">Cadastrar</Botao>
        </form>
      </Card>

      <Card className="divide-y divide-stone-100">
        {coords.length === 0 && <EmptyState icon="⭐" titulo="Nenhuma coordenadora ainda" />}
        {coords.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar nome={c.name ?? c.email ?? "?"} />
              <div>
                <p className="font-medium text-sm text-stone-800">{c.name ?? "(sem nome)"}</p>
                <p className="text-xs text-stone-400">{c.email}</p>
              </div>
            </div>
            <button onClick={() => remover(c.id)} className="text-xs text-rose-400 hover:text-rose-600">Remover</button>
          </div>
        ))}
      </Card>
    </div>
  );
}
