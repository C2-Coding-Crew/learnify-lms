"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getStudentResources() {
  const session = await getSession();
  if (!session) return [];
  
  // Stub - resource model doesn't exist
  return [];
}

export async function getStudentRecordings() {
  const session = await getSession();
  if (!session) return [];
  
  // Stub - resource model doesn't exist
  return [];
}
