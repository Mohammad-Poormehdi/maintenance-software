"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the types for our data
interface EquipmentStatusData {
  status: string;
  count: number;
  fill: string;
}

interface EquipmentStatusPieProps {
  title?: string;
  description?: string;
}

// Chart configuration with colors for equipment statuses
const chartConfig = {
  count: {
    label: "تعداد",
  },
  HEALTHY: {
    label: "سالم",
    color: "hsl(143, 85%, 43%)",
  },
  NEEDS_REPAIR: {
    label: "نیاز به تعمیر",
    color: "hsl(50, 100%, 50%)",
  },
  NEEDS_REPLACEMENT: {
    label: "نیاز به تعویض",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

export function EquipmentStatusPieChart({ title = "وضعیت تجهیزات", description = "نمایش تعداد قطعات بر اساس وضعیت" }: EquipmentStatusPieProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<EquipmentStatusData[]>([]);
  
  useEffect(() => {
    async function fetchEquipmentStatusData() {
      try {
        // In a real implementation, you would fetch this data from an API endpoint
        // For now, we'll use mock data
        const response = await fetch('/api/analytics/equipment-status');
        const data = await response.json();
        
        setChartData([
          { 
            status: "HEALTHY", 
            count: data.HEALTHY || 24, // Fallback to demo data
            fill: chartConfig.HEALTHY.color 
          },
          { 
            status: "NEEDS_REPAIR", 
            count: data.NEEDS_REPAIR || 12, // Fallback to demo data
            fill: chartConfig.NEEDS_REPAIR.color 
          },
          { 
            status: "NEEDS_REPLACEMENT", 
            count: data.NEEDS_REPLACEMENT || 8, // Fallback to demo data
            fill: chartConfig.NEEDS_REPLACEMENT.color 
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching equipment status data:", error);
        
        // Fallback to demo data in case of error
        setChartData([
          { status: "HEALTHY", count: 24, fill: chartConfig.HEALTHY.color },
          { status: "NEEDS_REPAIR", count: 12, fill: chartConfig.NEEDS_REPAIR.color },
          { status: "NEEDS_REPLACEMENT", count: 8, fill: chartConfig.NEEDS_REPLACEMENT.color },
        ]);
        setLoading(false);
      }
    }

    fetchEquipmentStatusData();
  }, []);

  const totalParts = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const healthyPercentage = useMemo(() => {
    const healthyCount = chartData.find(item => item.status === "HEALTHY")?.count || 0;
    return totalParts > 0 ? Math.round((healthyCount / totalParts) * 100) : 0;
  }, [chartData, totalParts]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>در حال بارگیری...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalParts}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          قطعات
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {healthyPercentage >= 70 ? (
            <>
              <span className="text-green-600">{healthyPercentage}% تجهیزات در وضعیت سالم</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              <span className="text-amber-600">تنها {healthyPercentage}% تجهیزات در وضعیت سالم</span>
              <TrendingDown className="h-4 w-4 text-amber-600" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          نمایش وضعیت تمامی قطعات بر اساس آخرین بررسی
        </div>
      </CardFooter>
    </Card>
  );
} 