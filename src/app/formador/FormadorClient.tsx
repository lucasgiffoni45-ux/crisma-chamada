"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

type Aluno = { id: string; nome: string; email: string; contato: string | null; idade: number | null };
type Encontro = { id: string; token: string; data: string | Date; horario: string | null; tema: string | null; licaoDeCasa: string | null };
type Turma = { id: string; nome: string; crismandos: Aluno[]; encontroAtivo: Encontro | null };
type Sabado = { id: string; data: string; temEncontro: boolean; recesso: boolean; horario: string | null; mensagem: string | null };

export default function FormadorClient({ turmasIniciais, sabados, nome }: {
  turmasIniciais: Turma[]; sabados: Sabado[]; nome: string;
}) {
  const [turmas, setTurmas] = useState(turmasIniciais);
  const [turmaSelId, setTurmaSelId] = useState(turmasIniciais[0]?.id ?? "");
  const [aba, setAba] = useState<"chamada" | "alunos" | "calendario">("chamada");

  const turma = turmas.find((t) => t.id === turmaSelId);

  function atualizarTurma(id: string, patch: Partial<Turma>) {
    setTurmas((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  if (!turma) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-violet-700 mb-2">Painel do Formador</h1>
        <p className="text-gray-500">Você ainda não foi atribuído a nenhuma turma. Fale com a coordenadora.</p>
        <a href="/api/auth/signout" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600">Sair</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 text-xl">✝</span>
          <h1 className="text-2xl font-bold text-violet-800">Painel do Formador</h1>
        </div>
        <a href="/api/auth/signout" className="text-sm text-stone-400 hover:text-stone-600">Sair</a>
      </div>
      <p className="text-sm text-stone-400 mb-4">Olá, {nome}.</p>

      {/* Seletor de turma (se houver mais de uma) */}
      {turmas.length > 1 && (
        <select
          value={turmaSelId}
          onChange={(e) => setTurmaSelId(e.target.value)}
          className="mb-4 border rounded-lg px-3 py-2 text-sm w-full"
        >
          {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      )}
      {turmas.length === 1 && <p className="mb-4 font-semibold text-gray-700">{turma.nome}</p>}

      <div className="flex gap-1 mb-6 border-b">
        {(["chamada", "alunos", "calendario"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium transition ${aba === a ? "border-b-2 border-violet-600 text-violet-600" : "text-gray-500 hover:text-gray-700"}`}>
            {a === "chamada" ? "Chamada" : a === "alunos" ? "Alunos" : "Calendário"}
          </button>
        ))}
      </div>

      {aba === "chamada" && <AbaChamada turma={turma} onChange={(p) => atualizarTurma(turma.id, p)} />}
      {aba === "alunos" && <AbaAlunos turma={turma} onChange={(p) => atualizarTurma(turma.id, p)} />}
      {aba === "calendario" && <AbaCalendario sabados={sabados} />}
    </div>
  );
}

// ---------- Aba Chamada ----------
function AbaChamada({ turma, onChange }: { turma: Turma; onChange: (p: Partial<Turma>) => void }) {
  const encontro = turma.encontroAtivo;
  const [data, setData] = useState(proximoSabadoISO());
  const [horario, setHorario] = useState("");
  const [presentes, setPresentes] = useState<{ id: string; nome: string; marcadaEm: string }[]>([]);
  const [tema, setTema] = useState(encontro?.tema ?? "");
  const [licao, setLicao] = useState(encontro?.licaoDeCasa ?? "");
  const [anotacoes, setAnotacoes] = useState<Record<string, string>>({});

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const presencaUrl = encontro ? `${appUrl}/presenca/${encontro.token}` : "";

  const atualizar = useCallback(async () => {
    if (!encontro) return;
    const res = await fetch(`/api/encontros/${encontro.id}`);
    if (!res.ok) return;
    const e = await res.json();
    setPresentes(e.attendances.map((a: any) => ({ id: a.crismando.id, nome: a.crismando.nome, marcadaEm: a.marcadaEm })));
    const map: Record<string, string> = {};
    for (const an of e.anotacoes ?? []) map[an.crismandoId] = an.texto;
    setAnotacoes(map);
  }, [encontro]);

  useEffect(() => {
    if (!encontro) return;
    atualizar();
    const i = setInterval(atualizar, 5000);
    return () => clearInterval(i);
  }, [encontro, atualizar]);

  async function abrir() {
    const res = await fetch("/api/encontros", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turmaId: turma.id, data, horario }),
    });
    if (res.ok) {
      const e = await res.json();
      onChange({ encontroAtivo: e });
    }
  }

  async function fechar() {
    if (!encontro) return;
    await fetch(`/api/encontros/${encontro.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechar: true }),
    });
    onChange({ encontroAtivo: null });
  }

  async function salvarNotas() {
    if (!encontro) return;
    await fetch(`/api/encontros/${encontro.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema, licaoDeCasa: licao }),
    });
    alert("Anotações do encontro salvas.");
  }

  async function salvarAnotacaoAluno(crismandoId: string, texto: string) {
    if (!encontro) return;
    await fetch("/api/anotacoes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encontroId: encontro.id, crismandoId, texto }),
    });
  }

  if (!encontro) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow">
        <p className="text-gray-500">Nenhum encontro aberto.</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <label className="text-xs text-gray-500">Data do encontro (sábado)</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <label className="text-xs text-gray-500">Horário (opcional)</label>
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={abrir} className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 transition">
          Abrir encontro e gerar QR
        </button>
      </div>
    );
  }

  const presentesIds = new Set(presentes.map((p) => p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow">
        <p className="text-green-600 font-semibold">✅ Encontro aberto — {new Date(encontro.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
        <QRCodeSVG value={presencaUrl} size={220} />
        <p className="text-xs text-gray-400 break-all text-center">{presencaUrl}</p>
        <button onClick={fechar} className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white hover:bg-red-600 transition">
          Encerrar encontro
        </button>
        <p className="text-sm font-semibold text-gray-600">
          Presentes: <span className="text-violet-600">{presentes.length}</span>
          <span className="text-gray-400"> / {turma.crismandos.length}</span>
        </p>
      </div>

      {/* Anotações do encontro */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Anotações do encontro</h3>
        <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Tema"
          className="border rounded-lg px-3 py-2 text-sm w-full" />
        <input value={licao} onChange={(e) => setLicao(e.target.value)} placeholder="Lição de casa"
          className="border rounded-lg px-3 py-2 text-sm w-full" />
        <button onClick={salvarNotas} className="text-sm rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700">
          Salvar
        </button>
      </div>

      {/* Lista de alunos com presença + anotação curta */}
      <div className="bg-white rounded-xl shadow divide-y">
        {turma.crismandos.map((a) => (
          <div key={a.id} className="px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${presentesIds.has(a.id) ? "text-green-700 font-medium" : "text-gray-400"}`}>
                {presentesIds.has(a.id) ? "✓" : "○"} {a.nome}
              </span>
            </div>
            <input
              maxLength={50}
              value={anotacoes[a.id] ?? ""}
              onChange={(e) => setAnotacoes((p) => ({ ...p, [a.id]: e.target.value }))}
              onBlur={(e) => salvarAnotacaoAluno(a.id, e.target.value)}
              placeholder="Anotação (máx. 50)"
              className="border rounded px-2 py-1 text-xs text-gray-600"
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <a href={`/api/relatorio?turmaId=${turma.id}`} download className="text-sm text-violet-500 hover:underline">
          ⬇ Exportar presenças da turma (CSV)
        </a>
      </div>
    </div>
  );
}

// ---------- Aba Alunos ----------
function AbaAlunos({ turma, onChange }: { turma: Turma; onChange: (p: Partial<Turma>) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [contato, setContato] = useState("");
  const [idade, setIdade] = useState("");
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<string | null>(null);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/alunos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, contato, idade, turmaId: turma.id }),
    });
    const data = await res.json();
    if (res.ok) {
      onChange({ crismandos: [...turma.crismandos, data].sort((a, b) => a.nome.localeCompare(b.nome)) });
      setNome(""); setEmail(""); setContato(""); setIdade("");
    } else setErro(data.error ?? "Erro ao cadastrar");
  }

  async function remover(id: string) {
    if (!confirm("Remover este aluno?")) return;
    await fetch(`/api/alunos/${id}`, { method: "DELETE" });
    onChange({ crismandos: turma.crismandos.filter((a) => a.id !== id) });
  }

  async function salvarEdicao(a: Aluno) {
    await fetch(`/api/alunos/${a.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: a.nome, email: a.email, contato: a.contato, idade: a.idade }),
    });
    setEditando(null);
  }

  function editarCampo(id: string, campo: keyof Aluno, valor: string) {
    onChange({ crismandos: turma.crismandos.map((a) => (a.id === id ? { ...a, [campo]: campo === "idade" ? (valor ? Number(valor) : null) : valor } : a)) });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={adicionar} className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold text-gray-700">Novo aluno</h2>
        <input type="text" placeholder="Nome completo" value={nome} required onChange={(e) => setNome(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        <input type="email" placeholder="E-mail (conta Google)" value={email} required onChange={(e) => setEmail(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input type="text" placeholder="Contato (opcional)" value={contato} onChange={(e) => setContato(e.target.value)} className="border rounded-lg px-3 py-2 text-sm flex-1" />
          <input type="number" placeholder="Idade" value={idade} onChange={(e) => setIdade(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-24" />
        </div>
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700 transition">Cadastrar</button>
      </form>

      <div className="bg-white rounded-xl shadow divide-y">
        {turma.crismandos.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhum aluno cadastrado.</p>}
        {turma.crismandos.map((a) => (
          <div key={a.id} className="px-4 py-3">
            {editando === a.id ? (
              <div className="flex flex-col gap-2">
                <input value={a.nome} onChange={(e) => editarCampo(a.id, "nome", e.target.value)} className="border rounded px-2 py-1 text-sm" />
                <input value={a.email} onChange={(e) => editarCampo(a.id, "email", e.target.value)} className="border rounded px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <input value={a.contato ?? ""} placeholder="Contato" onChange={(e) => editarCampo(a.id, "contato", e.target.value)} className="border rounded px-2 py-1 text-sm flex-1" />
                  <input value={a.idade ?? ""} type="number" placeholder="Idade" onChange={(e) => editarCampo(a.id, "idade", e.target.value)} className="border rounded px-2 py-1 text-sm w-20" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => salvarEdicao(a)} className="text-xs text-green-600 font-medium">Salvar</button>
                  <button onClick={() => setEditando(null)} className="text-xs text-gray-400">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{a.nome}{a.idade ? `, ${a.idade}` : ""}</p>
                  <p className="text-xs text-gray-400">{a.email}{a.contato ? ` · ${a.contato}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditando(a.id)} className="text-xs text-violet-400 hover:text-violet-600">Editar</button>
                  <button onClick={() => remover(a.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">{turma.crismandos.length} aluno(s)</p>
    </div>
  );
}

// ---------- Aba Calendário (somente leitura) ----------
function AbaCalendario({ sabados }: { sabados: Sabado[] }) {
  if (sabados.length === 0) {
    return <p className="text-sm text-gray-400 text-center">A coordenadora ainda não publicou o calendário do ano.</p>;
  }
  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {sabados.map((s) => (
        <div key={s.id} className="px-4 py-2 flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">{new Date(s.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })}</span>
            {s.mensagem && <span className="ml-2 text-violet-500">“{s.mensagem}”</span>}
          </div>
          <span className={s.recesso || !s.temEncontro ? "text-gray-400" : "text-green-600"}>
            {s.recesso ? "Recesso" : s.temEncontro ? `Encontro${s.horario ? " " + s.horario : ""}` : "Sem encontro"}
          </span>
        </div>
      ))}
    </div>
  );
}

function proximoSabadoISO() {
  const d = new Date();
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
