'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const partFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  currentStock: z.number().min(0),
  minimumStock: z.number().min(0),
})

export async function createPart(data: z.infer<typeof partFormSchema>) {
  try {
    const part = await db.part.create({
      data: {
        name: data.name,
        description: data.description,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
      },
    })

    revalidatePath('/inventory')
    return part
  } catch (error) {
    console.error("Failed to create part", error)
    throw new Error('Failed to create part')
  }
}

export async function bulkDeleteParts(partIds: string[]) {
  try {
    await db.part.deleteMany({
      where: {
        id: {
          in: partIds
        }
      }
    })
    
    revalidatePath('/inventory')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete parts:', error)
    return { success: false, error: 'Failed to delete parts' }
  }
}

export async function updatePart(
  id: string,
  data: {
    name: string
    description?: string
    currentStock:   number
    minimumStock:    number
  }
) {
  const currentStock = typeof data.currentStock === 'string' 
    ? parseInt(data.currentStock) 
    : data.currentStock

  const minimumStock = typeof data.minimumStock === 'string'
    ? parseInt(data.minimumStock)
    : data.minimumStock

  const part = await db.part.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      currentStock,
      minimumStock,
    },
  })

  revalidatePath('/inventory')
  return part
}

export async function getPart(partId: string) {
  const part = await db.part.findUnique({
    where: { id: partId },
    include: {
      equipmentParts: {
        include: {
          equipment: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
      supplierParts: {
        include: {
          supplier: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  
  return part;
}

export async function getParts() {
  try {
    const parts = await db.part.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return parts
  } catch (error) {
    console.error('Failed to fetch parts:', error)
    throw new Error('Failed to fetch parts')
  }
} 