import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const COMPANY = "LEARNIFY";
const SYSTEM = "SYSTEM";

// ─── Helper: Create account dengan password ──────────────────────────────────
async function createAccountWithPassword(userId: string, email: string, plainPassword: string) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.account.findFirst({
    where: {userId }
  });

  if (!existing) {
    await prisma.account.create({
      data: {
        id: `acc_${Date.now()}_${Math.random()}`,
        userId,
        accountId: email,
        providerId: "credential",
        password: hashedPassword
      }
    });
  }
}

async function main() {
  console.log("🌱 Seeding database dengan team standard schema...\n");

  // ─── 1. Seed Roles ────────────────────────────────────────────────────────
  console.log("1️⃣  Seeding Roles...");
  const roleNames = ["admin", "instructor", "student"];
  for (const name of roleNames) {
    const existing = await prisma.role.findFirst({ where: { name, companyCode: COMPANY } });
    if (!existing) {
      await prisma.role.create({
        data: {
          name,
          companyCode: COMPANY,
          status: 1,
          isDeleted: 0,
          createdBy: SYSTEM,
          createdDate: new Date(),
          lastUpdatedBy: SYSTEM,
          lastUpdatedDate: new Date(),
        },
      });
    }
  }
  const roleAdmin = await prisma.role.findFirst({ where: { name: "admin", companyCode: COMPANY } });
  const roleInstructor = await prisma.role.findFirst({ where: { name: "instructor", companyCode: COMPANY } });
  const roleStudent = await prisma.role.findFirst({ where: { name: "student", companyCode: COMPANY } });
  console.log(`   ✅ admin | instructor | student`);

  // ─── 2. Seed Categories ──────────────────────────────────────────────────
  console.log("\n2️⃣  Seeding Categories...");
  const categoriesData = [
    { name: "Design", slug: "design" },
    { name: "Development", slug: "development" },
    { name: "Branding", slug: "branding" },
    { name: "Data Science", slug: "data-science" },
    { name: "Marketing", slug: "marketing" },
  ];
  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({
        data: {
          ...cat,
          companyCode: COMPANY,
          status: 1,
          isDeleted: 0,
          createdBy: SYSTEM,
          createdDate: new Date(),
          lastUpdatedBy: SYSTEM,
          lastUpdatedDate: new Date(),
        },
      });
    }
    console.log(`   ✅ Category: ${cat.name}`);
  }
  // Ambil IDs setelah insert
  const catDesign = await prisma.category.findUnique({ where: { slug: "design" } });
  const catDev = await prisma.category.findUnique({ where: { slug: "development" } });
  const catBranding = await prisma.category.findUnique({ where: { slug: "branding" } });
  const catDataScience = await prisma.category.findUnique({ where: { slug: "data-science" } });

  // ─── 3. Seed Instructor Users ─────────────────────────────────────────────
  console.log("\n3️⃣  Seeding Instructor Users...");
  const instructor1 = await prisma.user.upsert({
    where: { email: "budi.santoso@learnify.id" },
    update: {},
    create: {
      id: "instructor-001",
      name: "Budi Santoso",
      email: "budi.santoso@learnify.id",
      emailVerified: true,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso",
      roleId: roleInstructor!.id,
      companyCode: COMPANY,
      status: 1,
      isDeleted: 0,
      createdBy: SYSTEM,
      createdAt: new Date(),
      lastUpdatedBy: SYSTEM,
      updatedAt: new Date(),
    },
  });
  const instructor2 = await prisma.user.upsert({
    where: { email: "sari.dewi@learnify.id" },
    update: {},
    create: {
      id: "instructor-002",
      name: "Sari Dewi",
      email: "sari.dewi@learnify.id",
      emailVerified: true,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SariDewi",
      roleId: roleInstructor!.id,
      companyCode: COMPANY,
      status: 1,
      isDeleted: 0,
      createdBy: SYSTEM,
      createdAt: new Date(),
      lastUpdatedBy: SYSTEM,
      updatedAt: new Date(),
    },
  });

  // ─── 3.1 Set password untuk instructors ────────────────────────────────────
  await createAccountWithPassword(instructor1.id, instructor1.email, "Instructor2026!");
  await createAccountWithPassword(instructor2.id, instructor2.email, "Instructor2026!");

  console.log(`   ✅ ${instructor1.name} | ${instructor2.name}`);

  // ─── 4. Seed Courses ──────────────────────────────────────────────────────
  console.log("\n4️⃣  Seeding Courses...");

  const coursesData = [
    {
      categoryId: catDesign!.id,
      instructorId: instructor1.id,
      title: "User Experience (UX) Design Fundamentals",
      slug: "ux-design-fundamentals",
      description: "Pelajari dasar-dasar UX Design dari nol. Mencakup design thinking, user research, wireframing, prototyping menggunakan Figma, dan cara mempresentasikan hasil desain kepada klien.",
      price: 149000,
      level: "Beginner",
      isPublished: true,
      isPopular: true,
      rating: 4.8,
      reviewCount: 120,
      tags: ["Figma", "UX", "Design Thinking", "Wireframe"],
      lessons: [
        { title: "Pengenalan UX Design & Design Thinking", duration: 15, order: 1, isFree: true },
        { title: "Memahami User Research & Persona", duration: 25, order: 2, isFree: true },
        { title: "User Journey Mapping", duration: 20, order: 3, isFree: false },
        { title: "Wireframing Dasar dengan Figma", duration: 35, order: 4, isFree: false },
        { title: "Prototyping Interaktif", duration: 40, order: 5, isFree: false },
        { title: "Usability Testing", duration: 30, order: 6, isFree: false },
        { title: "Visual Design Principles", duration: 25, order: 7, isFree: false },
        { title: "Design System & Components", duration: 35, order: 8, isFree: false },
        { title: "Accessibility dalam UX", duration: 20, order: 9, isFree: false },
        { title: "Portfolio & Presentasi ke Klien", duration: 30, order: 10, isFree: false },
        { title: "Career Path sebagai UX Designer", duration: 15, order: 11, isFree: false },
        { title: "Final Project Review", duration: 40, order: 12, isFree: false },
      ],
    },
    {
      categoryId: catBranding!.id,
      instructorId: instructor2.id,
      title: "Visual Design and Branding for Startups",
      slug: "visual-design-branding-startup",
      description: "Bangun identitas visual brand yang kuat untuk startup kamu. Pelajari prinsip desain grafis, color theory, typography, dan cara membuat brand guideline profesional.",
      price: 0,
      level: "Intermediate",
      isPublished: true,
      isPopular: false,
      rating: 4.9,
      reviewCount: 85,
      tags: ["Branding", "Logo Design", "Color Theory", "Typography"],
      lessons: [
        { title: "Apa itu Brand Identity?", duration: 12, order: 1, isFree: true },
        { title: "Color Theory untuk Brand", duration: 22, order: 2, isFree: true },
        { title: "Typography yang Berkarakter", duration: 18, order: 3, isFree: false },
        { title: "Logo Design Process", duration: 45, order: 4, isFree: false },
        { title: "Brand Guidelines Document", duration: 30, order: 5, isFree: false },
        { title: "Social Media Asset Design", duration: 25, order: 6, isFree: false },
        { title: "Pitch Deck yang Menarik", duration: 35, order: 7, isFree: false },
        { title: "Final Brand Presentation", duration: 33, order: 8, isFree: false },
      ],
    },
    {
      categoryId: catDev!.id,
      instructorId: instructor1.id,
      title: "Fullstack Web Development dengan Next.js 15",
      slug: "fullstack-nextjs-15",
      description: "Kuasai pengembangan web fullstack dari frontend hingga backend menggunakan Next.js 15, React 19, TypeScript, Prisma, dan PostgreSQL. Bangun aplikasi nyata siap production.",
      price: 299000,
      level: "Advanced",
      isPublished: true,
      isPopular: true,
      rating: 5.0,
      reviewCount: 210,
      tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "React"],
      lessons: [
        { title: "Setup Next.js 15 & TypeScript", duration: 20, order: 1, isFree: true },
        { title: "App Router & File-Based Routing", duration: 30, order: 2, isFree: true },
        { title: "Server Components vs Client Components", duration: 25, order: 3, isFree: false },
        { title: "Server Actions & Forms", duration: 35, order: 4, isFree: false },
        { title: "Database Setup dengan Prisma", duration: 40, order: 5, isFree: false },
        { title: "Authentication dengan Better Auth", duration: 45, order: 6, isFree: false },
        { title: "API Routes & REST Endpoints", duration: 30, order: 7, isFree: false },
        { title: "Image Upload dengan Cloudinary", duration: 25, order: 8, isFree: false },
        { title: "Middleware & Protected Routes", duration: 20, order: 9, isFree: false },
        { title: "State Management dengan Zustand", duration: 30, order: 10, isFree: false },
        { title: "Testing dengan Vitest & Playwright", duration: 40, order: 11, isFree: false },
        { title: "Performance Optimization", duration: 35, order: 12, isFree: false },
        { title: "CI/CD dengan GitHub Actions", duration: 25, order: 13, isFree: false },
        { title: "Deploy ke Vercel & Monitoring", duration: 30, order: 14, isFree: false },
        { title: "Final Project: Build SaaS App", duration: 120, order: 15, isFree: false },
      ],
    },
    {
      categoryId: catDev!.id,
      instructorId: instructor1.id,
      title: "Mobile App Development dengan React Native",
      slug: "mobile-react-native",
      description: "Buat aplikasi mobile cross-platform untuk iOS dan Android menggunakan React Native dan Expo. Navigasi, state management, integrasi API, dan publikasi ke App Store & Play Store.",
      price: 199000,
      level: "Intermediate",
      isPublished: true,
      isPopular: false,
      rating: 4.7,
      reviewCount: 67,
      tags: ["React Native", "Expo", "Mobile", "iOS", "Android"],
      lessons: [
        { title: "Intro React Native & Expo Setup", duration: 20, order: 1, isFree: true },
        { title: "Core Components & Styling", duration: 30, order: 2, isFree: true },
        { title: "Navigation dengan React Navigation", duration: 35, order: 3, isFree: false },
        { title: "State Management dengan Zustand", duration: 25, order: 4, isFree: false },
        { title: "Fetch Data & Axios", duration: 20, order: 5, isFree: false },
        { title: "AsyncStorage & Offline Mode", duration: 25, order: 6, isFree: false },
        { title: "Push Notifications", duration: 30, order: 7, isFree: false },
        { title: "Maps & Geolocation", duration: 30, order: 8, isFree: false },
        { title: "Animasi dengan Reanimated 3", duration: 40, order: 9, isFree: false },
        { title: "Build & Publish ke Store", duration: 35, order: 10, isFree: false },
      ],
    },
    {
      categoryId: catDataScience!.id,
      instructorId: instructor2.id,
      title: "Data Science & Machine Learning dengan Python",
      slug: "data-science-python",
      description: "Masuki dunia data science dengan Python — dari pandas, numpy, visualisasi data, hingga machine learning menggunakan scikit-learn dan TensorFlow.",
      price: 249000,
      level: "Intermediate",
      isPublished: true,
      isPopular: true,
      rating: 4.9,
      reviewCount: 156,
      tags: ["Python", "Machine Learning", "Pandas", "TensorFlow"],
      lessons: [
        { title: "Python untuk Data Science", duration: 25, order: 1, isFree: true },
        { title: "NumPy & Array Operations", duration: 30, order: 2, isFree: true },
        { title: "Pandas: Data Manipulation", duration: 40, order: 3, isFree: false },
        { title: "Visualisasi dengan Matplotlib & Seaborn", duration: 35, order: 4, isFree: false },
        { title: "Exploratory Data Analysis", duration: 45, order: 5, isFree: false },
        { title: "Supervised Learning: Regression", duration: 40, order: 6, isFree: false },
        { title: "Supervised Learning: Classification", duration: 40, order: 7, isFree: false },
        { title: "Neural Network Dasar", duration: 45, order: 8, isFree: false },
        { title: "Deploy Model dengan FastAPI", duration: 40, order: 9, isFree: false },
        { title: "Final Project: Prediksi Harga Rumah", duration: 90, order: 10, isFree: false },
      ],
    },
    {
      categoryId: catDesign!.id,
      instructorId: instructor2.id,
      title: "UI Design dengan Figma: Dari Nol ke Pro",
      slug: "ui-design-figma-pro",
      description: "Kuasai Figma dari level pemula sampai professional. Auto Layout, Component, Variants, Prototyping, dan cara bekerja dalam tim desain menggunakan fitur Figma terbaru.",
      price: 0,
      level: "Beginner",
      isPublished: true,
      isPopular: false,
      rating: 4.6,
      reviewCount: 93,
      tags: ["Figma", "UI Design", "Prototyping", "Auto Layout"],
      lessons: [
        { title: "Mengenal Interface Figma", duration: 15, order: 1, isFree: true },
        { title: "Frame, Layer & Group", duration: 20, order: 2, isFree: true },
        { title: "Typography & Text Styles", duration: 18, order: 3, isFree: false },
        { title: "Auto Layout Basics", duration: 25, order: 4, isFree: false },
        { title: "Components & Instances", duration: 30, order: 5, isFree: false },
        { title: "Variants & Properties", duration: 30, order: 6, isFree: false },
        { title: "Prototyping & Interactions", duration: 35, order: 7, isFree: false },
        { title: "Design Handoff ke Developer", duration: 20, order: 8, isFree: false },
        { title: "Portfolio Case Study Design", duration: 45, order: 9, isFree: false },
      ],
    },
  ];

  for (const { lessons, tags, ...courseFields } of coursesData) {
    // Ensure slug is unique – if a course with this slug already exists, append a random suffix
    let uniqueSlug = courseFields.slug as string;
    const existing = await prisma.course.findFirst({ where: { slug: uniqueSlug } });
    if (existing) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      uniqueSlug = `${uniqueSlug}-${randomSuffix}`;
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;
    }
  const totalMinutes = lessons.reduce((sum, l) => sum + l.duration, 0);

    const course = await prisma.course.upsert({
      where: { slug: courseFields.slug },
      update: {
        ...courseFields,
        categoryId: Number(courseFields.categoryId),
        price: String(courseFields.price),
        totalLessons: lessons.length,
        totalMinutes,
      },
      create: {
        ...courseFields,
        categoryId: Number(courseFields.categoryId),
        price: String(courseFields.price), // Convert to string untuk Decimal
        totalLessons: lessons.length,
        totalMinutes,
        companyCode: COMPANY,
        status: 1,
        isDeleted: 0,
        createdBy: SYSTEM,
        createdDate: new Date(),
        lastUpdatedBy: SYSTEM,
        lastUpdatedDate: new Date(),
        lessons: {
          create: lessons.map((l) => ({
            ...l,
            description: `Materi ke-${l.order} dari kursus ini`,
            companyCode: COMPANY,
            status: 1,
            isDeleted: 0,
            createdBy: SYSTEM,
            createdDate: new Date(),
            lastUpdatedBy: SYSTEM,
            lastUpdatedDate: new Date(),
          })),
        },
        tags: {
          create: tags.map((name) => ({
            name,
            companyCode: COMPANY,
            status: 1,
            isDeleted: 0,
            createdBy: SYSTEM,
            createdDate: new Date(),
            lastUpdatedBy: SYSTEM,
            lastUpdatedDate: new Date(),
          })),
        },
      },
    });

    console.log(`   ✅ "${course.title}" — ${lessons.length} lessons | ${totalMinutes} menit`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║        🎉 Seeding Selesai!            ║");
  console.log("╠═══════════════════════════════════════╣");
  console.log(`║  Roles      : 3 (admin, instructor, student)    `);
  console.log(`║  Categories : ${categoriesData.length}                                 `);
  console.log(`║  Instructors: 2                                  `);
  console.log(`║  Courses    : ${coursesData.length}                                 `);
  console.log("╚═══════════════════════════════════════╝\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
