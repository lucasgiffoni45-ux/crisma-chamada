"use client";

import Link from "next/link";
import { Cruz, Card } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 mb-4">
          <Cruz className="w-8 h-8 text-amber-300" />
        </span>
        <h1 className="font-display text-3xl font-bold text-violet-950">Algo deu errado</h1>
        <p className="mt-2 text-stone-500">Tivemos um problema ao carregar esta página. Tente novamente em instantes.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => reset()} className="rounded-xl bg-violet-900 px-5 py-2.5 font-semibold text-white hover:bg-violet-950 transition">
            Tentar novamente
          </button>
          <Link href="/" className="rounded-xl ring-1 ring-stone-300 px-5 py-2.5 font-semibold text-stone-700 hover:bg-stone-100 transition">
            Início
          </Link>
        </div>
      </Card>
    </main>
  );
}
