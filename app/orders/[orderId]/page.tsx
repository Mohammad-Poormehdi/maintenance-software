import { Suspense } from 'react'
import { OrderForm } from '@/components/orders/order-form'
import { db } from '@/lib/db'

export default async function NewOrderPage() {
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

  return (
    <div className="max-w-4xl mx-auto mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderForm 
          suppliers={suppliers} 
          supplierParts={partsMap}
          allParts={allParts} 
        />
      </Suspense>
    </div>
  )
} 