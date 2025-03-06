"use client";

import { useEffect, useState } from "react";
import { StockComplianceGauge } from "@/components/analytics/stock-compliance-gauge";
import { getStockComplianceKPI } from "@/app/actions/analytics";
import { MostUsedParts } from "@/components/analytics/most-used-parts";
import { SupplierPriceChart } from "@/components/analytics/supplier-price-chart";
import { OutOfStockList } from "@/components/analytics/out-of-stock-list";
import { OrderCancellationChart } from "@/components/analytics/order-cancell-chart";
import { MaintenanceChart } from "@/components/analytics/maintenance-chart";
import { OrdersChart } from "@/components/analytics/orders-chart";

// Updating component name to reflect new layout
export function AnalyticsGrid() {
  const [stockCompliance, setStockCompliance] = useState({
    compliancePercentage: 0,
    partsAboveMinimum: 0,
    totalParts: 0,
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

  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* Inventory KPIs Section */}
      <section className="space-y-4">
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
          <OutOfStockList />
          <MostUsedParts />
        </div>
      </section>

      {/* Supplier KPIs Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SupplierPriceChart />
          <OrderCancellationChart />
          <div className="hidden sm:block" /> {/* Empty div to maintain grid structure */}
        </div>
      </section>

      {/* Maintenance KPIs Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <MaintenanceChart 
              title="نسبت نگهداری برنامه‌ریزی شده به برنامه‌ریزی نشده" 
              description="نمودار فعالیت‌های نگهداری پیشگیرانه و واکنشی در طول زمان"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <OrdersChart 
              title="روند سفارشات" 
              description="مرور سفارشات تکمیل‌شده و در انتظار در طول زمان"
            />
          </div>
        </div>
      </section>
    </div>
  );
} 