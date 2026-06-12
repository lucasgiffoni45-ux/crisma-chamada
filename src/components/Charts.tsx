"use client";

type Dado = { label: string; valor: number };

// Gráfico de barras horizontais — leve, sem bibliotecas externas.
export function BarChart({
  titulo,
  dados,
  sufixo = "",
  cor = "bg-violet-600",
  maxFixo,
  vazio = "Sem dados ainda.",
}: {
  titulo: string;
  dados: Dado[];
  sufixo?: string;
  cor?: string;
  maxFixo?: number;
  vazio?: string;
}) {
  const max = maxFixo ?? Math.max(1, ...dados.map((d) => d.valor));
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-sm font-semibold text-stone-600 mb-3">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-stone-400 text-center py-2">{vazio}</p>
      ) : (
        <div className="space-y-2.5">
          {dados.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-xs text-stone-500 mb-0.5">
                <span className="truncate pr-2">{d.label}</span>
                <span className="font-medium text-stone-700 whitespace-nowrap">
                  {Number.isInteger(d.valor) ? d.valor : d.valor.toFixed(0)}
                  {sufixo}
                </span>
              </div>
              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${cor} rounded-full transition-all`} style={{ width: `${Math.min(100, (d.valor / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Donut/anel simples para uma única taxa (ex.: frequência geral %).
export function DonutTaxa({ titulo, percentual }: { titulo: string; percentual: number }) {
  const p = Math.max(0, Math.min(100, percentual));
  const raio = 40;
  const circ = 2 * Math.PI * raio;
  const traco = (p / 100) * circ;
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-stone-600 mb-2">{titulo}</h3>
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="#f5f5f4" strokeWidth="10" />
        <circle cx="50" cy="50" r={raio} fill="none" stroke="#7c3aed" strokeWidth="10"
          strokeDasharray={`${traco} ${circ}`} strokeLinecap="round" />
      </svg>
      <p className="text-2xl font-bold text-violet-800 -mt-16 mb-12">{p.toFixed(0)}%</p>
    </div>
  );
}
