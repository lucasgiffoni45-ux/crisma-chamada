"use client";

import { ReactNode, useState, useEffect } from "react";

// Avatar com iniciais e cor estável derivada do nome.
const CORES = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export function Avatar({ nome, size = 36 }: { nome: string; size?: number }) {
  const ini = nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  const idx = [...nome].reduce((a, c) => a + c.charCodeAt(0), 0) % CORES.length;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${CORES[idx]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {ini}
    </span>
  );
}

const TONS: Record<string, string> = {
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  stone: "bg-stone-100 text-stone-600 ring-stone-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({ children, tom = "stone" }: { children: ReactNode; tom?: keyof typeof TONS | string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${TONS[tom] ?? TONS.stone}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-stone-200/70 ${className}`}>{children}</div>;
}

export function EmptyState({ icon = "✶", titulo, texto }: { icon?: ReactNode; titulo: string; texto?: string }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-3xl mb-2 opacity-30">{icon}</div>
      <p className="text-sm font-medium text-stone-600">{titulo}</p>
      {texto && <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">{texto}</p>}
    </div>
  );
}

// Crucifixo dourado em SVG (renderiza igual em qualquer dispositivo).
export function Cruz({ className = "w-6 h-6 text-amber-600" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z" />
    </svg>
  );
}

// Cabeçalho premium "sacro elegante": faixa violeta marcante + filete dourado.
export function PageHeader({ titulo, subtitulo, selo, right }: { titulo: string; subtitulo?: string; selo?: string; right?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-violet-950 text-white shadow-lg mb-6 ring-1 ring-violet-900">
      <div className="px-5 py-5 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/15 ring-1 ring-amber-300/30">
            <Cruz className="w-7 h-7 text-amber-300" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">{titulo}</h1>
              {selo && <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-200 bg-amber-400/15 ring-1 ring-amber-300/30 rounded-full px-2 py-0.5">{selo}</span>}
            </div>
            {subtitulo && <p className="text-sm text-violet-200/90">{subtitulo}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" />
    </div>
  );
}

// Link "Sair" para usar sobre a faixa escura.
export function SairLink() {
  return <a href="/api/auth/signout" className="text-sm text-violet-200 hover:text-white transition">Sair</a>;
}

// Título de seção serifado com filete dourado.
export function SectionTitle({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2 mt-1">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-amber-400" />
        <h2 className="font-display text-xl font-semibold text-violet-900">{children}</h2>
      </div>
      {acao}
    </div>
  );
}

// Barra de abas no estilo editorial (sublinhado dourado no ativo).
export function Tabs<T extends string>({ abas, ativa, onChange, rotulo }: { abas: readonly T[]; ativa: T; onChange: (a: T) => void; rotulo: (a: T) => string }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-stone-200 overflow-x-auto">
      {abas.map((a) => (
        <button key={a} onClick={() => onChange(a)}
          className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition -mb-px border-b-2 ${ativa === a ? "border-amber-400 text-violet-900" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
          {rotulo(a)}
        </button>
      ))}
    </div>
  );
}

export function StatCard({ valor, rotulo, tom = "violet" }: { valor: ReactNode; rotulo: string; tom?: string }) {
  const cor = tom === "green" ? "text-emerald-600" : tom === "amber" ? "text-amber-600" : tom === "red" ? "text-rose-500" : "text-violet-800";
  return (
    <Card className="p-4 text-center">
      <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
      <p className="text-xs text-stone-500 mt-1">{rotulo}</p>
    </Card>
  );
}

// Mapa de ícone por tipo de ação para o registro.
function iconeAcao(acao: string) {
  const a = acao.toLowerCase();
  if (a.includes("aluno")) return "👤";
  if (a.includes("turma")) return "🎓";
  if (a.includes("formador")) return "🧑‍🏫";
  if (a.includes("coordenadora")) return "⭐";
  if (a.includes("encontro")) return "📅";
  if (a.includes("calend")) return "🗓️";
  if (a.includes("anot")) return "📝";
  return "•";
}

// Registro de atividades em linha do tempo (busca /api/log).
export function LogTimeline() {
  const [logs, setLogs] = useState<any[] | null>(null);
  useEffect(() => { fetch("/api/log").then((r) => r.json()).then(setLogs).catch(() => setLogs([])); }, []);
  if (logs === null) return <EmptyState titulo="Carregando…" />;
  if (logs.length === 0) return <Card><EmptyState icon="🕊️" titulo="Nenhuma movimentação ainda" texto="As ações de coordenadora e formadores aparecerão aqui." /></Card>;
  return (
    <Card className="p-5">
      <ol className="relative ml-3 border-l border-stone-200">
        {logs.map((l) => {
          const d = new Date(l.createdAt);
          return (
            <li key={l.id} className="mb-5 ml-5 last:mb-0">
              <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 ring-2 ring-white text-[11px]">{iconeAcao(l.acao)}</span>
              <p className="text-sm text-stone-700"><b className="text-violet-900">{l.autor}</b> {l.acao}{l.alvo ? <span className="text-stone-500"> — {l.alvo}</span> : null}</p>
              <p className="text-xs text-stone-400">{d.toLocaleDateString("pt-BR")} · {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

// Botão padrão.
export function Botao({ children, onClick, type = "button", variante = "primario", className = "", disabled }: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit"; variante?: "primario" | "perigo" | "suave"; className?: string; disabled?: boolean;
}) {
  const estilos = {
    primario: "bg-violet-700 text-white hover:bg-violet-800 shadow-sm",
    perigo: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    suave: "bg-stone-100 text-stone-700 hover:bg-stone-200",
  }[variante];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${estilos} ${className}`}>
      {children}
    </button>
  );
}
