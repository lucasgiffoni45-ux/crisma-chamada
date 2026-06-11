"use client";

import { useState } from "react";

type Coord = { id: string; name: string | null; email: string | null };

export default function DonoClient({ coordenadorasIniciais }: { coordenadorasIniciais: Coord[] }) {
  const [coords, setCoords] = useState(coordenadorasIniciais);
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Painel do Dono</h1>
          <p className="text-sm text-gray-400">Cadastre as coordenadoras da catequese.</p>
        </div>
        <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-gray-600">Sair</a>
      </div>

      <form onSubmit={adicionar} className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-gray-700">Nova coordenadora</h2>
        <input
          type="text" placeholder="Nome" value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="email" placeholder="E-mail (conta Google)" value={email} required
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition">
          Cadastrar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow divide-y">
        {coords.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Nenhuma coordenadora ainda.</p>}
        {coords.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-sm">{c.name ?? "(sem nome)"}</p>
              <p className="text-xs text-gray-400">{c.email}</p>
            </div>
            <button onClick={() => remover(c.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}
