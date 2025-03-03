import { Suspense } from 'react'
import { db } from '@/lib/db'
import OrdersTable from '@/components/orders/orders-table'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

export const metadata = {
  title: 'مدیریت سفارشات',
  description: 'مشاهده و مدیریت تمام سفارشات در سیستم',
}

async function getOrders() {
  return await db.order.findMany({
    include: {
      supplier: true,
      orderItems: {
        include: {
          part: true,
        },
      },
    },
    orderBy: {
      orderDate: 'desc',
    },
  })
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت سفارشات</h1>
        <p className="text-muted-foreground mt-2">
          مشاهده و مدیریت تمام سفارشات خرید قطعات.
        </p>
      </div>
      
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <OrdersTable orders={orders} />
      </Suspense>
    </div>
  )
}
