import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const todos = await db.todo.findMany({
    where: { userId: session.user.id, isDeleted: 0 },
    orderBy: { createdDate: "desc" },
  });

  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { task } = await req.json();
    if (!task) return new NextResponse("Task is required", { status: 400 });

    const todo = await db.todo.create({
      data: {
        userId: session.user.id,
        task,
        createdBy: session.user.name,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id, isCompleted } = await req.json();
    if (!id) return new NextResponse("ID is required", { status: 400 });

    const todo = await db.todo.update({
      where: { id, userId: session.user.id },
      data: { isCompleted },
    });

    return NextResponse.json(todo);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("ID is required", { status: 400 });

    await db.todo.update({
      where: { id: Number(id), userId: session.user.id },
      data: { isDeleted: 1 },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
