"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type Aluno = { id: string; nome: string; email: string };
type Sessao = { id: string; token: string; abertaEm: Date | string; ativa: boolean };
type SessaoComPresenca = Sessao & { attendances: { crismando: Aluno; marcadaEm: Date | string }[] };

export default function DashboardClient({
  alunos: alunosInicial,
  sessaoAtiva: sessaoInicialAtiva,
  ultimasSessoes,
}: {
  alunos: Aluno[];
  sessaoAtiva: Sessao | null;
  ultimasSessoes: SessaoComPresenca[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sessao, setSessao] = useState<Sessao | null>(sessaoInicialAtiva);
  const [alunos, setAlunos] = useState(alunosInicial);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [erro, setErro] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState<"chamada" | "alunos" | "historico">("chamada");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function abrirChamada() {
    const res = await fetch("/api/sessao", { method: "POST" });
    const data = await res.json();
    setSessao(data);
    startTransition(() => router.refresh());
  }

  async function fecharChamada() {
    await fetch("/api/sessao", { method: "DELETE" });
    setSessao(null);
    startTransition(() => router.refresh());
  }

  async function adicionarAluno(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, email: novoEmail }),
    });
    if (res.ok) {
      const aluno = await res.json();
      setAlunos((prev) => [...prev, aluno].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNovoNome("");
      setNovoEmail("");
    } else {
      const data = await res.json();
      setErro(data.error ?? "Erro ao cadastrar");
    }
  }

  async function removerAluno(id: string) {
    if (!confirm("Remover este crismando?")) return;
    await fetch(`/api/alunos/${id}`, { method: "DELETE" });
    setAlunos((prev) => prev.filter((a) => a.id !== id));
  }

  const presencaUrl = sessao ? `${appUrl}/presenca/${sessao.token}` : "";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700">Painel do Formador</h1>
        <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sair</a>
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 border-b">
        {(["chamada", "alunos", "historico"] as const).map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaSelecionada(aba)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              abaSelecionada === aba
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {aba === "chamada" ? "Chamada" : aba === "alunos" ? "Crismandos" : "Histórico"}
          </button>
        ))}
      </div>

      {/* ABA: CHAMADA */}
      {abaSelecionada === "chamada" && (
        <div className="space-y-6">
          {sessao ? (
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow">
              <p className="text-green-600 font-semibold">✅ Chamada aberta</p>
              <QRCodeSVG value={presencaUrl} size={220} />
              <p className="text-xs text-gray-400 break-all text-center">{presencaUrl}</p>
              <button
                onClick={fecharChamada}
                className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white hover:bg-red-600 transition"
              >
                Encerrar Chamada
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow">
              <p className="text-gray-500">Nenhuma chamada aberta no momento.</p>
              <button
                onClick={abrirChamada}
                disabled={isPending}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Abrir Chamada
              </button>
            </div>
          )}

          <div className="text-center">
            <a
              href="/api/relatorio"
              download
              className="text-sm text-indigo-500 hover:underline"
            >
              ⬇ Exportar todas as presenças (CSV)
            </a>
          </div>
        </div>
      )}

      {/* ABA: ALUNOS */}
      {abaSelecionada === "alunos" && (
        <div className="space-y-4">
          <form onSubmit={adicionarAluno} className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold text-gray-700">Novo crismando</h2>
            <input
              type="text"
              placeholder="Nome completo"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="email"
              placeholder="E-mail (conta Google)"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition"
            >
              Cadastrar
            </button>
          </form>

          <div className="bg-white rounded-xl shadow divide-y">
            {alunos.length === 0 && (
              <p className="p-4 text-sm text-gray-400 text-center">Nenhum crismando cadastrado ainda.</p>
            )}
            {alunos.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{a.nome}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </div>
                <button
                  onClick={() => removerAluno(a.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center">{alunos.length} crismando(s) cadastrado(s)</p>
        </div>
      )}

      {/* ABA: HISTÓRICO */}
      {abaSelecionada === "historico" && (
        <div className="space-y-4">
          {ultimasSessoes.length === 0 && (
            <p className="text-sm text-gray-400 text-center">Nenhuma chamada realizada ainda.</p>
          )}
          {ultimasSessoes.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow p-4">
              <p className="font-semibold text-sm text-gray-700">
                {new Date(s.abertaEm).toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400 mb-2">{s.attendances.length} presença(s)</p>
              <ul className="divide-y text-sm">
                {s.attendances.map((a) => (
                  <li key={a.crismando.id} className="py-1 flex justify-between">
                    <span>{a.crismando.nome}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(a.marcadaEm).toLocaleTimeString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
