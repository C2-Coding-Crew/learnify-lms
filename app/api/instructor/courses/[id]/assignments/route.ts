import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).roleId !== 2) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseId = parseInt(id);

    const assignments = await db.assignment.findMany({
      where: {
        courseId: courseId,
        isDeleted: 0,
      },
      orderBy: { createdDate: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[ASSIGNMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).roleId !== 2) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseId = parseInt(id);
    const body = await req.json();
    const { title, description, dueDate } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const assignment = await db.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate),
        createdBy: session.user.name,
        lastUpdatedBy: session.user.name,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
