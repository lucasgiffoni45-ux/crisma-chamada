// Motor de vocabulário: o app é genérico (presença, turmas, alunos, encontros).
// O que muda entre catequese, escola, música e artes marciais é só o VOCABULÁRIO.
// Cada organização tem um "segmento"; aqui ficam os rótulos de cada um.
// Para adicionar um novo segmento, basta criar uma entrada neste objeto.

export type Segmento = "catequese" | "escola" | "musica" | "artes-marciais";

export type Rotulos = {
  produto: string;        // nome/marca exibida
  emblema: string;        // emoji/símbolo do segmento
  aluno: string; alunos: string;
  turma: string; turmas: string;
  encontro: string; encontros: string;
  formador: string; formadores: string;
  coordenador: string;    // papel "coordenadora"
  presenca: string;
  // campos extras específicos do segmento (ex.: sacramentos só na catequese)
  mostrarSacramentos: boolean;
};

export const SEGMENTOS: Record<Segmento, Rotulos> = {
  catequese: {
    produto: "Crisma — Chamada", emblema: "✝",
    aluno: "aluno", alunos: "alunos", turma: "turma", turmas: "turmas",
    encontro: "encontro", encontros: "encontros", formador: "formador", formadores: "formadores",
    coordenador: "coordenador(a)", presenca: "presença", mostrarSacramentos: true,
  },
  escola: {
    produto: "Chamada Escolar", emblema: "🏫",
    aluno: "aluno", alunos: "alunos", turma: "turma", turmas: "turmas",
    encontro: "aula", encontros: "aulas", formador: "professor", formadores: "professores",
    coordenador: "coordenação", presenca: "presença", mostrarSacramentos: false,
  },
  musica: {
    produto: "Chamada da Escola de Música", emblema: "🎵",
    aluno: "aluno", alunos: "alunos", turma: "turma", turmas: "turmas",
    encontro: "aula", encontros: "aulas", formador: "professor", formadores: "professores",
    coordenador: "coordenação", presenca: "presença", mostrarSacramentos: false,
  },
  "artes-marciais": {
    produto: "Chamada do Dojo", emblema: "🥋",
    aluno: "aluno", alunos: "alunos", turma: "turma", turmas: "turmas",
    encontro: "treino", encontros: "treinos", formador: "instrutor", formadores: "instrutores",
    coordenador: "coordenação", presenca: "presença", mostrarSacramentos: false,
  },
};

export const SEGMENTOS_LISTA: { valor: Segmento; nome: string }[] = [
  { valor: "catequese", nome: "✝ Catequese / Crisma" },
  { valor: "escola", nome: "🏫 Escola" },
  { valor: "musica", nome: "🎵 Escola de música" },
  { valor: "artes-marciais", nome: "🥋 Artes marciais" },
];

// Sempre devolve um conjunto válido de rótulos (catequese como padrão).
export function rotulosDe(segmento?: string | null): Rotulos {
  return SEGMENTOS[(segmento as Segmento)] ?? SEGMENTOS.catequese;
}

// Helper de plural simples ("1 aluno" / "3 alunos").
export function contar(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}
