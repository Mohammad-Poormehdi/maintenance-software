'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

const orderFormSchema = z.object({
  supplierId: z.string().min(1),
  orderItems: z.array(z.object({
    partId: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1),
  deliveryDate: z.string().optional(),
})

export async function createOrder(data: z.infer<typeof orderFormSchema>) {
  try {
    // Validate the input data
    const validatedData = orderFormSchema.parse(data)

    // Generate a unique order number (you can customize this format)
    const orderNumber = `ORD-${Date.now()}`

    // Create the order and its items in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create the main order
      const order = await tx.order.create({
        data: {
          orderNumber,
          supplierId: validatedData.supplierId,
          deliveryDate: validatedData.deliveryDate ? new Date(validatedData.deliveryDate) : null,
          orderItems: {
            create: validatedData.orderItems.map(item => ({
              partId: item.partId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      })
      return order
    })

    revalidatePath('/orders')
    return { success: true, data: order }
  } catch (error) {
    console.error('Failed to create order:', error)
    return { success: false, error: 'Failed to create order' }
  }
} 