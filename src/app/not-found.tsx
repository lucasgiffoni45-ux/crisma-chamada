import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 mb-4">
          <Cruz className="w-8 h-8 text-amber-300" />
        </span>
        <h1 className="font-display text-3xl font-bold text-violet-950">Página não encontrada</h1>
        <p className="mt-2 text-stone-500">O endereço que você tentou abrir não existe ou foi movido.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-violet-900 px-6 py-3 font-semibold text-white hover:bg-violet-950 transition">
          Voltar ao início
        </Link>
      </Card>
    </main>
  );
}
