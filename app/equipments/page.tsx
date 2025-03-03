import { Suspense } from 'react'
import { db } from '@/lib/db'
import EquipmentsTable from '@/components/equipments/equipments-table'
import { EquipmentWithRelations } from '@/types/equipment'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

export const metadata = {
  title: 'مدیریت تجهیزات',
  description: 'مشاهده و مدیریت تمام تجهیزات در سیستم',
}

async function getEquipments(): Promise<EquipmentWithRelations[]> {
  return await db.equipment.findMany({
    include: {
      equipmentParts: {
        include: {
          part: true,
        },
      },
      maintenanceEvents: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export default async function EquipmentsPage() {
  const equipments = await getEquipments()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت تجهیزات</h1>
        <p className="text-muted-foreground mt-2">
          مشاهده و مدیریت تمام تجهیزات در انبار شما.
        </p>
      </div>
      
      <Suspense fallback={<DataTableSkeleton columns={5} />}>
        <EquipmentsTable equipments={equipments} />
      </Suspense>
    </div>
  )
}
