'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { OrderStatus } from "@prisma/client"

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

interface GetOrdersParams {
  status?: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  page?: number
  limit?: number
  supplierId?: string
  fromDate?: string
  toDate?: string
}

export async function getOrders({
  status,
  page = 1,
  limit = 10,
  supplierId,
  fromDate,
  toDate
}: GetOrdersParams = {}) {
  try {
    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where = {
      ...(status && { status }),
      ...(supplierId && { supplierId }),
      ...(fromDate && {
        orderDate: {
          gte: new Date(fromDate)
        }
      }),
      ...(toDate && {
        orderDate: {
          ...(fromDate ? { gte: new Date(fromDate) } : {}),
          lte: new Date(toDate)
        }
      })
    }

    // Get orders with related data
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              part: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          orderDate: 'desc'
        }
      }),
      db.order.count({ where })
    ])

    return {
      success: true,
      data: {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return { success: false, error }
  }
}

// Type for the return value of getOrderStatusData
export type OrderStatusData = Record<OrderStatus, number>

/**
 * Server action to fetch the count of orders by status
 * @returns A record with order statuses as keys and counts as values
 */
export async function getOrderStatusData(): Promise<OrderStatusData> {
  try {
    // Initialize the result object with all statuses set to 0
    const result: OrderStatusData = {
      PENDING: 0,
      APPROVED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    }

    // Get the count of orders for each status
    const orderCounts = await db.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Update the result with the actual counts
    for (const item of orderCounts) {
      result[item.status] = item._count.id
    }

    return result
  } catch (error) {
    console.error("Error fetching order status data:", error)
    throw new Error("Failed to fetch order status data")
  }
} 