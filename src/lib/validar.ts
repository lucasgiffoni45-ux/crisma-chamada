// Validações simples de entrada (usadas nas rotas de API).

// Formato de e-mail (suficiente para evitar cadastros quebrados/abuso).
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Limita o tamanho de um texto (proteção contra payloads enormes).
export function limitar(texto: string | null | undefined, max: number): string | null {
  if (texto == null) return null;
  const t = String(texto).trim();
  return t ? t.slice(0, max) : null;
}
