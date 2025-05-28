// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 🔐 Hash passwords
  const adminPass = await bcrypt.hash("admin123", 10);
  const patientPass = await bcrypt.hash("pasien123", 10);

  // ✅ Create or update admin user
  await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    update: {
      password: adminPass, // force update hashed password
      role: "ADMIN",
    },
    create: {
      email: "admin1@hospital.com",
      password: adminPass,
      role: "ADMIN",
    },
  });

  // ✅ Create or find patient profile
  const patient = await prisma.patient.findFirst({
    where: { fullName: "Pasien Satu" },
  });

  const realPatient =
    patient ??
    (await prisma.patient.create({
      data: {
        fullName: "Pasien Satu",
        address: "Jl. Sehat No.1",
        dob: new Date("1990-01-01"),
      },
    }));

  await prisma.user.upsert({
    where: { email: "pasien@hospital.com" },
    update: {},
    create: {
      email: "pasien@hospital.com",
      password: patientPass,
      role: "PATIENT",
      patientId: realPatient.id,
    },
  });

  console.log("✅ Akun admin dan pasien berhasil dibuat/diupdate!");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
