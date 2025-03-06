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

interface OrderData {
  supplierId: string
  orderItems: {
    id?: string
    partId: string
    quantity: number
    unitPrice: number
  }[]
  deliveryDate?: string
}

export async function createOrder(data: OrderData) {
  try {
    // Generate a unique order number (you might have a different system)
    const orderNumber = `ORD-${Date.now()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        orderItems: {
          create: data.orderItems.map(item => ({
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      }
    })

    revalidatePath('/orders')
    return { success: true, order }
  } catch (error) {
    console.error('Failed to create order:', error)
    return { success: false, error }
  }
}

export async function updateOrder(orderId: string, data: OrderData) {
  try {
    // First, get existing order items
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })
    
    if (!existingOrder) {
      throw new Error('Order not found')
    }

    // Update the order basic info
    await db.order.update({
      where: { id: orderId },
      data: {
        supplierId: data.supplierId,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      }
    })
    
    // Process order items - create new ones, update existing ones
    for (const item of data.orderItems) {
      if (item.id) {
        // Update existing item
        await db.orderItem.update({
          where: { id: item.id },
          data: {
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        })
      } else {
        // Create new item
        await db.orderItem.create({
          data: {
            orderId,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        })
      }
    }
    
    // Delete items that are no longer in the form
    const existingItemIds = existingOrder.orderItems.map(item => item.id)
    const updatedItemIds = data.orderItems.filter(i => i.id).map(i => i.id)
    
    const itemsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id))
    
    if (itemsToDelete.length > 0) {
      await db.orderItem.deleteMany({
        where: {
          id: { in: itemsToDelete }
        }
      })
    }

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Failed to update order:', error)
    return { success: false, error }
  }
} 