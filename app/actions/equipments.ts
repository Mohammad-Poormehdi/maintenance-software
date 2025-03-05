'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { z } from 'zod'
import { debug } from 'console'

// Schema for equipment validation
const equipmentSchema = z.object({
  name: z.string().min(1),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  purchaseDate: z.date().optional().nullable(),
  status: z.enum(['HEALTHY', 'NEEDS_REPAIR', 'NEEDS_REPLACEMENT']).default('HEALTHY'),
})

// Create a new equipment
export async function createEquipment(data: z.infer<typeof equipmentSchema>) {
  const validatedData = equipmentSchema.parse(data)
  
  // Create new equipment
  const equipment = await db.equipment.create({
    data: validatedData,
  })
  
  revalidatePath('/equipments')
  
  return equipment
}

// Update an existing equipment
export async function updateEquipment(id: string, data: z.infer<typeof equipmentSchema>) {
  const validatedData = equipmentSchema.parse(data)
  
  // Update equipment
  const equipment = await db.equipment.update({
    where: { id },
    data: validatedData,
  })
  
  revalidatePath('/equipments')
  revalidatePath(`/equipments/${id}`)
  
  return equipment
}

// Delete an equipment
export async function deleteEquipment(id: string) {
  // Delete equipment
  await db.equipment.delete({
    where: { id },
  })
  
  revalidatePath('/equipments')
} 