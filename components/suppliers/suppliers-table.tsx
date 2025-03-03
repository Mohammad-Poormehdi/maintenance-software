'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { 
  MoreHorizontal, 
  PencilIcon, 
  Trash2Icon, 
  ExternalLinkIcon, 
  PackageIcon 
} from 'lucide-react'
import { SupplierWithRelations } from '@/app/suppliers/page'

interface SuppliersTableProps {
  suppliers: SupplierWithRelations[]
}

export default function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier => {
    return (
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // Action dropdown menu component (reused in both views)
  const ActionMenu = ({ supplier }: { supplier: SupplierWithRelations }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">باز کردن منو</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer flex items-center">
          <PencilIcon className="mr-2 h-4 w-4" />
          ویرایش
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center">
          <PackageIcon className="mr-2 h-4 w-4" />
          سفارش جدید
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600">
          <Trash2Icon className="mr-2 h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Card renderer for mobile view
  const SupplierCard = ({ supplier }: { supplier: SupplierWithRelations }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <h3 className="font-medium">{supplier.name}</h3>
          <p className="text-sm text-muted-foreground">
            {supplier.contactPerson ? `شخص رابط: ${supplier.contactPerson}` : 'بدون شخص رابط'}
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {supplier.supplierParts.length} قطعه
        </Badge>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">ایمیل</span>
            <span>{supplier.email || 'ندارد'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">تلفن</span>
            <span dir="ltr" className="text-right">{supplier.phone || 'ندارد'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <ActionMenu supplier={supplier} />
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            placeholder="جستجوی تامین‌کنندگان..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button>افزودن تامین‌کننده</Button>
      </div>
      
      {/* Table view for larger screens */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام شرکت</TableHead>
              <TableHead className="text-right">شخص رابط</TableHead>
              <TableHead className="text-right">ایمیل</TableHead>
              <TableHead className="text-right">تلفن</TableHead>
              <TableHead className="text-right">تعداد قطعات</TableHead>
              <TableHead className="w-[80px] text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  هیچ تامین‌کننده‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson || 'ندارد'}</TableCell>
                  <TableCell>
                    {supplier.email ? (
                      <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        {supplier.email}
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      'ندارد'
                    )}
                  </TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {supplier.phone ? (
                      <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline flex items-center gap-1 justify-end">
                        {supplier.phone}
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      'ندارد'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {supplier.supplierParts.length} قطعه
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionMenu supplier={supplier} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Card view for mobile screens */}
      <div className="md:hidden">
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="h-24 flex items-center justify-center">
              <p className="text-center text-muted-foreground">هیچ تامین‌کننده‌ای یافت نشد.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))
        )}
      </div>
    </div>
  )
} 