"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockComplianceGauge } from "@/components/analytics/stock-compliance-gauge";
import { getStockComplianceKPI } from "@/app/actions/analytics";
import { InventoryTurnoverChart } from "@/components/analytics/inventory-turnover-chart";
import { getInventoryTurnoverData } from "@/app/actions/analytics";
import { StockOutChart } from "@/components/analytics/stock-out-chart";
import { getStockOutData } from "@/app/actions/analytics";
import { MostUsedParts } from "@/components/analytics/most-used-parts";
import { SupplierPriceChart } from "@/components/analytics/supplier-price-chart";

interface AnalyticsTabsProps {
  defaultValue?: string;
}

interface InventoryTurnoverData {
  month: string;
  turnoverRate: number;
}

export function AnalyticsTabs({ 
  defaultValue = "inventory"
}: AnalyticsTabsProps) {
  const [stockCompliance, setStockCompliance] = useState({
    compliancePercentage: 0,
    partsAboveMinimum: 0,
    totalParts: 0,
    loading: true
  });

  const [inventoryTurnover, setInventoryTurnover] = useState<{
    data: InventoryTurnoverData[];
    trend: number;
    loading: boolean;
  }>({
    data: [],
    trend: 0,
    loading: true
  });

  const [stockOutData, setStockOutData] = useState<{
    data: { name: string; stockOuts: number; }[];
    loading: boolean;
  }>({
    data: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getStockComplianceKPI();
        setStockCompliance({
          ...data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stock compliance data:", error);
        setStockCompliance(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const turnoverData = await getInventoryTurnoverData();
        setInventoryTurnover({
          ...turnoverData,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching inventory turnover data:", error);
        setInventoryTurnover(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getStockOutData();
        setStockOutData({
          data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stock-out data:", error);
        setStockOutData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

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
            {stockCompliance.loading ? (
              <div className="flex items-center justify-center h-64">
                <p>در حال بارگیری...</p>
              </div>
            ) : (
              <StockComplianceGauge 
                percentage={stockCompliance.compliancePercentage}
                partsAboveMinimum={stockCompliance.partsAboveMinimum}
                totalParts={stockCompliance.totalParts}
              />
            )}
            
            {stockOutData.loading ? (
              <div className="flex items-center justify-center h-64">
                <p>در حال بارگیری...</p>
              </div>
            ) : (
              <StockOutChart />
            )}

            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">۱۰ قطعه پرمصرف برتر</h3>
              <p className="text-muted-foreground">مهمترین اقلام موجودی را شناسایی می‌کند</p>
            </div>
            
            <div className="col-span-full">
              {inventoryTurnover.loading ? (
                <div className="flex items-center justify-center h-64">
                  <p>در حال بارگیری...</p>
                </div>
              ) : (
                <InventoryTurnoverChart 
                  data={inventoryTurnover.data}
                  trend={inventoryTurnover.trend}
                />
              )}
            </div>

            <MostUsedParts />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="supplier" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">شاخص‌های کلیدی عملکرد تامین‌کننده</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <SupplierPriceChart />
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">عملکرد زمان تحویل تامین‌کننده</h3>
              <p className="text-muted-foreground">قابلیت اطمینان تامین‌کننده در تحقق وعده‌های تحویل را اندازه‌گیری می‌کند</p>
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