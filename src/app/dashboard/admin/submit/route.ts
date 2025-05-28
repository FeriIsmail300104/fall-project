import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const form = await req.formData();

  const data = {
    patientId: form.get("patientId") as string,
    penyakit: form.get("penyakit") as string,
    obat: form.get("obat") as string,
    dokter: form.get("dokter") as string,
    ruangan: form.get("ruangan") as string,
    tanggal: new Date(form.get("tanggal") as string),
  };

  await prisma.medicalRecord.create({ data });

  redirect("/dashboard/admin");
}
