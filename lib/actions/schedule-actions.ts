"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getStudentSchedule() {
  const session = await getSession();
  if (!session) return [];
  
  // Stub - schedule model doesn't exist
  // Return properly typed empty array
  return [] as { id: string; day: string; date: string; events: any[] }[];
}
