import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function setAdminPassword() {
  const email = "fauziaditya874@gmail.com";
  // SILAKAN GANTI PASSWORD DI BAWAH INI DENGAN YANG KAMU MAU
  const plainPassword = "AdminLearnify2026!"; 

  console.log(`Menyiapkan password untuk: ${email}...`);

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });

    if (!user) {
      console.error("❌ ERROR: User tidak ditemukan. Pastikan kamu sudah pernah login/daftar dengan email ini.");
      return;
    }

    // Hash password secara aman
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Cari account dengan provider 'credential' atau buat baru jika belum ada
    const emailAccount = user.accounts.find((acc: any) => acc.providerId === "credential");


    if (emailAccount) {
      // Update password di account yang sudah ada
      await prisma.account.update({
        where: { id: emailAccount.id },
        data: { password: hashedPassword }
      });
    } else {
      // Buat record account baru untuk login email
      await prisma.account.create({
        data: {
          id: `acc_${Date.now()}`,
          userId: user.id,
          accountId: user.email,
          providerId: "credential",
          password: hashedPassword
        }
      });
    }


    // Pastikan user tersebut punya role Admin (1)
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: 1 }
    });

    console.log("--------------------------------------------------");
    console.log("✅ BERHASIL!");
    console.log(`📧 Akun    : ${email}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log("--------------------------------------------------");
    console.log("Sekarang kamu bisa login di: http://localhost:3000/admin/login");
    console.log("Gunakan Username apapun dan Password di atas.");
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
