import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <DataTableSkeleton columns={6} rows={10} />
    </div>
  )
} 