"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getTodos() {
  const session = await getSession();
  if (!session) return [];

  return await db.todo.findMany({
    where: { 
        userId: session.user.id,
        isDeleted: 0 
    },
    orderBy: { createdDate: "desc" },
  });
}

export async function addTodo(task: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const todo = await db.todo.create({
    data: {
      userId: session.user.id,
      task,
      createdBy: session.user.name || "USER",
    },
  });

  revalidatePath("/dashboard/student");
  return todo;
}

export async function toggleTodo(id: number, isCompleted: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const todo = await db.todo.update({
    where: { id, userId: session.user.id },
    data: { 
        isCompleted,
        lastUpdatedBy: session.user.name || "USER",
    },
  });

  revalidatePath("/dashboard/student");
  return todo;
}

export async function deleteTodo(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.todo.update({
    where: { id, userId: session.user.id },
    data: { 
        isDeleted: 1,
        lastUpdatedBy: session.user.name || "USER",
    },
  });

  revalidatePath("/dashboard/student");
}
