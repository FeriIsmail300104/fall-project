import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });

  if (user?.patientId) {
    await prisma.patient.delete({ where: { id: user.patientId } });
  }

  await prisma.user.delete({ where: { id: params.id } });

  redirect("/dashboard/admin/accounts");
}
