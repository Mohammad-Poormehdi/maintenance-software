'use client'

import { useState, useTransition } from 'react'
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

// Form validation schema
const orderFormSchema = z.object({
  supplierId: z.string().min(1, 'انتخاب تامین‌کننده الزامی است'),
  orderItems: z.array(z.object({
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
}

interface OrderFormProps {
  suppliers: Supplier[]
  parts: Part[]
}

export function OrderForm({ suppliers, parts }: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      supplierId: '',
      orderItems: [{ partId: '', quantity: 1, unitPrice: 0 }],
      deliveryDate: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "orderItems",
    control: form.control,
  })

  async function onSubmit(data: OrderFormValues) {
    startTransition(async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('خطا در ثبت سفارش')
        
        toast.success('سفارش با موفقیت ثبت شد')
        router.push('/orders')
      } catch (error) {
        toast.error('خطا در ثبت سفارش')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ثبت سفارش جدید</CardTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="قطعه را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parts.map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.name}
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

                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>قیمت واحد</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 space-x-reverse pt-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'در حال ثبت...' : 'ثبت سفارش'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
