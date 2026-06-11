import { NextRequest, NextResponse } from "next/server";
import { auth, isTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isTeacher(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.crismando.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
