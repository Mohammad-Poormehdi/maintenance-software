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
import { ProductionLineWithRelations } from '@/types/production-line'
import { MoreHorizontal, PencilIcon, Trash2Icon, CogIcon, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { ProductionLineStatus } from '@prisma/client'

interface ProductionLinesTableProps {
  productionLines: ProductionLineWithRelations[]
}

type SortField = 'name' | 'status' | 'capacity'
type SortOrder = 'asc' | 'desc'

interface SortOption {
  field: SortField
  label: string
}

export default function ProductionLinesTable({ productionLines }: ProductionLinesTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProductionLineStatus>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  
  // Filter production lines based on the search query and status filter
  const filteredProductionLines = productionLines.filter(line => {
    // Search filter
    const matchesSearch = 
      line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (line.description && line.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    let matchesStatusFilter = true;
    if (statusFilter !== 'all') {
      matchesStatusFilter = line.status === statusFilter;
    }
    
    return matchesSearch && matchesStatusFilter;
  });

  // Sort the filtered production lines
  const sortedProductionLines = [...filteredProductionLines].sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier
      case 'status':
        return a.status.localeCompare(b.status) * modifier
      case 'capacity':
        const capacityA = a.capacity || 0
        const capacityB = b.capacity || 0
        return (capacityA - capacityB) * modifier
      default:
        return 0
    }
  })

  // Get status badge for production line
  const getStatusBadge = (status: ProductionLineStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">فعال</Badge>;
      case 'REDUCED_CAPACITY':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">ظرفیت کاهش یافته</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">در حال تعمیر</Badge>;
      case 'OFFLINE':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">غیرفعال</Badge>;
      default:
        return <Badge>نامشخص</Badge>;
    }
  };

  // Action dropdown menu component
  const ActionMenu = ({ productionLine }: { productionLine: ProductionLineWithRelations }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">باز کردن منو</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => router.push(`/production-lines/${productionLine.id}`)}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          ویرایش
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center">
          <CogIcon className="mr-2 h-4 w-4" />
          مدیریت تجهیزات
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600">
          <Trash2Icon className="mr-2 h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Sort options
  const sortOptions: SortOption[] = [
    { field: 'name', label: 'نام (صعودی)' },
    { field: 'name', label: 'نام (نزولی)' },
    { field: 'status', label: 'وضعیت (صعودی)' },
    { field: 'status', label: 'وضعیت (نزولی)' },
    { field: 'capacity', label: 'ظرفیت (صعودی)' },
    { field: 'capacity', label: 'ظرفیت (نزولی)' },
  ]

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder]
    setSortField(field)
    setSortOrder(order)
  }

  // Handle adding a new production line
  const handleAddProductionLine = () => {
    router.push('/production-lines/new')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Input
              placeholder="جستجوی خطوط تولید..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="مرتب‌سازی بر اساس" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem 
                    key={`${option.field}-${option.label.includes('نزولی') ? 'desc' : 'asc'}`}
                    value={`${option.field}-${option.label.includes('نزولی') ? 'desc' : 'asc'}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2 flex-wrap">
              <Badge
                className={`cursor-pointer transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStatusFilter('all')}
              >
                همه
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  statusFilter === 'OPERATIONAL' 
                    ? 'bg-green-100 text-green-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStatusFilter('OPERATIONAL')}
              >
                فعال
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  statusFilter === 'REDUCED_CAPACITY' 
                    ? 'bg-yellow-100 text-yellow-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStatusFilter('REDUCED_CAPACITY')}
              >
                ظرفیت کاهش یافته
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  statusFilter === 'MAINTENANCE' 
                    ? 'bg-blue-100 text-blue-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStatusFilter('MAINTENANCE')}
              >
                در حال تعمیر
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  statusFilter === 'OFFLINE' 
                    ? 'bg-red-100 text-red-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStatusFilter('OFFLINE')}
              >
                غیرفعال
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAddProductionLine}>افزودن خط تولید</Button>
          </div>
        </div>
        
        {/* Table view for larger screens */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام خط تولید</TableHead>
                <TableHead className="text-right">توضیحات</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">ظرفیت</TableHead>
                <TableHead className="text-right">تعداد تجهیزات</TableHead>
                <TableHead className="w-[80px] text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProductionLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    هیچ خط تولیدی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                sortedProductionLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.name}</TableCell>
                    <TableCell>{line.description?.slice(0, 50) || 'ندارد'}{line.description && line.description.length > 50 ? '...' : ''}</TableCell>
                    <TableCell>{getStatusBadge(line.status)}</TableCell>
                    <TableCell>{line.capacity ? `${line.capacity}` : 'نامشخص'}</TableCell>
                    <TableCell>{line.equipment.length > 0 ? `${line.equipment.length} تجهیز` : 'بدون تجهیز'}</TableCell>
                    <TableCell>
                      <ActionMenu productionLine={line} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Card view for mobile screens */}
        <div className="md:hidden">
          {sortedProductionLines.length === 0 ? (
            <Card>
              <CardContent className="h-24 flex items-center justify-center">
                <p className="text-center text-muted-foreground">هیچ خط تولیدی یافت نشد.</p>
              </CardContent>
            </Card>
          ) : (
            sortedProductionLines.map((line) => (
              <Card key={line.id} className="mb-4">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <h3 className="font-medium">{line.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {line.description || 'بدون توضیحات'}
                    </p>
                  </div>
                  {getStatusBadge(line.status)}
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">ظرفیت</span>
                      <span>{line.capacity ? `${line.capacity}` : 'نامشخص'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">تعداد تجهیزات</span>
                      <span>{line.equipment.length} تجهیز</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-3">
                  <ActionMenu productionLine={line} />
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 