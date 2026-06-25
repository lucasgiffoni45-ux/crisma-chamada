"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart } from "@/components/Charts";
import { PageHeader, SairLink, SectionTitle, StatCard, Card, Botao, Badge, Avatar, EmptyState, Rodape } from "@/components/ui";

type Aluno = {
  id: string; nome: string; email: string | null; contato: string | null; idade: number | null;
  dataNascimento: string | null; sacramentos: string | null; alergias: string | null; necessidades: string | null;
  alerta?: boolean;
};

// Aniversariantes do mês atual (a partir do texto da data de nascimento).
function aniversariantesDoMes(alunos: Aluno[]) {
  const mes = new Date().getMonth() + 1;
  return alunos
    .map((a) => {
      const m = a.dataNascimento?.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      return m ? { nome: a.nome, dia: Number(m[1]), mes: Number(m[2]) } : null;
    })
    .filter((x): x is { nome: string; dia: number; mes: number } => !!x && x.mes === mes)
    .sort((a, b) => a.dia - b.dia);
}

// Próximo recado da coordenadora (sábado com mensagem, hoje ou no futuro).
function proximoAviso(sabados: { data: string; mensagem: string | null; temEncontro: boolean; recesso: boolean }[]) {
  const hoje = new Date().toISOString().slice(0, 10);
  return sabados.find((s) => s.mensagem && s.data.slice(0, 10) >= hoje) ?? null;
}
type Encontro = { id: string; token: string; data: string | Date; horario: string | null; tema: string | null; licaoDeCasa: string | null };
type Ponto = { label: string; valor: number };
type Turma = { id: string; nome: string; crismandos: Aluno[]; encontroAtivo: Encontro | null; totalEncontros: number; graficos: { porEncontro: Ponto[]; porAluno: Ponto[] } };
type Sabado = { id: string; data: string; temEncontro: boolean; recesso: boolean; horario: string | null; mensagem: string | null };

export default function FormadorClient({ turmasIniciais, sabados, nome }: {
  turmasIniciais: Turma[]; sabados: Sabado[]; nome: string;
}) {
  const [turmas, setTurmas] = useState(turmasIniciais);
  const [turmaSelId, setTurmaSelId] = useState(turmasIniciais[0]?.id ?? "");
  const [aba, setAba] = useState<"chamada" | "alunos" | "calendario" | "graficos">("chamada");

  const turma = turmas.find((t) => t.id === turmaSelId);

  function atualizarTurma(id: string, patch: Partial<Turma>) {
    setTurmas((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  if (!turma) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <PageHeader titulo="Painel do Formador" selo="Formador" right={<SairLink />} />
        <Card><EmptyState icon="🎓" titulo="Você ainda não tem turma" texto="Fale com a coordenadora para ser atribuído a uma turma." /></Card>
      </div>
    );
  }

  const rotulo = (a: typeof aba) => (a === "chamada" ? "Chamada" : a === "alunos" ? "Alunos" : a === "graficos" ? "Gráficos" : "Calendário");
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <PageHeader titulo="Painel do Formador" selo="Formador" subtitulo={`Olá, ${nome}.`} right={<SairLink />} />

      {/* Aviso da coordenadora */}
      {(() => { const av = proximoAviso(sabados); return av ? (
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-4 py-3">
          <span className="text-lg">📣</span>
          <div>
            <p className="text-xs font-semibold text-amber-800">Aviso da coordenadora · {new Date(av.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })}</p>
            <p className="text-sm text-amber-900">{av.mensagem}</p>
          </div>
        </div>
      ) : null; })()}

      {/* Seletor de turma (se houver mais de uma) */}
      {turmas.length > 1 ? (
        <select value={turmaSelId} onChange={(e) => setTurmaSelId(e.target.value)}
          className="mb-4 border border-stone-300 rounded-xl px-3 py-2 text-sm w-full bg-white">
          {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      ) : (
        <p className="mb-4 font-display text-xl font-semibold text-violet-900">{turma.nome}</p>
      )}

      <div className="flex gap-1 mb-6 border-b border-stone-200 overflow-x-auto">
        {(["chamada", "alunos", "graficos", "calendario"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition -mb-px border-b-2 ${aba === a ? "border-amber-400 text-violet-900" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {rotulo(a)}
          </button>
        ))}
      </div>

      {aba === "chamada" && <AbaChamada turma={turma} onChange={(p) => atualizarTurma(turma.id, p)} />}
      {aba === "alunos" && <AbaAlunos turma={turma} onChange={(p) => atualizarTurma(turma.id, p)} />}
      {aba === "graficos" && <AbaGraficos turma={turma} />}
      {aba === "calendario" && <AbaCalendario sabados={sabados} />}
      <Rodape />
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
  const [notasSalvas, setNotasSalvas] = useState(false);

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
    setNotasSalvas(true);
    setTimeout(() => setNotasSalvas(false), 2500);
  }

  async function salvarAnotacaoAluno(crismandoId: string, texto: string) {
    if (!encontro) return;
    await fetch("/api/anotacoes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encontroId: encontro.id, crismandoId, texto }),
    });
  }

  // Marcação manual (formador toca no aluno). Atualiza a lista na hora.
  async function marcarManual(aluno: Aluno, presente: boolean) {
    if (!encontro) return;
    setPresentes((prev) => presente
      ? (prev.some((p) => p.id === aluno.id) ? prev : [...prev, { id: aluno.id, nome: aluno.nome, marcadaEm: new Date().toISOString() }])
      : prev.filter((p) => p.id !== aluno.id));
    await fetch("/api/presenca/manual", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encontroId: encontro.id, crismandoId: aluno.id, presente }),
    });
  }

  if (!encontro) {
    return (
      <Card className="p-6 flex flex-col items-center gap-4">
        <EmptyState icon="📅" titulo="Nenhum encontro aberto" texto="Escolha a data do sábado e abra o encontro para gerar o QR Code." />
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <label className="text-xs text-stone-500">Data do encontro (sábado)</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
          <label className="text-xs text-stone-500">Horário (opcional)</label>
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
        </div>
        <Botao onClick={abrir} className="px-6 py-3">Abrir encontro e gerar QR</Botao>
      </Card>
    );
  }

  const presentesIds = new Set(presentes.map((p) => p.id));
  const total = turma.crismandos.length;
  const pct = total > 0 ? Math.round((presentes.length / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* QR + status */}
      <Card className="p-6 flex flex-col items-center gap-3 text-center">
        <Badge tom="green">● Encontro aberto · {new Date(encontro.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</Badge>
        <div className="p-3 bg-white rounded-2xl ring-1 ring-stone-200">
          <QRCodeSVG value={presencaUrl} size={200} fgColor="#2e1065" />
        </div>
        <p className="text-xs text-stone-400 break-all max-w-xs">{presencaUrl}</p>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard?.writeText(presencaUrl); }}
            className="text-xs font-medium rounded-full px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 transition">🔗 Copiar link</button>
          <a href={`https://wa.me/?text=${encodeURIComponent("Marque sua presença na Crisma: " + presencaUrl)}`} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium rounded-full px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition">💬 WhatsApp</a>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-violet-900">{presentes.length}</span>
          <span className="text-stone-400">/ {total} presentes</span>
          <span className="ml-2 text-sm font-semibold text-emerald-600">{pct}%</span>
        </div>
        <Botao variante="perigo" onClick={fechar}>Encerrar encontro</Botao>
      </Card>

      {/* Anotações do encontro */}
      <Card className="p-4 space-y-3">
        <SectionTitle>Anotações do encontro</SectionTitle>
        <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Tema do encontro"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm w-full" />
        <input value={licao} onChange={(e) => setLicao(e.target.value)} placeholder="Lição de casa"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm w-full" />
        <div className="flex items-center gap-2">
          <Botao onClick={salvarNotas} className="text-sm">Salvar anotações</Botao>
          {notasSalvas && <span className="text-sm text-emerald-600 font-medium">✓ salvo</span>}
        </div>
      </Card>

      {/* Tabela de presença + anotação por aluno */}
      <div>
        <SectionTitle acao={<a href={`/api/relatorio?turmaId=${turma.id}`} download className="text-xs text-violet-600 hover:underline">⬇ CSV</a>}>Presença</SectionTitle>
        <Card className="divide-y divide-stone-100">
          {turma.crismandos.map((a) => {
            const presente = presentesIds.has(a.id);
            return (
              <div key={a.id} className={`px-4 py-2.5 flex items-center gap-3 ${presente ? "bg-emerald-50/40" : ""}`}>
                <Avatar nome={a.nome} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{a.nome}</p>
                  <input
                    maxLength={50}
                    value={anotacoes[a.id] ?? ""}
                    onChange={(e) => setAnotacoes((p) => ({ ...p, [a.id]: e.target.value }))}
                    onBlur={(e) => salvarAnotacaoAluno(a.id, e.target.value)}
                    placeholder="Anotação (máx. 50)"
                    className="mt-1 w-full bg-transparent border-b border-dashed border-stone-200 text-xs text-stone-500 focus:outline-none focus:border-violet-400"
                  />
                </div>
                <button onClick={() => marcarManual(a, !presente)}
                  className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 ring-1 transition ${presente ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-stone-500 ring-stone-300 hover:ring-emerald-400 hover:text-emerald-600"}`}>
                  {presente ? "✓ Presente" : "Marcar"}
                </button>
              </div>
            );
          })}
        </Card>
        <p className="text-xs text-stone-400 text-center mt-2">Toque em “Marcar” para registrar presença manualmente (sem precisar do QR).</p>
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
  const [dataNascimento, setNascimento] = useState("");
  const [sacramentos, setSacramentos] = useState("");
  const [alergias, setAlergias] = useState("");
  const [necessidades, setNecessidades] = useState("");
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/alunos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, contato, idade, dataNascimento, sacramentos, alergias, necessidades, turmaId: turma.id }),
    });
    const data = await res.json();
    if (res.ok) {
      onChange({ crismandos: [...turma.crismandos, data].sort((a, b) => a.nome.localeCompare(b.nome)) });
      setNome(""); setEmail(""); setContato(""); setIdade(""); setNascimento(""); setSacramentos(""); setAlergias(""); setNecessidades("");
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
      body: JSON.stringify({
        nome: a.nome, email: a.email, contato: a.contato, idade: a.idade,
        dataNascimento: a.dataNascimento, sacramentos: a.sacramentos, alergias: a.alergias, necessidades: a.necessidades,
      }),
    });
    setEditando(null);
  }

  function editarCampo(id: string, campo: keyof Aluno, valor: string) {
    onChange({ crismandos: turma.crismandos.map((a) => (a.id === id ? { ...a, [campo]: campo === "idade" ? (valor ? Number(valor) : null) : valor } : a)) });
  }

  const filtrados = turma.crismandos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()));
  const niver = aniversariantesDoMes(turma.crismandos);

  return (
    <div className="space-y-4">
      {niver.length > 0 && (
        <div className="rounded-2xl bg-violet-50 ring-1 ring-violet-100 px-4 py-3">
          <p className="text-xs font-semibold text-violet-800 mb-1">🎂 Aniversariantes do mês</p>
          <div className="flex flex-wrap gap-1">
            {niver.map((n) => <Badge key={n.nome} tom="violet">{n.nome.split(" ")[0]} · {String(n.dia).padStart(2, "0")}/{String(n.mes).padStart(2, "0")}</Badge>)}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar aluno…" className="border border-stone-300 rounded-xl px-3 py-2 text-sm flex-1 bg-white" />
        <Botao variante={mostrarForm ? "suave" : "primario"} onClick={() => setMostrarForm((v) => !v)}>{mostrarForm ? "Fechar" : "＋ Novo"}</Botao>
      </div>

      {mostrarForm && (
        <Card className="p-4">
          <form onSubmit={adicionar} className="flex flex-col gap-3">
            <SectionTitle>Novo aluno</SectionTitle>
            <input type="text" placeholder="Nome completo" value={nome} required onChange={(e) => setNome(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <input type="email" placeholder="E-mail (Google) — opcional, pode adicionar depois" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="text" placeholder="WhatsApp / contato" value={contato} onChange={(e) => setContato(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm flex-1" />
              <input type="number" placeholder="Idade" value={idade} onChange={(e) => setIdade(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm w-24" />
            </div>
            <input type="text" placeholder="Data de nascimento (opcional)" value={dataNascimento} onChange={(e) => setNascimento(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <input type="text" placeholder="Sacramentos recebidos (ex: Batismo)" value={sacramentos} onChange={(e) => setSacramentos(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="text" placeholder="Alergias" value={alergias} onChange={(e) => setAlergias(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm flex-1" />
              <input type="text" placeholder="Necessidades especiais" value={necessidades} onChange={(e) => setNecessidades(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm flex-1" />
            </div>
            {erro && <p className="text-rose-500 text-sm">{erro}</p>}
            <Botao type="submit">Cadastrar</Botao>
          </form>
        </Card>
      )}

      <Card className="divide-y divide-stone-100">
        {filtrados.length === 0 && <EmptyState icon="👤" titulo={busca ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"} />}
        {filtrados.map((a) => (
          <div key={a.id} className="px-4 py-3">
            {editando === a.id ? (
              <div className="flex flex-col gap-2">
                <input value={a.nome} onChange={(e) => editarCampo(a.id, "nome", e.target.value)} placeholder="Nome" className="border border-stone-300 rounded-lg px-2 py-1 text-sm" />
                <input value={a.email ?? ""} onChange={(e) => editarCampo(a.id, "email", e.target.value)} placeholder="E-mail (adicionar depois)" className="border border-stone-300 rounded-lg px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <input value={a.contato ?? ""} placeholder="WhatsApp" onChange={(e) => editarCampo(a.id, "contato", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm flex-1" />
                  <input value={a.idade ?? ""} type="number" placeholder="Idade" onChange={(e) => editarCampo(a.id, "idade", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm w-20" />
                </div>
                <input value={a.dataNascimento ?? ""} placeholder="Data de nascimento" onChange={(e) => editarCampo(a.id, "dataNascimento", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm" />
                <input value={a.sacramentos ?? ""} placeholder="Sacramentos" onChange={(e) => editarCampo(a.id, "sacramentos", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <input value={a.alergias ?? ""} placeholder="Alergias" onChange={(e) => editarCampo(a.id, "alergias", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm flex-1" />
                  <input value={a.necessidades ?? ""} placeholder="Necessidades" onChange={(e) => editarCampo(a.id, "necessidades", e.target.value)} className="border border-stone-300 rounded-lg px-2 py-1 text-sm flex-1" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => salvarEdicao(a)} className="text-xs text-green-600 font-medium">Salvar</button>
                  <button onClick={() => setEditando(null)} className="text-xs text-stone-400">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Avatar nome={a.nome} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-800">{a.nome}{a.idade ? <span className="text-stone-400 font-normal">, {a.idade}</span> : ""}</p>
                  <p className="text-xs text-stone-400 truncate">{a.contato ?? "sem contato"}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.alerta && <Badge tom="red">⚠ faltou os 2 últimos</Badge>}
                    {!a.email && <Badge tom="amber">sem e-mail</Badge>}
                    {a.sacramentos && <Badge tom="violet">{a.sacramentos}</Badge>}
                    {(a.alergias || a.necessidades) && <Badge tom="red">⚕ {[a.alergias, a.necessidades].filter(Boolean).join(" · ")}</Badge>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button onClick={() => setEditando(a.id)} className="text-xs text-violet-500 hover:text-violet-700">Editar</button>
                  <button onClick={() => remover(a.id)} className="text-xs text-rose-400 hover:text-rose-600">Remover</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
      <p className="text-xs text-stone-400 text-center">{filtrados.length} de {turma.crismandos.length} aluno(s)</p>
    </div>
  );
}

// ---------- Aba Gráficos ----------
function AbaGraficos({ turma }: { turma: Turma }) {
  const { porEncontro, porAluno } = turma.graficos;
  const totalPresencas = porEncontro.reduce((s, p) => s + p.valor, 0);
  const esperado = turma.crismandos.length * turma.totalEncontros;
  const freq = esperado > 0 ? (totalPresencas / esperado) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <CartaoNum valor={String(turma.crismandos.length)} rotulo="Alunos" />
        <CartaoNum valor={String(turma.totalEncontros)} rotulo="Encontros" />
        <CartaoNum valor={`${freq.toFixed(0)}%`} rotulo="Frequência" />
      </div>
      <BarChart titulo="Presentes por encontro" dados={porEncontro} cor="bg-violet-600" vazio="Nenhum encontro realizado ainda." />
      <BarChart
        titulo="Presenças por aluno"
        dados={[...porAluno].sort((a, b) => b.valor - a.valor)}
        maxFixo={turma.totalEncontros || 1}
        cor="bg-green-500"
        vazio="Nenhum aluno cadastrado ainda."
      />
      <p className="text-xs text-stone-400 text-center">Alunos com poucas presenças podem precisar de atenção.</p>
    </div>
  );
}

function CartaoNum({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 p-3 text-center">
      <p className="text-2xl font-bold text-violet-800">{valor}</p>
      <p className="text-xs text-stone-500 mt-0.5">{rotulo}</p>
    </div>
  );
}

// ---------- Aba Calendário (somente leitura) ----------
function AbaCalendario({ sabados }: { sabados: Sabado[] }) {
  if (sabados.length === 0) {
    return <Card><EmptyState icon="🗓️" titulo="Calendário ainda não publicado" texto="A coordenadora ainda não definiu os sábados do ano." /></Card>;
  }
  return (
    <Card className="divide-y divide-stone-100">
      {sabados.map((s) => (
        <div key={s.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
          <div>
            <span className="font-medium text-stone-700">{new Date(s.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })}</span>
            {s.mensagem && <span className="ml-2 text-violet-600">“{s.mensagem}”</span>}
          </div>
          {s.recesso || !s.temEncontro
            ? <Badge tom="stone">{s.recesso ? "Recesso" : "Sem encontro"}</Badge>
            : <Badge tom="green">Encontro{s.horario ? ` · ${s.horario}` : ""}</Badge>}
        </div>
      ))}
    </Card>
  );
}

function proximoSabadoISO() {
  const d = new Date();
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
