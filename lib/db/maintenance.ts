import { db } from "@/lib/db";
import { addDays } from "date-fns";

export async function getMaintenanceSchedules() {
  try {
    const schedules = await db.maintenanceSchedule.findMany({
      orderBy: {
        nextDue: "asc",
      },
    });
    
    // Calculate status based on due date
    return schedules.map(schedule => {
      const today = new Date();
      const dueDate = new Date(schedule.nextDue);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: "overdue" | "due-soon" | "upcoming" = "upcoming";
      if (daysUntilDue < 0) {
        status = "overdue";
      } else if (daysUntilDue <= 7) {
        status = "due-soon";
      }
      
      return {
        ...schedule,
        status,
        daysUntilDue,
      };
    });
  } catch (error) {
    console.error("Failed to fetch maintenance schedules:", error);
    return [];
  }
}

export async function getCompletedMaintenanceEvents() {
  try {
    return await db.maintenanceEvent.findMany({
      where: {
        completedDate: { not: null },
      },
      orderBy: {
        completedDate: "desc",
      },
      include: {
        equipment: true,
        part: true,
      },
      take: 50, // Limit to recent events
    });
  } catch (error) {
    console.error("Failed to fetch completed maintenance events:", error);
    return [];
  }
}

export async function updateLastExecuted(id: string) {
  try {
    const schedule = await db.maintenanceSchedule.findUnique({
      where: { id },
    });
    
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    
    const now = new Date();
    const nextDue = addDays(now, schedule.frequency);
    
    // Update the maintenance schedule
    const updatedSchedule = await db.maintenanceSchedule.update({
      where: { id },
      data: {
        lastExecuted: now,
        nextDue,
      },
    });
    
    // Get the first equipment to associate with this maintenance event
    // In a real application, you would want to know which equipment this schedule is for
    const equipment = await db.equipment.findFirst();
    
    if (!equipment) {
      throw new Error("No equipment found to associate with maintenance event");
    }
    
    // Create a maintenance event to record this completion
    await db.maintenanceEvent.create({
      data: {
        eventType: "SCHEDULED_MAINTENANCE",
        description: `Completed scheduled maintenance: ${schedule.name}`,
        completedDate: now,
        scheduledDate: new Date(schedule.nextDue),
        createdBy: "system",
        equipment: {
          connect: { id: equipment.id }
        }
      }
    });
    
    return updatedSchedule;
  } catch (error) {
    console.error("Failed to update maintenance schedule:", error);
    throw error;
  }
} 