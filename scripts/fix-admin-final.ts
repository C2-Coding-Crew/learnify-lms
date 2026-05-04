import { auth } from "../lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdmin() {
  const email = "fauziaditya874@gmail.com";
  const password = "AdminLearnify2026!";

  console.log(`Sedang memperbaiki akun Admin: ${email}...`);

  try {
    // 1. Cari user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("❌ User tidak ditemukan di database.");
      return;
    }

    // 2. Gunakan API internal Better Auth untuk set password 
    // (Ini akan menjamin format passwordnya bener-bener dikenal sistem)
    const result = await auth.api.setPassword({
      body: {
        newPassword: password,
        userId: user.id
      }
    });

    // 3. Pastikan Role-nya Admin
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: 1 }
    });

    console.log("--------------------------------------------------");
    console.log("✅ FIX BERHASIL!");
    console.log(`📧 Email   : ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("--------------------------------------------------");
    console.log("Silakan login lagi di: http://localhost:3000/admin/login");
  } catch (err) {
    console.error("❌ Gagal memperbaiki:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
