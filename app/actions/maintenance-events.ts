'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { z } from 'zod'

// Maintenance event schema
const maintenanceEventSchema = z.object({
  equipmentId: z.string(),
  partId: z.string().optional().nullable(),
  eventType: z.enum(['SCHEDULED_MAINTENANCE', 'BREAKDOWN', 'REPAIR', 'REPLACEMENT', 'INSPECTION']),
  description: z.string().optional().nullable(),
  scheduledDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
})

type MaintenanceEventData = z.infer<typeof maintenanceEventSchema>

// Create a new maintenance event
export async function createMaintenanceEvent(data: MaintenanceEventData) {
  try {
    const validatedData = maintenanceEventSchema.parse(data)
    
    const maintenanceEvent = await db.maintenanceEvent.create({
      data: {
        ...validatedData,
        createdBy: 'System',
      },
    })

    revalidatePath('/equipments')
    return { success: true, data: maintenanceEvent }
  } catch (error) {
    console.error('Failed to create maintenance event:', error)
    return { success: false, error: 'Failed to create maintenance event' }
  }
}

// Add this function to your maintenance-events.ts file
export async function updateMaintenanceEvent(data: {
  id: string;
  equipmentId: string;
  eventType: 'SCHEDULED_MAINTENANCE' | 'BREAKDOWN' | 'REPAIR' | 'REPLACEMENT' | 'INSPECTION';
  description?: string | null;
  scheduledDate?: Date | null;
  completedDate?: Date | null;
  partId?: string | null;
}) {
  try {
    const result = await db.maintenanceEvent.update({
      where: {
        id: data.id,
      },
      data: {
        eventType: data.eventType,
        description: data.description,
        scheduledDate: data.scheduledDate,
        completedDate: data.completedDate,
        partId: data.partId,
      },
    });
    
    return result;
  } catch (error) {
    console.error('Error updating maintenance event:', error);
    throw new Error('Failed to update maintenance event');
  }
} 