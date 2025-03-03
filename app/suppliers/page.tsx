import { Suspense } from 'react'
import { db } from '@/lib/db'
import SuppliersTable from '@/components/suppliers/suppliers-table'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

export const metadata = {
  title: 'مدیریت تامین‌کنندگان',
  description: 'مشاهده و مدیریت تمام تامین‌کنندگان در سیستم',
}

export interface SupplierWithRelations {
  id: string
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  supplierParts: {
    id: string
    partId: string
    price: number
    leadTime: number | null
    isPreferred: boolean
    part: {
      id: string
      name: string
    }
  }[]
  orders: {
    id: string
    orderNumber: string
    status: string
  }[]
  createdAt: Date
  updatedAt: Date
}

async function getSuppliers(): Promise<SupplierWithRelations[]> {
  return await db.supplier.findMany({
    include: {
      supplierParts: {
        include: {
          part: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت تامین‌کنندگان</h1>
        <p className="text-muted-foreground mt-2">
          مشاهده و مدیریت تمام تامین‌کنندگان در سیستم شما.
        </p>
      </div>
      
      <Suspense fallback={<DataTableSkeleton columns={5} />}>
        <SuppliersTable suppliers={suppliers} />
      </Suspense>
    </div>
  )
}
