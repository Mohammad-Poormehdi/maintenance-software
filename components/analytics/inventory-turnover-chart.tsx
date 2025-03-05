"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
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

interface InventoryTurnoverData {
  month: string;
  turnoverRate: number;
}

interface InventoryTurnoverChartProps {
  data: InventoryTurnoverData[];
  trend: number;
}

const chartConfig = {
  turnoverRate: {
    label: "نرخ گردش",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function InventoryTurnoverChart({ data, trend }: InventoryTurnoverChartProps) {
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  
  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>نرخ گردش موجودی</CardTitle>
        <CardDescription>روند ۶ ماهه اخیر</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="turnoverRate"
                stroke={chartConfig.turnoverRate.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend >= 0 ? "افزایش" : "کاهش"} {Math.abs(trend)}% نسبت به ماه قبل{" "}
          <TrendIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          نمایش نرخ گردش موجودی در ۶ ماه گذشته
        </div>
      </CardFooter>
    </Card>
  );
}
