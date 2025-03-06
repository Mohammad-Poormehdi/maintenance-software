'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { createPart, updatePart } from '@/app/actions/parts'

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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { convertPersianToEnglish } from '@/lib/utils/numbers'
import { PartPriceChart } from '@/components/parts/part-price-chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Form validation schema
const partFormSchema = z.object({
  name: z.string().min(1, 'نام قطعه الزامی است'),
  description: z.string().optional(),
  currentStock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),
  minimumStock: z.number().min(0, 'حداقل موجودی نمی‌تواند منفی باشد'),
})

type PartFormValues = z.infer<typeof partFormSchema>

// Add this interface for supplier price data
interface SupplierPrice {
  id: string
  supplier: {
    name: string
  }
  price: number
  leadTime: number | null
  isPreferred: boolean
}

// Update PartFormProps to include the correct typing for equipmentParts
interface PartFormProps {
  part?: {
    id: string
    name: string
    description: string | null
    currentStock: number
    minimumStock: number
    supplierParts?: SupplierPrice[]
    equipmentParts?: {
      id: string
      equipment: {
        id: string
        name: string
        status: 'HEALTHY' | 'NEEDS_REPAIR' | 'NEEDS_REPLACEMENT'
      }
      quantity: number
    }[]
  } | null
}

const defaultValues: Partial<Omit<PartFormValues, 'currentStock' | 'minimumStock'> & {
  currentStock: number;
  minimumStock: number;
}> = {
  name: '',
  description: '',
  currentStock: 0,
  minimumStock: 1,
}

// Add this class to align the table headers to the right
const tableHeadClass = "text-right"

export function PartForm({ part }: PartFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
        currentStock: part?.currentStock ?? 0,
        minimumStock: part?.minimumStock ?? 1,
        name: part?.name ?? '',
        description: part?.description ?? '',
    }
  })

  function onSubmit(data: PartFormValues) {
    startTransition(async () => {
      try {
        if (part) {
          // Update existing part
          // You'll need to create an updatePart action
          await updatePart(part.id, data)
          toast.success('قطعه با موفقیت بروزرسانی شد')
        } else {
          // Create new part
          await createPart(data)
          toast.success('قطعه با موفقیت ثبت شد')
        }
        router.push('/inventory')
      } catch (error) {
        toast.error(part ? 'خطا در بروزرسانی قطعه' : 'خطا در ثبت قطعه')
      }
    })
  }

  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {part ? 'ویرایش قطعه' : 'افزودن قطعه جدید'}
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
                    <FormLabel>نام قطعه</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: پمپ هیدرولیک" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="توضیحات مربوط به قطعه را وارد کنید"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>موجودی فعلی</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          onChange={(e) => {
                            const value = e.target.valueAsNumber
                            onChange(isNaN(value) ? 0 : value)
                          }}
                          value={value}
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumStock"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>حداقل موجودی</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          onChange={(e) => {
                            const value = e.target.valueAsNumber
                            onChange(isNaN(value) ? 0 : value)
                          }}
                          value={value}
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 space-x-reverse pt-6">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'در حال ثبت...' : part ? 'بروزرسانی' : 'ثبت قطعه'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Equipment parts section */}
      {part && part.equipmentParts && part.equipmentParts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>تجهیزات استفاده کننده</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={tableHeadClass}>نام تجهیز</TableHead>
                  <TableHead className={tableHeadClass}>تعداد مورد نیاز</TableHead>
                  <TableHead className={tableHeadClass}>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {part.equipmentParts.map((equipmentPart) => (
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
          </CardContent>
        </Card>
      ) : part && (
        <Card>
          <CardHeader>
            <CardTitle>تجهیزات استفاده کننده</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              این قطعه در هیچ تجهیزی استفاده نشده است
            </p>
          </CardContent>
        </Card>
      )}

      {/* Supplier prices section */}
      {part && part.supplierParts && part.supplierParts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>مقایسه قیمت تامین‌کنندگان</CardTitle>
          </CardHeader>
          <CardContent>
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
                {part.supplierParts.map((supplierPart) => (
                  <TableRow key={supplierPart.id}>
                    <TableCell className="text-right">{supplierPart.supplier.name}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('fa-IR').format(supplierPart.price)}</TableCell>
                    <TableCell className="text-right">{supplierPart.leadTime ?? '-'}</TableCell>
                    <TableCell className="text-right">{supplierPart.isPreferred ? '✓' : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : part && (
        <Card>
          <CardHeader>
            <CardTitle>مقایسه قیمت تامین‌کنندگان</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              هیچ تامین‌کننده‌ای برای این قطعه ثبت نشده است
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price chart remains at the bottom */}
      {part && <PartPriceChart partId={part.id} />}
    </div>
  )
}
