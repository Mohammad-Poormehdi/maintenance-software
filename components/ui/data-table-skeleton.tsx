import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableSkeletonProps {
  columns: number
  rows?: number
}

export function DataTableSkeleton({
  columns,
  rows = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columns)
              .fill(null)
              .map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-6 w-full max-w-[100px]" />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rows)
            .fill(null)
            .map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array(columns)
                  .fill(null)
                  .map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
} 