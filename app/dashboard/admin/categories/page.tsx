import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CategoryCRUD from "@/components/dashboard/admin/categories/category-crud";

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  // Fetch all categories
  const categories = await db.category.findMany({
    where: { isDeleted: 0 },
    orderBy: { createdDate: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdBy: true,
      createdDate: true,
      lastUpdatedBy: true,
      lastUpdatedDate: true,
    },
  });

  // Convert dates to string for serialization to Client Component
  const formattedCategories = categories.map((c) => ({
    ...c,
    createdDate: c.createdDate.toISOString(),
    lastUpdatedDate: c.lastUpdatedDate.toISOString(),
  }));

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Master Kategori 🏷️</h1>
        <p className="text-slate-400 text-sm font-bold mt-1">
          Kelola kategori kursus yang tersedia di platform
        </p>
      </header>

      <CategoryCRUD initialData={formattedCategories} />
    </main>
  );
}
