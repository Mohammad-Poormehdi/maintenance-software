"use client";

import { useEffect, useState } from "react";
import { StockComplianceGauge } from "@/components/analytics/stock-compliance-gauge";
import { getStockComplianceKPI, getMaintenanceScheduleKPIs } from "@/app/actions/analytics";
import { MostUsedParts } from "@/components/analytics/most-used-parts";
import { SupplierPriceChart } from "@/components/analytics/supplier-price-chart";
import { OrderCancellationChart } from "@/components/analytics/order-cancell-chart";
import { MaintenanceChart } from "@/components/analytics/maintenance-chart";
import { OrdersChart } from "@/components/analytics/orders-chart";
import { 
  DelayedMaintenanceKPI, 
  UpcomingWeekMaintenanceKPI, 
  FutureMaintenanceKPI 
} from "@/components/analytics/maintenance-schedule-kpi";
import { EquipmentStatusPieChart } from "@/components/analytics/equipment-status-chart";
import { OrderStatusChart } from "@/components/orders/order-status-chart";

// Updating component name to reflect new layout
export function AnalyticsGrid() {
  const [stockCompliance, setStockCompliance] = useState({
    compliancePercentage: 0,
    partsAboveMinimum: 0,
    totalParts: 0,
    loading: true
  });

  const [maintenanceSchedules, setMaintenanceSchedules] = useState({
    delayedCount: 0,
    dueWithinWeekCount: 0,
    futureCount: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [stockData, maintenanceData] = await Promise.all([
          getStockComplianceKPI(),
          getMaintenanceScheduleKPIs()
        ]);
        
        setStockCompliance({
          ...stockData,
          loading: false
        });
        
        setMaintenanceSchedules({
          ...maintenanceData,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setStockCompliance(prev => ({ ...prev, loading: false }));
        setMaintenanceSchedules(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* Maintenance KPIs Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DelayedMaintenanceKPI
            count={maintenanceSchedules.delayedCount}
            loading={maintenanceSchedules.loading}
          />
          <UpcomingWeekMaintenanceKPI
            count={maintenanceSchedules.dueWithinWeekCount}
            loading={maintenanceSchedules.loading}
          />
          <FutureMaintenanceKPI
            count={maintenanceSchedules.futureCount}
            loading={maintenanceSchedules.loading}
          />
        </div>
      </section>

      {/* Inventory KPIs Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <MostUsedParts />
        </div>
      </section>

      {/* Equipment Status Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <EquipmentStatusPieChart 
            title="وضعیت قطعات تجهیزات" 
            description="تعداد و درصد قطعات در هر وضعیت" 
          />
          <SupplierPriceChart />
          <OrderCancellationChart />
          <OrderStatusChart />
        </div>
      </section>

      {/* Maintenance & Orders Charts Section */}
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