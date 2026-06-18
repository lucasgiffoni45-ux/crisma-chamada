"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { Cruz, Card } from "@/components/ui";

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
    return <Tela emblema="cruz" titulo="Aguarde…" subtitulo="Registrando sua presença." />;
  }

  if (status === "unauthenticated") {
    return (
      <Tela emblema="cruz" titulo="Confirmar presença" subtitulo="Entre com sua conta Google para registrar presença neste encontro.">
        <button
          onClick={() => signIn("google", { callbackUrl: `/presenca/${token}` })}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-violet-900 px-6 py-3 font-semibold text-white hover:bg-violet-950 transition shadow-sm ring-1 ring-amber-300/20"
        >
          Entrar com Google
        </button>
      </Tela>
    );
  }

  if (estado === "ok") {
    return <Tela emblema="ok" titulo="Presença confirmada!" subtitulo={mensagem} />;
  }

  if (estado === "erro") {
    return <Tela emblema="erro" titulo="Não foi possível registrar" subtitulo={mensagem} />;
  }

  return <Tela emblema="cruz" titulo="Carregando…" subtitulo="" />;
}

function Tela({ titulo, subtitulo, emblema, children }: {
  titulo: string; subtitulo: string; emblema: "cruz" | "ok" | "erro"; children?: React.ReactNode;
}) {
  const anel = emblema === "ok" ? "bg-emerald-600 ring-emerald-200" : emblema === "erro" ? "bg-rose-500 ring-rose-200" : "bg-violet-950 ring-amber-300/30";
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center">
        <span className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl ring-4 mb-4 ${anel}`}>
          {emblema === "ok" ? (
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          ) : emblema === "erro" ? (
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <Cruz className="w-9 h-9 text-amber-300" />
          )}
        </span>
        <h1 className="font-display text-3xl font-bold text-violet-950 leading-tight">{titulo}</h1>
        {subtitulo && <p className="mt-2 text-stone-600">{subtitulo}</p>}
        {children}
      </Card>
    </main>
  );
}
