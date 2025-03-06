'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { formatPersianDate } from '@/lib/utils'
import { MoreHorizontal, PencilIcon, Trash2Icon, FileTextIcon, TruckIcon } from 'lucide-react'

// Define status options with colors
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'در انتظار', color: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white' },
  { value: 'APPROVED', label: 'تایید شده', color: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' },
  { value: 'SHIPPED', label: 'ارسال شده', color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-white' },
  { value: 'DELIVERED', label: 'تحویل شده', color: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-white' },
  { value: 'CANCELLED', label: 'لغو شده', color: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-white' },
]

interface OrdersTableProps {
  orders: any[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const router = useRouter()
  
  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(order.status);
    
    return matchesSearch && matchesStatus;
  });

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  }

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    if (statusOption) {
      return (
        <Badge 
          className={`${statusOption.color} hover:bg-opacity-90 dark:hover:bg-opacity-90`}
        >
          {statusOption.label}
        </Badge>
      );
    }
    return <Badge>{status}</Badge>
  }

  // Calculate total order value
  const calculateOrderTotal = (order: any) => {
    return order.orderItems.reduce((total: number, item: any) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  // Action dropdown menu component
  const ActionMenu = ({ order }: { order: any }) => (
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
          onClick={() => router.push(`/orders/${order.id}`)}
        >
          <PencilIcon className="mr-2 h-4 w-4" />
          ویرایش
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center text-red-600">
          <Trash2Icon className="mr-2 h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Card renderer for mobile view
  const OrderCard = ({ order }: { order: any }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <h3 className="font-medium">سفارش #{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {order.supplier.name}
          </p>
        </div>
        {renderStatusBadge(order.status)}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">تاریخ سفارش</span>
            <span>{formatPersianDate(order.orderDate)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">تحویل</span>
            <span>{order.deliveryDate ? formatPersianDate(order.deliveryDate) : 'تعیین نشده'}</span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-muted-foreground">مبلغ کل</span>
            <span className="font-medium">{new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR' }).format(calculateOrderTotal(order))}</span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-muted-foreground">تعداد اقلام</span>
            <span>{order.orderItems.length} قلم</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <ActionMenu order={order} />
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            placeholder="جستجوی سفارشات..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(option => (
              <Badge
                key={option.value}
                className={`cursor-pointer  transition-all ${
                  selectedStatuses.includes(option.value) 
                    ? `${option.color} font-bold ring-2 ring-offset-1 ring-primary/40 shadow-sm`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => toggleStatusFilter(option.value)}
              >
                {selectedStatuses.includes(option.value) && (
                  <span className="mr-1">✓</span>
                )}
                {option.label}
              </Badge>
            ))}
            
            {selectedStatuses.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setSelectedStatuses([])}
              >
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </div>
        
        <Button onClick={() => router.push('/orders/new')}>سفارش جدید</Button>
      </div>
      
      {/* Table view for larger screens */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">شماره سفارش</TableHead>
              <TableHead className="text-right">تامین کننده</TableHead>
              <TableHead className="text-right">تاریخ سفارش</TableHead>
              <TableHead className="text-right">تاریخ تحویل</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">مبلغ کل</TableHead>
              <TableHead className="w-[80px] text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  هیچ سفارشی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier.name}</TableCell>
                  <TableCell>{formatPersianDate(order.orderDate)}</TableCell>
                  <TableCell>{order.deliveryDate ? formatPersianDate(order.deliveryDate) : 'تعیین نشده'}</TableCell>
                  <TableCell>{renderStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR' }).format(calculateOrderTotal(order))}</TableCell>
                  <TableCell>
                    <ActionMenu order={order} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Card view for mobile screens */}
      <div className="md:hidden">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="h-24 flex items-center justify-center">
              <p className="text-center text-muted-foreground">هیچ سفارشی یافت نشد.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
} 