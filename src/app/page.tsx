import { auth, papelDe } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export default async function Home() {
  const session = await auth();
  const papel = papelDe(session);

  if (session?.user) {
    if (papel === "dono") redirect("/dono");
    if (papel === "coordenadora") redirect("/coordenadora");
    if (papel === "formador") redirect("/formador");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center overflow-hidden">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 mb-4">
          <Cruz className="w-9 h-9 text-amber-300" />
        </span>
        <h1 className="font-display text-5xl font-bold text-violet-950 leading-none tracking-tight">Crisma</h1>
        <p className="font-display text-2xl text-amber-600/90 -mt-1">Chamada</p>
        <div className="mx-auto my-4 h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <p className="text-sm text-stone-500">Sistema de presença para a catequese</p>

        {session ? (
          <div className="mt-6">
            <p className="text-stone-700">Olá, {session.user?.name}.</p>
            <p className="mt-1 text-sm text-stone-400">
              Escaneie o QR Code exibido pelo seu formador para registrar presença.
            </p>
            <a href="/api/auth/signout" className="mt-4 inline-block text-sm text-stone-400 hover:text-stone-600">Sair</a>
          </div>
        ) : (
          <>
            <Link
              href="/api/auth/signin"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-900 px-6 py-3 font-semibold text-white hover:bg-violet-950 transition shadow-sm ring-1 ring-amber-300/20"
            >
              Entrar com Google
            </Link>
            <p className="mt-3 text-xs text-stone-400">
              Ao entrar, você concorda com a{" "}
              <Link href="/privacidade" className="text-violet-700 hover:underline">Política de Privacidade</Link>.
            </p>
          </>
        )}
      </Card>
      <p className="mt-6 font-display text-sm italic text-stone-400">“Deixai vir a mim as criancinhas” · Mc 10,14</p>
      <div className="mt-2 flex gap-3 text-xs text-stone-400">
        <Link href="/privacidade" className="hover:text-stone-600">Privacidade · LGPD</Link>
        <span>·</span>
        <Link href="/termos" className="hover:text-stone-600">Termos de Uso</Link>
      </div>
    </main>
  );
}
