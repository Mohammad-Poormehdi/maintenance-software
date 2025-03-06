'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PersianDatePicker } from '@/components/ui/persian-date-picker'
import { createOrder, updateOrder } from '@/app/actions/orders'

// Form validation schema
const orderFormSchema = z.object({
  supplierId: z.string().min(1, 'انتخاب تامین‌کننده الزامی است'),
  orderItems: z.array(z.object({
    id: z.string().optional(), // For existing items
    partId: z.string().min(1, 'انتخاب قطعه الزامی است'),
    quantity: z.number().min(1, 'تعداد باید حداقل 1 باشد'),
    unitPrice: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  })).min(1, 'حداقل یک قطعه باید انتخاب شود'),
  deliveryDate: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

interface Supplier {
  id: string
  name: string
}

interface Part {
  id: string
  name: string
  price?: number
}

interface OrderItem {
  id: string
  partId: string
  quantity: number
  unitPrice: number
  part: {
    id: string
    name: string
  }
}

interface Order {
  id: string
  supplierId: string
  deliveryDate: string | null
  orderItems: OrderItem[]
}

interface OrderFormProps {
  suppliers: Supplier[]
  supplierParts: Record<string, Part[]>
  allParts: Part[]
  existingOrder?: Order | null
  isEditing?: boolean
}

export function OrderForm({ 
  suppliers, 
  supplierParts, 
  allParts, 
  existingOrder, 
  isEditing = false 
}: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    existingOrder?.supplierId || ''
  )
  const [availableParts, setAvailableParts] = useState<Part[]>(
    selectedSupplierId ? (supplierParts[selectedSupplierId] || []) : allParts
  )

  // Prepare default values based on whether we're editing or creating
  const defaultValues: OrderFormValues = {
    supplierId: existingOrder?.supplierId || '',
    orderItems: existingOrder?.orderItems.map(item => ({
      id: item.id,
      partId: item.partId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })) || [{ partId: '', quantity: 1, unitPrice: 0 }],
    deliveryDate: existingOrder?.deliveryDate || '',
  }

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    name: "orderItems",
    control: form.control,
  })

  // Update available parts when supplier changes
  useEffect(() => {
    if (selectedSupplierId) {
      const supplierSpecificParts = supplierParts[selectedSupplierId] || [];
      setAvailableParts(supplierSpecificParts);
      
      // Only reset part selections if we're not editing an existing order
      if (!isEditing) {
        const currentOrderItems = form.getValues().orderItems;
        const updatedOrderItems = currentOrderItems.map(item => ({
          ...item,
          partId: '',
          unitPrice: 0
        }));
        form.setValue('orderItems', updatedOrderItems);
      }
    } else {
      setAvailableParts([]);
    }
  }, [selectedSupplierId, supplierParts, form, isEditing]);

  // Handle part selection and auto-set price
  const handlePartSelection = (partId: string, index: number) => {
    const selectedPart = availableParts.find(part => part.id === partId);
    
    // Update the part ID
    form.setValue(`orderItems.${index}.partId`, partId);
    
    // Set the price from the supplier part data
    if (selectedPart && selectedPart.price !== undefined) {
      form.setValue(`orderItems.${index}.unitPrice`, selectedPart.price);
    } else {
      form.setValue(`orderItems.${index}.unitPrice`, 0);
    }
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    const orderItems = form.watch('orderItems');
    
    // Calculate total items and cost
    const totalItems = orderItems.reduce((sum, item) => 
      sum + (item.quantity || 0), 0);
    
    const totalCost = orderItems.reduce((sum, item) => 
      sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    
    return { totalItems, totalCost };
  };

  // Get part name by id
  const getPartName = (partId: string) => {
    const part = availableParts.find(p => p.id === partId);
    return part?.name || '';
  };

  // Calculate order summary
  const { totalItems, totalCost } = calculateOrderSummary();

  async function onSubmit(data: OrderFormValues) {
    startTransition(async () => {
      try {
        let result;
        
        if (isEditing && existingOrder) {
          result = await updateOrder(existingOrder.id, data);
          if (result.success) {
            toast.success('سفارش با موفقیت بروزرسانی شد')
          } else {
            toast.error('خطا در بروزرسانی سفارش')
          }
        } else {
          result = await createOrder(data);
          if (result.success) {
            toast.success('سفارش با موفقیت ثبت شد')
          } else {
            toast.error('خطا در ثبت سفارش')
          }
        }
        
        if (result.success) {
          router.push('/orders')
        }
      } catch (error) {
        toast.error(isEditing ? 'خطا در بروزرسانی سفارش' : 'خطا در ثبت سفارش')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'ویرایش سفارش' : 'ثبت سفارش جدید'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تامین‌کننده</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSupplierId(value);
                    }} 
                    defaultValue={field.value}
                    disabled={isEditing} // Disable changing supplier in edit mode
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="تامین‌کننده را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.partId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>قطعه</FormLabel>
                        <Select 
                          onValueChange={(value) => handlePartSelection(value, index)} 
                          value={field.value} 
                          disabled={!selectedSupplierId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedSupplierId ? "قطعه را انتخاب کنید" : "ابتدا تامین‌کننده را انتخاب کنید"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableParts.map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.name} {part.price !== undefined ? `(${part.price.toLocaleString()} ریال)` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>تعداد</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mb-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ partId: '', quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              افزودن قطعه
            </Button>

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ تحویل</FormLabel>
                  <FormControl>
                    <PersianDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="انتخاب تاریخ تحویل"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Summary section with theme-aware styling */}
            {form.watch('orderItems').some(item => item.partId) && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">خلاصه سفارش</h3>
                
                <div className="space-y-4 rounded-lg bg-muted p-4 border">
                  <div className="grid grid-cols-1 gap-2">
                    {form.watch('orderItems')
                      .filter(item => item.partId)
                      .map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{getPartName(item.partId)}</span>
                          <div className="flex gap-x-4">
                            <span>{item.quantity} عدد</span>
                            <span className="text-muted-foreground">
                              {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()} ریال
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>مجموع</span>
                    <div className="flex gap-x-4">
                      <span>{totalItems} عدد</span>
                      <span>{totalCost.toLocaleString()} ریال</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 space-x-reverse pt-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isPending || !selectedSupplierId}>
              {isPending 
                ? (isEditing ? 'در حال بروزرسانی...' : 'در حال ثبت...') 
                : (isEditing ? 'بروزرسانی سفارش' : 'ثبت سفارش')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
