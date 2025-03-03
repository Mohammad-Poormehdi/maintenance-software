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

// Form validation schema
const partFormSchema = z.object({
  name: z.string().min(1, 'نام قطعه الزامی است'),
  description: z.string().optional(),
  currentStock: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),
  minimumStock: z.number().min(0, 'حداقل موجودی نمی‌تواند منفی باشد'),
})

type PartFormValues = z.infer<typeof partFormSchema>

interface PartFormProps {
  part?: {
    id: string
    name: string
    description: string | null
    currentStock: number
    minimumStock: number
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
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'در حال ثبت...' : part ? 'بروزرسانی' : 'ثبت قطعه'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
