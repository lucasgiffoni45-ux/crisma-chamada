"use client";

import { useState } from "react";
import { Botao } from "@/components/ui";

export default function AssinarBotoes() {
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function assinar(plano: "mensal" | "anual") {
    setErro("");
    setCarregando(plano);
    try {
      const res = await fetch("/api/assinatura/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // página de pagamento do Asaas
      } else {
        setErro(data.error ?? "Não foi possível iniciar o pagamento.");
        setCarregando(null);
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setCarregando(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Botao onClick={() => assinar("mensal")} disabled={!!carregando}>
          {carregando === "mensal" ? "Abrindo…" : "Assinar mensal · R$ 39,90"}
        </Botao>
        <Botao variante="suave" onClick={() => assinar("anual")} disabled={!!carregando}>
          {carregando === "anual" ? "Abrindo…" : "Assinar anual · R$ 399"}
        </Botao>
      </div>
      <p className="text-xs text-stone-400 mt-2">Você escolhe PIX, boleto ou cartão na próxima tela.</p>
      {erro && <p className="text-rose-500 text-sm mt-2">{erro}</p>}
    </div>
  );
}
