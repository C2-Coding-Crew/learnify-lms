import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Fungsi untuk membuat hash yang SAMA dengan Better Auth kamu
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function finalFix() {
  const email = "fauziaditya874@gmail.com";
  const password = "AdminLearnify2026!";

  console.log(`Final Fix untuk Admin: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("❌ User tidak ditemukan.");
      return;
    }

    const hashedPassword = hashPassword(password);

    // Hapus dulu account lama biar bersih
    await prisma.account.deleteMany({
      where: { userId: user.id, providerId: "credential" }
    });
    await prisma.account.deleteMany({
      where: { userId: user.id, providerId: "email" }
    });

    // Buat baru dengan format yang BENAR
    await prisma.account.create({
      data: {
        id: `acc_${Date.now()}`,
        userId: user.id,
        accountId: user.id, // AccountId harus sama dengan UserId
        providerId: "credential",
        password: hashedPassword,
      }
    });

    // Set Role Admin
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: 1 }
    });

    console.log("--------------------------------------------------");
    console.log("✅ JURUS TERAKHIR BERHASIL!");
    console.log(`📧 Email   : ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("--------------------------------------------------");
    console.log("Silakan login lagi. Kali ini saya sangat optimis!");
  } catch (err) {
    console.error("❌ Gagal:", err);
  } finally {
    await prisma.$disconnect();
  }
}

finalFix();
