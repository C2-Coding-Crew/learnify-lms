import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {
  const email = process.env.ADMIN_EMAIL;

  if (!email) {
    console.error("❌ Error: ADMIN_EMAIL tidak ditemukan di file .env");
    console.log("💡 Silakan tambahkan 'ADMIN_EMAIL=email_kamu@gmail.com' ke file .env dulu.");
    return;
  }

  // 1. Cari Role Admin
  const roleAdmin = await prisma.role.findFirst({
    where: { name: "admin" }
  });

  if (!roleAdmin) {
    console.error("❌ Role 'admin' tidak ditemukan. Pastikan sudah menjalankan seed.");
    return;
  }

  // 2. Cari User berdasarkan email dari .env
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User dengan email ${email} tidak ditemukan di database.`);
    console.log("💡 Silakan login ke aplikasi menggunakan Google dulu agar akun terdaftar.");
    return;
  }

  // 3. Update Role
  await prisma.user.update({
    where: { email },
    data: { roleId: roleAdmin.id },
  });

  console.log(`✅ BERHASIL! User ${email} sekarang adalah ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
