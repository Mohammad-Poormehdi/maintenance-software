import { Suspense } from 'react'
import { OrderForm } from '@/components/orders/order-form'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface OrderPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await  params
  
  // Fetch suppliers data
  const suppliers = await db.supplier.findMany({
    select: { 
      id: true, 
      name: true 
    }
  })
  
  // Fetch all parts with their supplier relationships and include the price
  const supplierParts = await db.supplierPart.findMany({
    select: {
      supplierId: true,
      price: true, // Include the price field
      part: {
        select: { 
          id: true, 
          name: true 
        }
      }
    }
  })

  // Group parts by supplier and include price information
  const partsMap = supplierParts.reduce((acc, item) => {
    if (!acc[item.supplierId]) {
      acc[item.supplierId] = [];
    }
    // Include the price from the SupplierPart in the part object
    acc[item.supplierId].push({
      ...item.part,
      price: item.price
    });
    return acc;
  }, {} as Record<string, { id: string, name: string, price: number }[]>);

  // Also fetch all parts for initial state
  const allParts = await db.part.findMany({
    select: { id: true, name: true }
  })

  // Check if we're editing an existing order
  let existingOrder = null
  if (orderId !== 'new') {
    const dbOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            part: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })
    
    if (!dbOrder) {
      notFound()
    }
    
    // Format the date to string for the form component
    existingOrder = {
      ...dbOrder,
      deliveryDate: dbOrder.deliveryDate ? dbOrder.deliveryDate.toISOString() : null
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderForm 
          suppliers={suppliers} 
          supplierParts={partsMap}
          allParts={allParts}
          existingOrder={existingOrder}
          isEditing={orderId !== 'new'} 
        />
      </Suspense>
    </div>
  )
} 