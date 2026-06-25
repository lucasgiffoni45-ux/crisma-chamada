"use client";

import { useState } from "react";
import { Cruz, Card } from "@/components/ui";
import type { Rotulos } from "@/lib/segmentos";

export default function InscricaoForm({ token, orgNome, rotulos }: { token: string; orgNome: string; rotulos: Rotulos }) {
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const input = "border border-stone-300 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-400";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!consent) { setErro("Marque o aceite do uso dos dados (LGPD)."); return; }
    setEnviando(true);
    const res = await fetch("/api/inscricao", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, consentimento: consent, ...f }),
    });
    const data = await res.json();
    if (res.ok) setOk(true);
    else { setErro(data.error ?? "Não foi possível enviar."); setEnviando(false); }
  }

  if (ok) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 ring-4 ring-emerald-200 mb-4">
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <h1 className="font-display text-3xl font-bold text-violet-950">Inscrição enviada!</h1>
          <p className="mt-2 text-stone-600">Recebemos os dados. A coordenação vai conferir e confirmar a vaga. Que Deus abençoe! 🙏</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-4 sm:p-6">
      <div className="text-center mb-6">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 mb-3">
          <Cruz className="w-8 h-8 text-amber-300" />
        </span>
        <h1 className="font-display text-3xl font-bold text-violet-950 leading-tight">Ficha de inscrição</h1>
        <p className="text-sm text-stone-500">{orgNome}</p>
      </div>

      <Card className="p-5">
        <form onSubmit={enviar} className="flex flex-col gap-3">
          {/* Honeypot anti-spam (oculto) */}
          <input name="website" tabIndex={-1} autoComplete="off" onChange={(e) => setF((p) => ({ ...p, website: e.target.value }))} className="hidden" />

          <Campo label={`Nome completo do ${rotulos.aluno}`} obrigatorio><input required className={input} value={f.nome ?? ""} onChange={set("nome")} /></Campo>
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Data de nascimento"><input className={input} placeholder="DD/MM/AAAA" value={f.dataNascimento ?? ""} onChange={set("dataNascimento")} /></Campo>
            <Campo label="WhatsApp / contato"><input className={input} value={f.contato ?? ""} onChange={set("contato")} /></Campo>
          </div>
          <Campo label="E-mail (para login no app)"><input type="email" className={input} value={f.email ?? ""} onChange={set("email")} /></Campo>
          {rotulos.mostrarSacramentos && (
            <Campo label="Sacramentos já recebidos"><input className={input} placeholder="Ex.: Batismo, Eucaristia" value={f.sacramentos ?? ""} onChange={set("sacramentos")} /></Campo>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Alergias"><input className={input} value={f.alergias ?? ""} onChange={set("alergias")} /></Campo>
            <Campo label="Necessidades especiais"><input className={input} value={f.necessidades ?? ""} onChange={set("necessidades")} /></Campo>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Nome do pai"><input className={input} value={f.nomePai ?? ""} onChange={set("nomePai")} /></Campo>
            <Campo label="Nome da mãe"><input className={input} value={f.nomeMae ?? ""} onChange={set("nomeMae")} /></Campo>
          </div>
          <Campo label="Endereço"><input className={input} value={f.endereco ?? ""} onChange={set("endereco")} /></Campo>

          <label className="flex items-start gap-2 text-xs text-stone-600 mt-1">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>Autorizo o uso destes dados para a organização da catequese, conforme a <a href="/privacidade" target="_blank" className="text-violet-700 underline">Política de Privacidade</a> (LGPD). Para menores, confirmo ser responsável.</span>
          </label>

          {erro && <p className="text-rose-500 text-sm">{erro}</p>}
          <button type="submit" disabled={enviando}
            className="mt-1 rounded-xl bg-violet-900 px-6 py-3 font-semibold text-white hover:bg-violet-950 transition disabled:opacity-50">
            {enviando ? "Enviando…" : "Enviar inscrição"}
          </button>
        </form>
      </Card>
    </main>
  );
}

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-500">{label}{obrigatorio && <span className="text-rose-500"> *</span>}</span>
      {children}
    </label>
  );
}
