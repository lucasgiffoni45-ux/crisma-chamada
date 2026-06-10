import { NextRequest, NextResponse } from "next/server";
import { auth, isTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const alunos = await prisma.crismando.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(alunos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { nome, email } = await req.json();
  if (!nome || !email) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });
  }
  try {
    const aluno = await prisma.crismando.create({ data: { nome, email: email.toLowerCase() } });
    return NextResponse.json(aluno, { status: 201 });
  } catch {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }
}
