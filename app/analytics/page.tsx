import { Suspense } from "react";
import { AnalyticsGrid } from "@/components/analytics/analytics-tabs";

export const dynamic = "force-dynamic";

async function AnalyticsContent() {
  return (
    <AnalyticsGrid />
  );
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">تجزیه و تحلیل داده‌ها</h1>
        <p className="text-muted-foreground">
          شاخص‌های کلیدی عملکرد سیستم نگهداری و تعمیرات و مدیریت موجودی
        </p>
      </div>
      
      <Suspense fallback={<div className="h-[60vh] flex items-center justify-center">Loading analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
  
