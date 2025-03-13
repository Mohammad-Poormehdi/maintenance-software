import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PartPriceChart } from '@/components/parts/part-price-chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ArrowRight, Edit } from 'lucide-react'
import { getPart } from '@/app/actions/parts'

// Define types for part-related data
interface Equipment {
  id: string
  name: string
  status: 'HEALTHY' | 'NEEDS_REPAIR' | 'NEEDS_REPLACEMENT'
}

interface EquipmentPart {
  id: string
  equipment: Equipment
  quantity: number
}

interface Supplier {
  name: string
}

interface SupplierPart {
  id: string
  supplier: Supplier
  price: number
  leadTime: number | null
  isPreferred: boolean
}

interface Part {
  id: string
  name: string
  description: string | null
  currentStock: number
  minimumStock: number
  equipmentParts?: EquipmentPart[]
  supplierParts?: SupplierPart[]
}

interface PartInfoPageProps {
  params: Promise<{
    partId: string
  }>
}

export default async function PartInfoPage({ params }: PartInfoPageProps) {
  const { partId } = await params
  const part = await getPart(partId)

  if (!part) {
    notFound()
  }

  // Class for right-aligned text in tables
  const tableHeadClass = "text-right"
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/inventory">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{part.name}</h1>
        </div>
        <Link href={`/inventory/${part.id}`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            ویرایش قطعه
          </Button>
        </Link>
      </div>

      {/* Basic part information */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات اصلی</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">نام قطعه</dt>
              <dd className="mt-1">{part.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">توضیحات</dt>
              <dd className="mt-1">{part.description || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">موجودی فعلی</dt>
              <dd className="mt-1">{part.currentStock}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">حداقل موجودی</dt>
              <dd className="mt-1">{part.minimumStock}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">وضعیت</dt>
              <dd className="mt-1">
                {part.currentStock < part.minimumStock ? (
                  <span className="text-red-500">نیاز به سفارش</span>
                ) : (
                  <span className="text-green-500">موجودی کافی</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Equipment parts section */}
      <Card>
        <CardHeader>
          <CardTitle>تجهیزات استفاده کننده</CardTitle>
        </CardHeader>
        <CardContent>
          {part.equipmentParts && part.equipmentParts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={tableHeadClass}>نام تجهیز</TableHead>
                  <TableHead className={tableHeadClass}>تعداد مورد نیاز</TableHead>
                  <TableHead className={tableHeadClass}>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {part.equipmentParts.map((equipmentPart: EquipmentPart) => (
                  <TableRow key={equipmentPart.id}>
                    <TableCell className="text-right">{equipmentPart.equipment.name}</TableCell>
                    <TableCell className="text-right">{equipmentPart.quantity}</TableCell>
                    <TableCell className="text-right">
                      {equipmentPart.equipment.status === 'HEALTHY' && 'سالم'}
                      {equipmentPart.equipment.status === 'NEEDS_REPAIR' && 'نیاز به تعمیر'}
                      {equipmentPart.equipment.status === 'NEEDS_REPLACEMENT' && 'نیاز به تعویض'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              این قطعه در هیچ تجهیزی استفاده نشده است
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supplier prices section */}
      <Card>
        <CardHeader>
          <CardTitle>مقایسه قیمت تامین‌کنندگان</CardTitle>
        </CardHeader>
        <CardContent>
          {part.supplierParts && part.supplierParts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={tableHeadClass}>تامین‌کننده</TableHead>
                  <TableHead className={tableHeadClass}>قیمت (ریال)</TableHead>
                  <TableHead className={tableHeadClass}>زمان تحویل (روز)</TableHead>
                  <TableHead className={tableHeadClass}>تامین‌کننده منتخب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {part.supplierParts.map((supplierPart: SupplierPart) => (
                  <TableRow key={supplierPart.id}>
                    <TableCell className="text-right">{supplierPart.supplier.name}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('fa-IR').format(supplierPart.price)}</TableCell>
                    <TableCell className="text-right">{supplierPart.leadTime ?? '-'}</TableCell>
                    <TableCell className="text-right">{supplierPart.isPreferred ? '✓' : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              هیچ تامین‌کننده‌ای برای این قطعه ثبت نشده است
            </p>
          )}
        </CardContent>
      </Card>

      {/* Price chart */}
      <PartPriceChart partId={part.id} />
    </div>
  )
}
