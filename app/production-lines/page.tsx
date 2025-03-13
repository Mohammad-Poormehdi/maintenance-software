import { Suspense } from 'react'
import { db } from '@/lib/db'
import ProductionLinesTable from '@/components/production-lines/production-lines-table'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ProductionLineWithRelations } from '@/types/production-line'

export const metadata = {
  title: 'مدیریت خطوط تولید',
  description: 'مشاهده و مدیریت تمام خطوط تولید',
}

async function getProductionLines(): Promise<ProductionLineWithRelations[]> {
  return await db.productionLine.findMany({
    include: {
      equipment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function ProductionLinesPage() {
  const productionLines = await getProductionLines()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت خطوط تولید</h1>
        <p className="text-muted-foreground mt-2">
          مشاهده و مدیریت تمام خطوط تولید شما.
        </p>
      </div>
      
      <Suspense fallback={<DataTableSkeleton columns={5} />}>
        <ProductionLinesTable productionLines={productionLines} />
      </Suspense>
    </div>
  )
}
