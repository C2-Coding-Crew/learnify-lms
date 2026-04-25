import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Fungsi Hash standar sistem kamu (PBKDF2)
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function createStandaloneAdmin() {
  const adminEmail = "admin@learnify.id";
  const password = "AdminLearnify2026!";
  const userId = "ADMIN_ID_LEARNIFY_001";

  console.log(`Membuat Akun Admin Standalone: ${adminEmail}...`);

  try {
    // 1. Hapus jika sudah ada biar bersih
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });

    // 2. Buat User Admin Baru
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: "Super Admin Learnify",
        email: adminEmail,
        emailVerified: true,
        roleId: 1, // Admin
        status: 1,
      }
    });

    // 3. Buat Kredensial (Password)
    await prisma.account.create({
      data: {
        id: `acc_admin_001`,
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashPassword(password),
      }
    });

    console.log("--------------------------------------------------");
    console.log("✅ AKUN ADMIN MANDIRI BERHASIL DIBUAT!");
    console.log(`👤 Username : Learnify`);
    console.log(`📧 Email Ref: ${adminEmail}`);
    console.log(`🔑 Password : ${password}`);
    console.log("--------------------------------------------------");
    console.log("Sekarang kamu bisa login dengan Username & PW di atas.");
  } catch (err) {
    console.error("❌ Gagal membuat admin:", err);
  } finally {
    await prisma.$disconnect();
  }
}

createStandaloneAdmin();
