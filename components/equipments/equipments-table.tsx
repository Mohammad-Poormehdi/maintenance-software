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
import { EquipmentWithRelations } from '@/types/equipment'
import { MoreHorizontal, PencilIcon, Trash2Icon, AlertCircleIcon, WrenchIcon, FilterIcon } from 'lucide-react'

// Define status options
const STATUS_OPTIONS = [
  { value: 'HEALTHY', label: 'سالم', color: 'bg-green-100 text-green-800' },
  { value: 'NEEDS_REPAIR', label: 'نیاز به تعمیر', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NEEDS_REPLACEMENT', label: 'نیاز به تعویض', color: 'bg-red-100 text-red-800' },
]

interface EquipmentsTableProps {
  equipments: EquipmentWithRelations[]
}

export default function EquipmentsTable({ equipments }: EquipmentsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  
  // Filter equipments based on the search query and status filter
  const filteredEquipments = equipments.filter(equipment => {
    // Search filter
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (equipment.serialNumber && equipment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (equipment.location && equipment.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(equipment.status);
    
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
    switch(status) {
      case 'HEALTHY':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">سالم</Badge>
      case 'NEEDS_REPAIR':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">نیاز به تعمیر</Badge>
      case 'NEEDS_REPLACEMENT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">نیاز به تعویض</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Action dropdown menu component (reused in both views)
  const ActionMenu = ({ equipment }: { equipment: EquipmentWithRelations }) => (
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
          onClick={() => router.push(`/equipments/${equipment.id}`)}
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
  const EquipmentCard = ({ equipment }: { equipment: EquipmentWithRelations }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <h3 className="font-medium">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground">
            {equipment.serialNumber ? `شماره سریال: ${equipment.serialNumber}` : 'بدون شماره سریال'}
          </p>
        </div>
        {renderStatusBadge(equipment.status)}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">مکان</span>
            <span>{equipment.location || 'ندارد'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">تاریخ خرید</span>
            <span>{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('fa-IR') : 'ندارد'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <ActionMenu equipment={equipment} />
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            placeholder="جستجوی تجهیزات..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(option => (
              <Badge
                key={option.value}
                className={`cursor-pointer transition-all ${
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
        
        <Button onClick={() => router.push('/equipments/new')}>افزودن تجهیزات</Button>
      </div>
      
      {/* Table view for larger screens */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">شماره سریال</TableHead>
              <TableHead className="text-right">مکان</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">تاریخ خرید</TableHead>
              <TableHead className="w-[80px] text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  هیچ تجهیزاتی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.name}</TableCell>
                  <TableCell>{equipment.serialNumber || 'ندارد'}</TableCell>
                  <TableCell>{equipment.location || 'ندارد'}</TableCell>
                  <TableCell>{renderStatusBadge(equipment.status)}</TableCell>
                  <TableCell>{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('fa-IR') : 'ندارد'}</TableCell>
                  <TableCell>
                    <ActionMenu equipment={equipment} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Card view for mobile screens */}
      <div className="md:hidden">
        {filteredEquipments.length === 0 ? (
          <Card>
            <CardContent className="h-24 flex items-center justify-center">
              <p className="text-center text-muted-foreground">هیچ تجهیزاتی یافت نشد.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEquipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))
        )}
      </div>
    </div>
  )
} 