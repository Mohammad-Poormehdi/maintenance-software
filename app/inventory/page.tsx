import { Suspense } from 'react'
import { db } from '@/lib/db'
import PartsTable from '@/components/parts/parts-table'
import { PartWithRelations } from '@/types/part'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

export const metadata = {
  title: 'مدیریت قطعات',
  description: 'مشاهده و مدیریت تمام قطعات در انبار',
}

async function getParts(): Promise<PartWithRelations[]> {
  return await db.part.findMany({
    include: {
      supplierParts: {
        include: {
          supplier: true,
        },
      },
      equipmentParts: {
        include: {
          equipment: true,
        },
      },
      maintenanceEvents: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function InventoryPage() {
  const parts = await getParts()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت قطعات</h1>
        <p className="text-muted-foreground mt-2">
          مشاهده و مدیریت تمام قطعات در انبار شما.
        </p>
      </div>
      
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <PartsTable parts={parts} />
      </Suspense>
    </div>
  )
}
