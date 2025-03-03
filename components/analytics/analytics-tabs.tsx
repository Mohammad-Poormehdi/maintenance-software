"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsTabsProps {
  defaultValue?: string;
}

export function AnalyticsTabs({ 
  defaultValue = "inventory"
}: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full" dir="rtl">
      <TabsList className="grid grid-cols-5 mb-8">
        <TabsTrigger value="inventory">مدیریت موجودی</TabsTrigger>
        <TabsTrigger value="supplier">عملکرد تامین‌کننده</TabsTrigger>
        <TabsTrigger value="equipment">قابلیت اطمینان تجهیزات</TabsTrigger>
        <TabsTrigger value="maintenance">کارایی نگهداری</TabsTrigger>
        <TabsTrigger value="cost">مدیریت هزینه</TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد مدیریت موجودی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">مطابقت سطح موجودی</h3>
              <p className="text-muted-foreground">درصد اقلام موجودی که حداقل الزامات موجودی را برآورده می‌کنند را نشان می‌دهد</p>
            </div>
            
            <div className="sm:col-span-2 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">نرخ گردش موجودی</h3>
              <p className="text-muted-foreground">اندازه‌گیری تناوب استفاده و جایگزینی موجودی</p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">فراوانی کمبود موجودی</h3>
              <p className="text-muted-foreground">شکست‌های بحرانی موجودی را برجسته می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">۱۰ قطعه پرمصرف برتر</h3>
              <p className="text-muted-foreground">مهمترین اقلام موجودی را شناسایی می‌کند</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="supplier" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد تامین‌کننده</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">عملکرد زمان تحویل تامین‌کننده</h3>
              <p className="text-muted-foreground">قابلیت اطمینان تامین‌کننده در تحقق وعده‌های تحویل را اندازه‌گیری می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">رقابت‌پذیری قیمت تامین‌کننده</h3>
              <p className="text-muted-foreground">روابط مقرون به صرفه با تامین‌کنندگان را شناسایی می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">نرخ تکمیل سفارش</h3>
              <p className="text-muted-foreground">تکمیل موفق سفارشات را پیگیری می‌کند</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="equipment" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد قابلیت اطمینان تجهیزات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">توزیع سلامت تجهیزات</h3>
              <p className="text-muted-foreground">وضعیت کلی سلامت ناوگان را در یک نگاه نشان می‌دهد</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">میانگین زمان بین خرابی‌ها</h3>
              <p className="text-muted-foreground">قابلیت اطمینان تجهیزات را اندازه‌گیری می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">زمان خواب تجهیزات</h3>
              <p className="text-muted-foreground">از دست دادن بهره‌وری ناشی از نگهداری تجهیزات را نشان می‌دهد</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="maintenance" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد کارایی نگهداری</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">نسبت نگهداری برنامه‌ریزی شده به برنامه‌ریزی نشده</h3>
              <p className="text-muted-foreground">اثربخشی برنامه نگهداری پیشگیرانه را نشان می‌دهد</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">مطابقت نگهداری</h3>
              <p className="text-muted-foreground">پایبندی به برنامه‌های نگهداری را نشان می‌دهد</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">روند پس‌افتادگی نگهداری</h3>
              <p className="text-muted-foreground">انباشت نگهداری‌های به تعویق افتاده را پیگیری می‌کند</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="cost" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد مدیریت هزینه</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">روند هزینه قطعات</h3>
              <p className="text-muted-foreground">تورم قیمت را نظارت و به پیش‌بینی بودجه‌ها کمک می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">هزینه نگهداری به تفکیک تجهیزات</h3>
              <p className="text-muted-foreground">تجهیزات با بالاترین هزینه‌های نگهداری را شناسایی می‌کند</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">توزیع ارزش موجودی</h3>
              <p className="text-muted-foreground">تخصیص سرمایه در میان دسته‌های موجودی را نشان می‌دهد</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
} 