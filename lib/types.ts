import { MaintenanceSchedule } from "@prisma/client";

export interface MaintenanceScheduleWithStatus extends MaintenanceSchedule {
  status: "overdue" | "due-soon" | "upcoming";
  daysUntilDue: number;
} 