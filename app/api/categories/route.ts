import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: 0, status: 1 },
      orderBy: { name: "asc" }
    });

    // If no categories exist, create a default one
    if (categories.length === 0) {
      const defaultCat = await prisma.category.create({
        data: {
          name: "General",
          slug: "general",
        }
      });
      return NextResponse.json([defaultCat]);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
