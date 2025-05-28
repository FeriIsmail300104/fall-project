import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { fullName, address, dob, email, password } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { message: "Email sudah terdaftar" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const patient = await prisma.patient.create({
    data: {
      fullName,
      address,
      dob: new Date(dob),
    },
  });

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "PATIENT",
      patientId: patient.id,
    },
  });

  return NextResponse.json({ message: "Success" });
}
