"use client";

import { useState } from "react";
import { Cruz, Card } from "@/components/ui";
import type { Rotulos } from "@/lib/segmentos";

// Reduz a imagem no navegador (máx 400px, JPEG) antes de enviar — fica leve e privada.
function reduzirImagem(file: File, max = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala), h = Math.round(img.height * escala);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InscricaoForm({ token, orgNome, rotulos }: { token: string; orgNome: string; rotulos: Rotulos }) {
  const [f, setF] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [foto, setFoto] = useState("");
  const [consentFoto, setConsentFoto] = useState(false);

  async function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setFoto(await reduzirImagem(file)); } catch { setErro("Não consegui ler a imagem."); }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const input = "border border-stone-300 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-400";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!consent) { setErro("Marque o aceite do uso dos dados (LGPD)."); return; }
    setEnviando(true);
    const res = await fetch("/api/inscricao", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, consentimento: consent, fotoBase64: consentFoto && foto ? foto : null, ...f }),
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

          <Campo label="E-mail (para login no app)"><input type="email" className={input} value={f.email ?? ""} onChange={set("email")} /></Campo>
          <Campo label="Qual comunidade irá ter os encontros?"><input className={input} value={f.comunidadeEncontros ?? ""} onChange={set("comunidadeEncontros")} /></Campo>
          <Campo label={`Nome completo (de quem irá frequentar os encontros)`} obrigatorio><input required className={input} value={f.nome ?? ""} onChange={set("nome")} /></Campo>
          <Campo label="Data de nascimento"><input className={input} placeholder="DD/MM/AAAA" value={f.dataNascimento ?? ""} onChange={set("dataNascimento")} /></Campo>
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Nome do pai"><input className={input} value={f.nomePai ?? ""} onChange={set("nomePai")} /></Campo>
            <Campo label="Nome da mãe"><input className={input} value={f.nomeMae ?? ""} onChange={set("nomeMae")} /></Campo>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Grau escolar"><input className={input} value={f.serieEscolar ?? ""} onChange={set("serieEscolar")} /></Campo>
            <Campo label="Estado civil"><input className={input} value={f.estadoCivil ?? ""} onChange={set("estadoCivil")} /></Campo>
          </div>
          <Campo label="Possui necessidade especial? Se sim, qual?"><input className={input} value={f.necessidades ?? ""} onChange={set("necessidades")} /></Campo>
          <Campo label="Possui alergia? Se sim, a quê?"><input className={input} value={f.alergias ?? ""} onChange={set("alergias")} /></Campo>
          {rotulos.mostrarSacramentos && (
            <Campo label="Sacramentos recebidos"><input className={input} placeholder="Ex.: Batismo, Eucaristia" value={f.sacramentos ?? ""} onChange={set("sacramentos")} /></Campo>
          )}
          <Campo label="Endereço (rua, bairro e número)"><input className={input} value={f.endereco ?? ""} onChange={set("endereco")} /></Campo>
          <Campo label="Comunidade que frequenta"><input className={input} value={f.comunidade ?? ""} onChange={set("comunidade")} /></Campo>
          <Campo label="Telefone (pode incluir nome do responsável pelo número)"><input className={input} value={f.telefone ?? ""} onChange={set("telefone")} /></Campo>
          <Campo label="Contato de WhatsApp"><input className={input} value={f.contato ?? ""} onChange={set("contato")} /></Campo>

          {/* Foto 3x4 — opcional, com consentimento de imagem próprio */}
          <div className="rounded-xl bg-stone-50 ring-1 ring-stone-200 p-3 mt-1">
            <p className="text-xs font-semibold text-stone-600">Foto 3x4 (opcional)</p>
            <label className="flex items-start gap-2 text-xs text-stone-600 mt-1">
              <input type="checkbox" checked={consentFoto} onChange={(e) => setConsentFoto(e.target.checked)} className="mt-0.5" />
              <span>Autorizo o uso da <b>foto</b> do(a) {rotulos.aluno} apenas pela coordenação, conforme a Política de Privacidade.</span>
            </label>
            {consentFoto && (
              <div className="mt-2 flex items-center gap-3">
                <input type="file" accept="image/*" capture="user" onChange={escolherFoto} className="text-xs" />
                {foto && <img src={foto} alt="prévia" className="w-14 h-16 object-cover rounded-lg ring-1 ring-stone-300" />}
              </div>
            )}
          </div>

          <Campo label="Assinatura do responsável (digite o nome completo)" obrigatorio>
            <input required className={input} value={f.assinaturaResponsavel ?? ""} onChange={set("assinaturaResponsavel")} placeholder="Nome completo de quem está preenchendo" />
          </Campo>

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
