import { auth, isDono } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DonoClient from "./DonoClient";

export default async function DonoPage() {
  const session = await auth();
  if (!isDono(session)) redirect("/");

  const coordenadoras = await prisma.user.findMany({
    where: { role: "coordenadora" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return <DonoClient coordenadorasIniciais={coordenadoras} />;
}
