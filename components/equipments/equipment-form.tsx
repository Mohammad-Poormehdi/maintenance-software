'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format as formatJalali } from 'date-fns-jalali'
import { Calendar as JalaliCalendar } from '@/components/ui/jalali-calendar'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// These actions need to be created
import { createEquipment, updateEquipment } from '@/app/actions/equipments'
import { faIR } from 'date-fns/locale/fa-IR'

// Form validation schema
const equipmentFormSchema = z.object({
  name: z.string().min(1, 'نام تجهیز الزامی است'),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  purchaseDate: z.date().optional().nullable(),
  status: z.enum(['HEALTHY', 'NEEDS_REPAIR', 'NEEDS_REPLACEMENT']).default('HEALTHY'),
})

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

// Add this interface for maintenance events
interface MaintenanceEvent {
  id: string
  eventType: 'SCHEDULED_MAINTENANCE' | 'BREAKDOWN' | 'REPAIR' | 'REPLACEMENT' | 'INSPECTION'
  description: string | null
  scheduledDate: Date | null
  completedDate: Date | null
  createdAt: Date
  part?: {
    id: string
    name: string
  } | null
}

// Update EquipmentFormProps to include maintenance events
interface EquipmentFormProps {
  equipment?: {
    id: string
    name: string
    serialNumber: string | null
    location: string | null
    purchaseDate: Date | null
    status: 'HEALTHY' | 'NEEDS_REPAIR' | 'NEEDS_REPLACEMENT'
    maintenanceEvents?: MaintenanceEvent[]
  } | null
}

const defaultValues: Partial<EquipmentFormValues> = {
  name: '',
  serialNumber: '',
  location: '',
  purchaseDate: null,
  status: 'HEALTHY',
}

export function EquipmentForm({ equipment }: EquipmentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: equipment
      ? {
          name: equipment.name,
          serialNumber: equipment.serialNumber || '',
          location: equipment.location || '',
          purchaseDate: equipment.purchaseDate,
          status: equipment.status,
        }
      : defaultValues,
  })

  function onSubmit(data: EquipmentFormValues) {
    startTransition(async () => {
      try {
        if (equipment) {
          // Update existing equipment
          await updateEquipment(equipment.id, data)
          toast.success('تجهیز با موفقیت بروزرسانی شد')
        } else {
          // Create new equipment
          await createEquipment(data)
          toast.success('تجهیز با موفقیت ثبت شد')
        }
        router.push('/equipments')
      } catch (error) {
        toast.error(equipment ? 'خطا در بروزرسانی تجهیز' : 'خطا در ثبت تجهیز')
      }
    })
  }

  // Add this helper function
  function getMaintenanceTypeLabel(type: MaintenanceEvent['eventType']) {
    const labels = {
      SCHEDULED_MAINTENANCE: 'نگهداری برنامه‌ریزی شده',
      BREAKDOWN: 'خرابی',
      REPAIR: 'تعمیر',
      REPLACEMENT: 'تعویض',
      INSPECTION: 'بازرسی'
    }
    return labels[type]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {equipment ? 'ویرایش تجهیز' : 'افزودن تجهیز جدید'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام تجهیز</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: دستگاه CNC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره سریال</FormLabel>
                  <FormControl>
                    <Input placeholder="شماره سریال تجهیز" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موقعیت مکانی</FormLabel>
                  <FormControl>
                    <Input placeholder="محل استقرار تجهیز" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاریخ خرید</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatJalali(field.value, "yyyy/MM/dd")
                          ) : (
                            <span>انتخاب تاریخ</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <JalaliCalendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={faIR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وضعیت</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب وضعیت" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HEALTHY">سالم</SelectItem>
                      <SelectItem value="NEEDS_REPAIR">نیاز به تعمیر</SelectItem>
                      <SelectItem value="NEEDS_REPLACEMENT">نیاز به تعویض</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add this section after the existing form fields but before CardFooter */}
            {equipment?.maintenanceEvents && equipment.maintenanceEvents.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="mb-4 px-6 text-lg font-medium">سوابق نگهداری و تعمیرات</h3>
                <ScrollArea className="h-[200px] px-6">
                  <div className="space-y-4">
                    {equipment.maintenanceEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col space-y-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {getMaintenanceTypeLabel(event.eventType)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {event.completedDate
                              ? formatJalali(event.completedDate, 'yyyy/MM/dd')
                              : 'در انتظار تکمیل'}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        {event.part && (
                          <div className="text-sm">
                            قطعه: <span className="font-medium">{event.part.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 space-x-reverse pt-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
              type="button"
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'در حال ثبت...' : equipment ? 'بروزرسانی' : 'ثبت تجهیز'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 