import { auth, papelDe } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const papel = papelDe(session);

  if (session?.user) {
    if (papel === "dono") redirect("/dono");
    if (papel === "coordenadora") redirect("/coordenadora");
    if (papel === "formador") redirect("/formador");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-1 text-amber-600" fill="currentColor" aria-hidden="true">
          <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z" />
        </svg>
        <h1 className="text-3xl font-bold text-violet-800">Crisma — Chamada</h1>
        <p className="mt-2 text-stone-500">Sistema de presença para a catequese</p>
      </div>

      {session ? (
        <div className="text-center">
          <p className="text-gray-600">Olá, {session.user?.name}.</p>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Escaneie o QR Code exibido pelo seu formador para registrar presença.
          </p>
          <a href="/api/auth/signout" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600">
            Sair
          </a>
        </div>
      ) : (
        <Link
          href="/api/auth/signin"
          className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 transition"
        >
          Entrar com Google
        </Link>
      )}
    </main>
  );
}
