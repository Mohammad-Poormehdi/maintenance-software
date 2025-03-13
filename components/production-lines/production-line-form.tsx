"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductionLine, ProductionLineStatus, Equipment } from "@prisma/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Define validation schema
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "نام خط تولید الزامی است" }),
  description: z.string().optional(),
  status: z.nativeEnum(ProductionLineStatus),
  capacity: z.coerce.number().optional().nullable(),
});

type ProductionLineFormValues = z.infer<typeof formSchema>;

interface ProductionLineFormProps {
  productionLine: (ProductionLine & { equipment: Equipment[] }) | null;
  saveProductionLine: (formData: FormData) => Promise<void>;
}

export function ProductionLineForm({
  productionLine,
  saveProductionLine,
}: ProductionLineFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default values
  const defaultValues: Partial<ProductionLineFormValues> = {
    id: productionLine?.id || "new",
    name: productionLine?.name || "",
    description: productionLine?.description || "",
    status: productionLine?.status || ProductionLineStatus.OPERATIONAL,
    capacity: productionLine?.capacity || null,
  };

  const form = useForm<ProductionLineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: ProductionLineFormValues) {
    try {
      setIsSubmitting(true);
      
      // Convert the form data to FormData
      const formData = new FormData();
      formData.append("id", data.id || "new");
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      formData.append("status", data.status);
      if (data.capacity) formData.append("capacity", data.capacity.toString());
      
      await saveProductionLine(formData);
      
      toast.success(productionLine 
        ? "خط تولید با موفقیت ویرایش شد" 
        : "خط تولید جدید با موفقیت ایجاد شد");

      router.push("/production-lines");
      router.refresh();
    } catch (error) {
      console.error("Error saving production line:", error);
      toast.error("مشکلی در ذخیره خط تولید به وجود آمد");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden field for ID */}
            <input type="hidden" name="id" value={defaultValues.id} />
            
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام خط تولید</FormLabel>
                  <FormControl>
                    <Input placeholder="خط تولید اصلی" {...field} />
                  </FormControl>
                  <FormDescription>
                    نام شناسایی خط تولید را وارد کنید
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="توضیحات مربوط به خط تولید را وارد کنید"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Status field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وضعیت</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="وضعیت خط تولید را انتخاب کنید" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProductionLineStatus.OPERATIONAL}>
                        فعال
                      </SelectItem>
                      <SelectItem value={ProductionLineStatus.REDUCED_CAPACITY}>
                        ظرفیت کاهش یافته
                      </SelectItem>
                      <SelectItem value={ProductionLineStatus.MAINTENANCE}>
                        در حال تعمیر
                      </SelectItem>
                      <SelectItem value={ProductionLineStatus.OFFLINE}>
                        غیرفعال
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Capacity field */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ظرفیت تولید</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" 
                          ? null 
                          : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    ظرفیت تولید را بر اساس واحد مناسب وارد کنید
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {productionLine?.equipment && productionLine.equipment.length > 0 && (
              <FormItem>
                <FormLabel>تجهیزات مرتبط</FormLabel>
                <div className="space-y-2">
                  {productionLine.equipment.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="flex items-center gap-2 p-2 border rounded bg-muted/50"
                    >
                      <span className="font-medium">{equipment.name}</span>
                      {equipment.serialNumber && (
                        <span className="text-sm text-muted-foreground">
                          ({equipment.serialNumber})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <FormDescription>
                  تجهیزات متصل به این خط تولید
                </FormDescription>
              </FormItem>
            )}
            
            <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 