"use client";

import * as React from "react";
import {
  Pie,
  PieChart,
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent 
} from "@/components/ui/chart";

interface StockComplianceGaugeProps {
  percentage: number;
  partsAboveMinimum: number;
  totalParts: number;
}

export function StockComplianceGauge({
  percentage,
  partsAboveMinimum,
  totalParts
}: StockComplianceGaugeProps) {
  // Define color scheme
  const chartConfig = {
    value: {
      label: "مقدار",
    },
    compliance: {
      label: "مطابقت",
      color: "#3B82F6", // Blue
    },
    remaining: {
      label: "باقیمانده",
      color: "#F97316", // Orange
    }
  } satisfies ChartConfig;
  
  // Create chart data - we need two slices: one for compliance and one for the remaining
  const chartData = [
    { 
      name: "compliance", 
      value: percentage,
      fill: "#3B82F6" // Blue
    },
    { 
      name: "remaining", 
      value: 100 - percentage,
      fill: "#F97316" // Orange
    }
  ];

  // Calculate total value (always 100)
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>سطح مطابقت موجودی</CardTitle>
        <CardDescription>
          درصد اقلام بالاتر از حداقل موجودی
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={5}
              startAngle={90}
              endAngle={-270}
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          مطابقت
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
        <div className="text-center">
          {partsAboveMinimum} از {totalParts} قطعه بالاتر از حداقل موجودی
        </div>
      </CardFooter>
    </Card>
  );
} 