import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await prisma.medicalRecord.delete({
    where: { id: params.id },
  });

  redirect("/dashboard/admin");
}
