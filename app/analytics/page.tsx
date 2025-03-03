import { Suspense } from "react";
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStockComplianceData() {
  // Get all parts from the database
  const parts = await db.part.findMany({
    select: {
      id: true,
      currentStock: true,
      minimumStock: true,
    },
  });

  // Calculate the number of parts that meet minimum stock requirements
  const compliantParts = parts.filter(
    (part) => part.currentStock >= part.minimumStock
  );

  // Calculate the compliance percentage
  const totalParts = parts.length;
  const compliantPartsCount = compliantParts.length;
  const compliancePercentage = totalParts > 0 
    ? (compliantPartsCount / totalParts) * 100 
    : 0;

  // For demonstration, we could simulate a previous value
  // In a real system, you would fetch historical data from the database
  const previousCompliancePercentage = compliancePercentage - 2.5; // Example value

  return {
    compliancePercentage,
    totalParts,
    compliantPartsCount,
    previousCompliancePercentage,
  };
}

async function getInventoryTurnoverData() {
  // Get the current date
  const now = new Date();
  
  // Get the last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(now.getMonth() - i);
    months.push({
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      monthName: date.toLocaleString('fa-IR', { month: 'long' }),
      shortName: date.toLocaleString('en-US', { month: 'short' }),
    });
  }

  // Get all parts to calculate average inventory level
  const parts = await db.part.findMany({
    select: {
      id: true,
      currentStock: true,
    },
  });

  // Calculate the total current stock (average inventory)
  const totalInventoryCount = parts.reduce((sum, part) => sum + part.currentStock, 0);
  const averageInventoryLevel = totalInventoryCount / (parts.length || 1);

  // Get maintenance events for each month (parts consumed)
  const turnoverData = await Promise.all(
    months.map(async (month) => {
      // Find all maintenance events in this month that have used parts
      const maintenanceEvents = await db.maintenanceEvent.findMany({
        where: {
          completedDate: {
            gte: month.startDate,
            lte: month.endDate,
          },
          partId: { not: null },
        },
      });

      // Each maintenance event represents a part being consumed
      const partsConsumed = maintenanceEvents.length;
      
      // Calculate turnover rate: parts consumed / average inventory level
      const turnoverRate = partsConsumed / (averageInventoryLevel || 1);

      return {
        month: month.shortName,
        persianMonth: month.monthName,
        turnoverRate,
        partsConsumed,
      };
    })
  );

  // Calculate average turnover rate
  const totalTurnoverRate = turnoverData.reduce((sum, month) => sum + month.turnoverRate, 0);
  const averageTurnover = totalTurnoverRate / (turnoverData.length || 1);

  // Calculate change from previous period
  // Compare the last month with the average of the previous months
  const latestTurnover = turnoverData[turnoverData.length - 1]?.turnoverRate || 0;
  const previousMonthsAvg = turnoverData.slice(0, -1).reduce(
    (sum, month) => sum + month.turnoverRate, 0
  ) / (turnoverData.length - 1 || 1);
  
  const previousPeriodChange = previousMonthsAvg !== 0 
    ? ((latestTurnover - previousMonthsAvg) / previousMonthsAvg) * 100 
    : 0;

  return {
    turnoverData,
    averageTurnover,
    previousPeriodChange,
  };
}

async function AnalyticsContent() {
  const stockData = await getStockComplianceData();
  const turnoverData = await getInventoryTurnoverData();
  console.log("stockData",stockData);
  console.log("turnoverData",turnoverData);
  return (
    <AnalyticsTabs
      defaultValue="inventory"
    />
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
  
