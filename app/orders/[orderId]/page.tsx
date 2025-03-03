import { Suspense } from 'react'
import { OrderForm } from '@/components/orders/order-form'
import { db } from '@/lib/db'

export default async function NewOrderPage() {
  // Fetch suppliers and parts data
  const suppliers = await db.supplier.findMany({
    select: { id: true, name: true }
  })
  
  const parts = await db.part.findMany({
    select: { id: true, name: true }
  })

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderForm suppliers={suppliers} parts={parts} />
      </Suspense>
    </div>
  )
} 