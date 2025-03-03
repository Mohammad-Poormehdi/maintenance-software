"use server";

import { updateLastExecuted } from "@/lib/db/maintenance";
import { revalidatePath } from "next/cache";

export async function updateScheduleAction(id: string) {
  await updateLastExecuted(id);
  revalidatePath("/maintenance-schedule");
  return { success: true };
} 