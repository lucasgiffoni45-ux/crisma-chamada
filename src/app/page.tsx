import { auth } from "@/lib/auth";
import { isTeacher } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user?.email && isTeacher(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-indigo-700">Crisma — Chamada</h1>
        <p className="mt-2 text-gray-500">Sistema de presença para formação</p>
      </div>

      {session ? (
        <div className="text-center">
          <p className="text-gray-600">Olá, {session.user?.name}.</p>
          <p className="mt-1 text-sm text-gray-400">
            Escaneie o QR Code exibido pelo seu formador para registrar presença.
          </p>
        </div>
      ) : (
        <Link
          href="/api/auth/signin"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition"
        >
          Entrar com Google
        </Link>
      )}
    </main>
  );
}
