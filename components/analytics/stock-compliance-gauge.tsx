"use client";

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
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

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
  // Use direct blue color values
  const blueColor = "#3B82F6"; // Direct hex for blue

  const chartData = [
    { 
      name: "compliance", 
      value: percentage, 
      fill: blueColor 
    },
  ];

  const chartConfig = {
    value: {
      label: "Compliance",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>سطح مطابقت موجودی</CardTitle>
        <CardDescription>
          درصد اقلام بالاتر از حداقل موجودی
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
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
              dataKey="value" 
              background 
              cornerRadius={10} 
              fill={blueColor}  // Explicitly set fill here too
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
                          {percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          مطابقت
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
          {partsAboveMinimum} از {totalParts} قطعه بالاتر از حداقل موجودی
        </div>
      </CardFooter>
    </Card>
  );
} 