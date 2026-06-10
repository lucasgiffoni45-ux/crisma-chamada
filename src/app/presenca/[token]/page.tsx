"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams } from "next/navigation";

export default function PresencaPage() {
  const { data: session, status } = useSession();
  const { token } = useParams<{ token: string }>();
  const [estado, setEstado] = useState<"idle" | "carregando" | "ok" | "erro">("idle");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (status === "authenticated" && estado === "idle") {
      confirmarPresenca();
    }
  }, [status]);

  async function confirmarPresenca() {
    setEstado("carregando");
    const res = await fetch("/api/presenca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok) {
      const hora = new Date(data.marcadaEm).toLocaleTimeString("pt-BR");
      setMensagem(`Presença confirmada às ${hora}. Bom encontro, ${data.nome}!`);
      setEstado("ok");
    } else {
      setMensagem(data.error ?? "Erro ao registrar presença.");
      setEstado("erro");
    }
  }

  if (status === "loading" || estado === "carregando") {
    return <Tela titulo="Aguarde..." subtitulo="Registrando sua presença..." />;
  }

  if (status === "unauthenticated") {
    return (
      <Tela titulo="Confirmar Presença" subtitulo="Faça login com sua conta Google para registrar presença.">
        <button
          onClick={() => signIn("google", { callbackUrl: `/presenca/${token}` })}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition"
        >
          Entrar com Google
        </button>
      </Tela>
    );
  }

  if (estado === "ok") {
    return (
      <Tela titulo="✅ Presença Confirmada!" subtitulo={mensagem} cor="text-green-600" />
    );
  }

  if (estado === "erro") {
    return (
      <Tela titulo="❌ Não foi possível registrar" subtitulo={mensagem} cor="text-red-600" />
    );
  }

  return <Tela titulo="Carregando..." subtitulo="" />;
}

function Tela({ titulo, subtitulo, cor = "text-indigo-700", children }: {
  titulo: string; subtitulo: string; cor?: string; children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className={`text-2xl font-bold ${cor}`}>{titulo}</h1>
      <p className="text-gray-600 max-w-sm">{subtitulo}</p>
      {children}
    </main>
  );
}
