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
import { getSupplierPriceData } from "@/app/actions/analytics"

interface SupplierPriceData {
  part: string;
  [supplier: string]: string | number;
}

export function SupplierPriceChart() {
  const [data, setData] = useState<{
    data: SupplierPriceData[];
    suppliers: string[];
    loading: boolean;
  }>({
    data: [],
    suppliers: [],
    loading: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const priceData = await getSupplierPriceData();
        setData({
          ...priceData,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching supplier price data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>در حال بارگیری...</p>
      </div>
    );
  }

  // Create chart config dynamically based on suppliers
  const chartConfig = data.suppliers.reduce((config, supplier) => {
    config[supplier] = {
      label: supplier,
      color: `var(--chart-${Object.keys(config).length + 1})`,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>مقایسه قیمت تامین‌کنندگان</CardTitle>
        <CardDescription>
          مقایسه قیمت قطعات مشترک بین تامین‌کنندگان
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={data.data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="part" />
            <PolarGrid radialLines={false} />
            {data.suppliers.map((supplier, index) => (
              <Radar
                key={supplier}
                dataKey={supplier}
                fill={`var(--chart-${index + 1})`}
                fillOpacity={0.1}
                stroke={`var(--chart-${index + 1})`}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          مقایسه قیمت تامین‌کنندگان <TrendingDown className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          نمایش قیمت قطعات مشترک بین تامین‌کنندگان
        </div>
      </CardFooter>
    </Card>
  );
}
