"use client"

import { useEffect, useState } from "react"
import { TrendingDown } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PartPriceData {
  supplier: string;
  price: number;
  isPreferred: boolean;
  lastUpdate?: string;
  reliability?: number;
  leadTime?: number;
}

interface PartPriceChartProps {
  partId: string;
}

export function PartPriceChart({ partId }: PartPriceChartProps) {
  const [data, setData] = useState<{
    data: PartPriceData[];
    loading: boolean;
  }>({
    data: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/parts/${partId}/prices`);
        const priceData = await response.json();
        setData({
          data: priceData,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching part price data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, [partId]);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>در حال بارگیری...</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return null;
  }

  // Get min and max prices for scaling
  const prices = data.data.map(item => item.price);
  const maxPrice = Math.max(...prices);

  // Transform data for the radar chart - one entry per supplier
  const chartData = data.data.map(item => ({
    supplier: item.supplier + (item.isPreferred ? ' (ترجیحی)' : ''),
    price: item.price,
    // Keep the original fields for tooltip
    reliability: item.reliability,
    leadTime: item.leadTime,
    lastUpdate: item.lastUpdate,
    // Add a normalized value between 0-100 for better visualization
    normalizedPrice: (item.price / maxPrice) * 100
  }));

  // Create chart config with a single price series
  const chartConfig = {
    normalizedPrice: {
      label: "قیمت نسبی",
      color: "var(--chart-1)",
    }
  } as ChartConfig;

  return (
    <Card dir="ltr">
      <CardHeader className="items-center pb-4">
        <CardTitle>مقایسه قیمت تامین‌کنندگان</CardTitle>
        <CardDescription>
          مقایسه قیمت این قطعه بین تامین‌کنندگان مختلف
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-[4/3] w-full max-w-full"
        >
          <RadarChart 
            data={chartData}
            width={500}
            height={375}
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <ChartTooltipContent>
                      <div className="flex flex-col gap-2 p-1">
                        <div className="flex items-center justify-between gap-2 border-b pb-1">
                          <span className="font-medium text-foreground">{data.supplier}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">قیمت:</span>
                            <span className="font-medium">
                              {data.price.toLocaleString('fa-IR')} ریال
                            </span>
                          </div>
                          {data.reliability !== undefined && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">امتیاز اعتبار:</span>
                              <span className="font-medium">
                                {data.reliability}٪
                              </span>
                            </div>
                          )}
                          {data.leadTime !== undefined && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">زمان تحویل:</span>
                              <span className="font-medium">
                                {data.leadTime} روز
                              </span>
                            </div>
                          )}
                          {data.lastUpdate && (
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t">
                              <span>آخرین به‌روزرسانی:</span>
                              <span>{new Date(data.lastUpdate).toLocaleDateString('fa-IR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </ChartTooltipContent>
                  );
                }
                return null;
              }}
            />
            <PolarAngleAxis 
              dataKey="supplier" 
              tick={{ 
                fill: 'var(--foreground)', 
                fontSize: 11,
                textAnchor: 'middle',
                dy: 4
              }}
            />
            <PolarGrid />
            <Radar
              dataKey="normalizedPrice"
              fill="var(--chart-1)"
              fillOpacity={0.3}
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          مقایسه قیمت تامین‌کنندگان <TrendingDown className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground text-xs">
          * اعداد به صورت نسبی نمایش داده شده‌اند
        </div>
      </CardFooter>
    </Card>
  );
} 