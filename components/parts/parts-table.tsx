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
import { PartWithRelations } from '@/types/part'
import { MoreHorizontal, PencilIcon, Trash2Icon, PackageIcon, ShoppingCartIcon, ChevronDown, ChevronUp, InfoIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'

interface PartsTableProps {
  parts: PartWithRelations[]
}

type SortField = 'name' | 'currentStock' | 'minimumStock'
type SortOrder = 'asc' | 'desc'

interface SortOption {
  field: SortField
  label: string
}

export default function PartsTable({ parts }: PartsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  
  // Filter parts based on the search query and stock level filter
  const filteredParts = parts.filter(part => {
    // Search filter
    const matchesSearch = 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.description && part.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Stock level filter
    let matchesStockFilter = true;
    if (stockFilter === 'low') {
      matchesStockFilter = part.currentStock <= part.minimumStock && part.currentStock > 0;
    } else if (stockFilter === 'out') {
      matchesStockFilter = part.currentStock === 0;
    }
    
    return matchesSearch && matchesStockFilter;
  });

  // Sort the filtered parts
  const sortedParts = [...filteredParts].sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier
      case 'currentStock':
        return (a.currentStock - b.currentStock) * modifier
      case 'minimumStock':
        return (a.minimumStock - b.minimumStock) * modifier
      default:
        return 0
    }
  })

  // Get stock status and render appropriate badge
  const getStockStatus = (part: PartWithRelations) => {
    if (part.currentStock === 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">اتمام موجودی</Badge>;
    } else if (part.currentStock <= part.minimumStock) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">موجودی کم</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">موجودی کافی</Badge>;
    }
  };

  // Action dropdown menu component (reused in both views)
  const ActionMenu = ({ part }: { part: PartWithRelations }) => (
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
          onClick={() => router.push(`/inventory/${part.id}`)}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          ویرایش
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => router.push(`/inventory/${part.id}/info`)}
        >
          <InfoIcon className="mr-2 h-4 w-4" />
          نمایش اطلاعات
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600">
          <Trash2Icon className="mr-2 h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Card renderer for mobile view
  const PartCard = ({ part }: { part: PartWithRelations }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <h3 className="font-medium">{part.name}</h3>
          <p className="text-sm text-muted-foreground">
            {part.description || 'بدون توضیحات'}
          </p>
        </div>
        {getStockStatus(part)}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">موجودی فعلی</span>
            <span>{part.currentStock} عدد</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">حداقل موجودی</span>
            <span>{part.minimumStock} عدد</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">تعداد تجهیزات مرتبط</span>
            <span>{part.equipmentParts.length} تجهیز</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">تعداد تأمین‌کنندگان</span>
            <span>{part.supplierParts.length} تأمین‌کننده</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <ActionMenu part={part} />
      </CardFooter>
    </Card>
  );

  const sortOptions: SortOption[] = [
    { field: 'name', label: 'نام (صعودی)' },
    { field: 'name', label: 'نام (نزولی)' },
    { field: 'currentStock', label: 'موجودی فعلی (صعودی)' },
    { field: 'currentStock', label: 'موجودی فعلی (نزولی)' },
    { field: 'minimumStock', label: 'حداقل موجودی (صعودی)' },
    { field: 'minimumStock', label: 'حداقل موجودی (نزولی)' },
  ]

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder]
    setSortField(field)
    setSortOrder(order)
  }

  // Add this function to handle navigation
  const handleAddPart = () => {
    router.push('/inventory/new')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Input
              placeholder="جستجوی قطعات..."
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
                  stockFilter === 'all' 
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStockFilter('all')}
              >
                همه
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  stockFilter === 'low' 
                    ? 'bg-yellow-100 text-yellow-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStockFilter('low')}
              >
                موجودی کم
              </Badge>
              <Badge
                className={`cursor-pointer transition-all ${
                  stockFilter === 'out' 
                    ? 'bg-red-100 text-red-800 font-bold ring-2 ring-offset-1 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setStockFilter('out')}
              >
                اتمام موجودی
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAddPart}>افزودن قطعه</Button>
          </div>
        </div>
        
        {/* Table view for larger screens */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام قطعه</TableHead>
                <TableHead className="text-right">توضیحات</TableHead>
                <TableHead className="text-right">موجودی فعلی</TableHead>
                <TableHead className="text-right">حداقل موجودی</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">تجهیزات مرتبط</TableHead>
                <TableHead className="w-[80px] text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    هیچ قطعه‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                sortedParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.description?.slice(0, 50) || 'ندارد'}{part.description && part.description.length > 50 ? '...' : ''}</TableCell>
                    <TableCell>{part.currentStock} عدد</TableCell>
                    <TableCell>{part.minimumStock} عدد</TableCell>
                    <TableCell>{getStockStatus(part)}</TableCell>
                    <TableCell>{part.equipmentParts.length > 0 ? `${part.equipmentParts.length} تجهیز` : 'بدون تجهیز'}</TableCell>
                    <TableCell>
                      <ActionMenu part={part} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Card view for mobile screens */}
        <div className="md:hidden">
          {sortedParts.length === 0 ? (
            <Card>
              <CardContent className="h-24 flex items-center justify-center">
                <p className="text-center text-muted-foreground">هیچ قطعه‌ای یافت نشد.</p>
              </CardContent>
            </Card>
          ) : (
            sortedParts.map((part) => (
              <Card key={part.id} className="mb-4">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <h3 className="font-medium">{part.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {part.description || 'بدون توضیحات'}
                    </p>
                  </div>
                  {getStockStatus(part)}
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">موجودی فعلی</span>
                      <span>{part.currentStock} عدد</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">حداقل موجودی</span>
                      <span>{part.minimumStock} عدد</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">تعداد تجهیزات مرتبط</span>
                      <span>{part.equipmentParts.length} تجهیز</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">تعداد تأمین‌کنندگان</span>
                      <span>{part.supplierParts.length} تأمین‌کننده</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-3">
                  <ActionMenu part={part} />
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 