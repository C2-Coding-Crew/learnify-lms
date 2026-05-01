"use server";

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
  
  // Stub - todo model doesn't exist
  return [];
}

export async function addTodo(task: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  // Stub - todo model doesn't exist
  return { id: 0, task, isCompleted: false };
}

export async function toggleTodo(id: number, isCompleted: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  // Stub - todo model doesn't exist
  return { id, isCompleted };
}

export async function deleteTodo(id: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  // Stub - todo model doesn't exist
  revalidatePath("/dashboard/student");
}
