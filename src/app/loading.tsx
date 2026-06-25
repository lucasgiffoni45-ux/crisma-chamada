import { Cruz } from "@/components/ui";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-violet-950 ring-4 ring-amber-300/30 animate-pulse">
        <Cruz className="w-8 h-8 text-amber-300" />
      </span>
      <p className="mt-4 text-sm text-stone-400">Carregando…</p>
    </main>
  );
}
