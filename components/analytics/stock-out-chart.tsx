"use client"

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getStockOutData } from "@/app/actions/analytics";

interface StockOutData {
  name: string;
  stockOuts: number;
}

const chartConfig = {
  stockOuts: {
    label: "تعداد کمبود",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function StockOutChart() {
  const [data, setData] = useState<StockOutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const stockOutData = await getStockOutData();
        setData(stockOutData);
      } catch (error) {
        console.error("Error fetching stock-out data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>در حال بارگیری...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>کمبود موجودی</CardTitle>
        <CardDescription>تعداد دفعات کمبود موجودی در ۶ ماه گذشته</CardDescription>
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
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
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
                dataKey="stockOuts"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
