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
import { PersianDatePicker } from '@/components/ui/persian-date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createMaintenanceEvent, updateMaintenanceEvent } from '@/app/actions/maintenance-events'
import { Textarea } from '@/components/ui/textarea'
import { PartSelector } from '@/components/equipments/part-selector'

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

// Add maintenance event form schema
const maintenanceEventFormSchema = z.object({
  eventType: z.enum(['SCHEDULED_MAINTENANCE', 'BREAKDOWN', 'REPAIR', 'REPLACEMENT', 'INSPECTION']),
  description: z.string().optional().nullable(),
  scheduledDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
  partId: z.string().optional().nullable(),
})

type MaintenanceEventFormValues = z.infer<typeof maintenanceEventFormSchema>

export function EquipmentForm({ equipment }: EquipmentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<MaintenanceEvent | null>(null)

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

  // Add maintenance event form
  const maintenanceForm = useForm<MaintenanceEventFormValues>({
    resolver: zodResolver(maintenanceEventFormSchema),
    defaultValues: {
      eventType: 'SCHEDULED_MAINTENANCE',
      description: '',
      scheduledDate: null,
      completedDate: null,
      partId: null,
    },
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

  function onMaintenanceSubmit(data: MaintenanceEventFormValues) {
    if (!equipment?.id) return

    startTransition(async () => {
      try {
        await createMaintenanceEvent({
          ...data,
          equipmentId: equipment.id,
        })
        toast.success('رویداد نگهداری با موفقیت ثبت شد')
        maintenanceForm.reset()
        setIsMaintenanceFormOpen(false)
        router.refresh()
      } catch (error) {
        toast.error('خطا در ثبت رویداد نگهداری')
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

  function openMaintenanceForm(event?: MaintenanceEvent) {
    if (event) {
      setCurrentEvent(event)
      // Populate the form with the event's data
      maintenanceForm.reset({
        eventType: event.eventType,
        description: event.description,
        scheduledDate: event.scheduledDate,
        completedDate: event.completedDate,
        partId: event.part?.id || null,
      })
    } else {
      setCurrentEvent(null)
      // Reset the form for a new event
      maintenanceForm.reset({
        eventType: 'SCHEDULED_MAINTENANCE',
        description: '',
        scheduledDate: null,
        completedDate: null,
        partId: null,
      })
    }
    setIsMaintenanceFormOpen(true)
  }

  function onMaintenanceUpdate(data: MaintenanceEventFormValues) {
    if (!equipment?.id || !currentEvent?.id) return

    startTransition(async () => {
      try {
        await updateMaintenanceEvent({
          id: currentEvent.id,
          ...data,
          equipmentId: equipment.id,
        })
        toast.success('رویداد نگهداری با موفقیت بروزرسانی شد')
        maintenanceForm.reset()
        setIsMaintenanceFormOpen(false)
        setCurrentEvent(null)
        router.refresh()
      } catch (error) {
        toast.error('خطا در بروزرسانی رویداد نگهداری')
      }
    })
  }

  function getDialogTitle() {
    return currentEvent ? 'ویرایش رویداد نگهداری و تعمیرات' : 'ثبت رویداد نگهداری و تعمیرات'
  }

  function getSubmitLabel() {
    if (isPending) return 'در حال ثبت...'
    return currentEvent ? 'بروزرسانی رویداد' : 'ثبت رویداد'
  }

  function handleMaintenanceSubmit(data: MaintenanceEventFormValues) {
    if (currentEvent) {
      onMaintenanceUpdate(data)
    } else {
      onMaintenanceSubmit(data)
    }
  }

  // Add this function to calculate average maintenance time
  function calculateAverageMaintenanceTime(events: MaintenanceEvent[]): { days: number, count: number, totalDays: number } | null {
    // Filter events that have both scheduled and completed dates
    const completedEvents = events.filter(
      (event) => event.scheduledDate && event.completedDate
    );
    
    if (completedEvents.length === 0) return null;
    
    // Calculate time difference in days for each event
    const totalDays = completedEvents.reduce((sum, event) => {
      const scheduledDate = new Date(event.scheduledDate!);
      const completedDate = new Date(event.completedDate!);
      const diffTime = completedDate.getTime() - scheduledDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    // Calculate average
    return {
      days: Math.round(totalDays / completedEvents.length),
      count: completedEvents.length,
      totalDays
    };
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
                <FormItem>
                  <FormLabel>تاریخ خرید</FormLabel>
                  <FormControl>
                    <PersianDatePicker
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(dateString) => field.onChange(dateString ? new Date(dateString) : null)}
                      label=""
                      placeholder="انتخاب تاریخ"
                      error={form.formState.errors.purchaseDate?.message}
                    />
                  </FormControl>
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

            {/* Replace the ScrollArea with a flex column container */}
            {equipment?.maintenanceEvents && equipment.maintenanceEvents.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-medium">سوابق نگهداری و تعمیرات</h3>
                
                {/* Move stats block to appear first */}
                <div className="mb-4 rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">آمار نگهداری و تعمیرات</h4>
                  <div className="text-sm">
                    <p>
                      میانگین زمان اتمام عملیات نگهداری: 
                      <span className="font-bold mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.days}
                      </span>
                      روز
                    </p>
                    <p className="mt-1">
                      مجموع زمان تعمیرات: 
                      <span className="font-bold mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.totalDays}
                      </span>
                      روز
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      (بر اساس 
                      <span className="font-medium mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.count}
                      </span>
                      رویداد تکمیل شده)
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  {equipment.maintenanceEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col space-y-2 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {getMaintenanceTypeLabel(event.eventType)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {event.completedDate ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                              تکمیل شده
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100">
                              در انتظار تکمیل
                            </Badge>  
                          )}
                          <span className="text-sm text-muted-foreground">
                            {event.completedDate
                              ? formatJalali(event.completedDate, 'yyyy/MM/dd')
                              : ''}
                          </span>
                        </div>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 self-end"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openMaintenanceForm(event);
                        }}
                      >
                        ویرایش
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4 pt-6">
            {/* Add the maintenance button if equipment exists */}
            {equipment && (
              <div className="w-full border-t pt-4">
                <Dialog open={isMaintenanceFormOpen} onOpenChange={setIsMaintenanceFormOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full"
                      onClick={() => openMaintenanceForm()}
                    >
                      افزودن رویداد نگهداری و تعمیرات
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{getDialogTitle()}</DialogTitle>
                      <DialogDescription>
                        اطلاعات مربوط به رویداد نگهداری یا تعمیرات را وارد کنید.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...maintenanceForm}>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          // We're handling submission via the button onClick now
                        }} 
                        className="space-y-4"
                      >
                        <FormField
                          control={maintenanceForm.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع رویداد</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب نوع رویداد" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="SCHEDULED_MAINTENANCE">نگهداری برنامه‌ریزی شده</SelectItem>
                                  <SelectItem value="BREAKDOWN">خرابی</SelectItem>
                                  <SelectItem value="REPAIR">تعمیر</SelectItem>
                                  <SelectItem value="REPLACEMENT">تعویض</SelectItem>
                                  <SelectItem value="INSPECTION">بازرسی</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={maintenanceForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>توضیحات</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="توضیحات مربوط به رویداد" 
                                  {...field} 
                                  value={field.value || ''} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4">
                          <FormField
                            control={maintenanceForm.control}
                            name="scheduledDate"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>تاریخ برنامه‌ریزی</FormLabel>
                                <FormControl>
                                  <PersianDatePicker
                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                    onChange={(dateString) => field.onChange(dateString ? new Date(dateString) : null)}
                                    label=""
                                    placeholder="انتخاب تاریخ"
                                    error={maintenanceForm.formState.errors.scheduledDate?.message}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={maintenanceForm.control}
                            name="completedDate"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>تاریخ انجام</FormLabel>
                                <FormControl>
                                  <PersianDatePicker
                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                    onChange={(dateString) => field.onChange(dateString ? new Date(dateString) : null)}
                                    label=""
                                    placeholder="انتخاب تاریخ"
                                    error={maintenanceForm.formState.errors.completedDate?.message}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={maintenanceForm.control}
                          name="partId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>قطعه مرتبط</FormLabel>
                              <FormControl>
                                <PartSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="انتخاب قطعه (اختیاری)"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsMaintenanceFormOpen(false)}
                          >
                            انصراف
                          </Button>
                          <Button 
                            type="button" 
                            disabled={isPending}
                            onClick={maintenanceForm.handleSubmit(handleMaintenanceSubmit)}
                          >
                            {getSubmitLabel()}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <div className="flex w-full justify-end space-x-2 space-x-reverse">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'در حال ثبت...' : equipment ? 'بروزرسانی' : 'ثبت تجهیز'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 