"use client";

import { useEffect, useState } from "react";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label
} from "recharts";

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
  ChartContainer 
} from "@/components/ui/chart";
import { fetchOrderCancellationData } from "@/app/actions/analytics";

interface OrderCancellationData {
  percentage: number;
  cancelledOrders: number;
  totalOrders: number;
}

export function OrderCancellationChart() {
  const [data, setData] = useState<OrderCancellationData>({
    percentage: 0,
    cancelledOrders: 0,
    totalOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchOrderCancellationData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch order cancellation data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Use a red color for the gauge as cancellations are generally negative indicators
  const chartConfig = {
    cancellation: {
      label: "لغو شده",
      color: "#EF4444", // Red
    },
  } satisfies ChartConfig;

  // Calculate end angle based on percentage (250 is the maximum angle)
  const endAngle = Math.min(360, (data.percentage / 100) * 360);

  // Create chart data
  const chartData = [
    { 
      name: "order-cancellation", 
      cancellation: data.percentage,
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>نسبت لغو سفارشات</CardTitle>
        <CardDescription>
          درصد سفارشات لغو شده از کل سفارشات
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar 
              dataKey="cancellation" 
              background 
              cornerRadius={10} 
              fill="#EF4444" 
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {data.percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          لغو شده
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-center">
          {data.cancelledOrders} از {data.totalOrders} سفارش لغو شده
        </div>
      </CardFooter>
    </Card>
  );
}
