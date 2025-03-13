"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getOrdersData } from "@/app/actions/analytics"

// Define the type for our order data
interface OrderDataPoint {
  date: string
  deliveredAmount: number
}

const chartConfig = {
  deliveredAmount: {
    label: "مبلغ تکمیل‌شده (ریال)",
    color: "#22c55e",
  },
} satisfies ChartConfig

// Helper function to format currency in Rial
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

interface OrdersChartProps {
  initialData?: OrderDataPoint[]
  title?: string
  description?: string
}

export function OrdersChart({
  initialData = [],
  title = "روند مالی سفارشات",
  description = "مرور درآمد سفارشات تکمیل‌شده در یک سال گذشته (تمامی مبالغ به ریال)",
}: OrdersChartProps) {
  const [data, setData] = React.useState<OrderDataPoint[]>(initialData)
  const [isLoading, setIsLoading] = React.useState(initialData.length === 0)

  // Fetch data on component mount
  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const ordersData = await getOrdersData(12) // Always fetch 12 months
        const transformedData = ordersData.map(order => ({
          date: order.date,
          deliveredAmount: order.delivered
        }))
        setData(transformedData)
      } catch (error) {
        console.error("Failed to fetch orders data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate total order amounts
  const calculateOrderStats = () => {
    if (!data.length) return { totalDeliveredAmount: 0, totalAmount: 0 }
    
    const totalDeliveredAmount = data.reduce((acc, item) => {
      return acc + (item.deliveredAmount || 0)
    }, 0)
    
    return {
      totalDeliveredAmount,
      totalAmount: totalDeliveredAmount
    }
  }
  
  const { totalDeliveredAmount, totalAmount } = calculateOrderStats()
  
  return (
    <Card dir="rtl" className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-right">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">در حال بارگذاری داده‌های مالی سفارشات...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">داده‌های مالی سفارشات برای این دوره موجود نیست</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data} accessibilityLayer>
              <defs>
                <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.deliveredAmount.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.deliveredAmount.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("fa-IR", {
                    month: "short",
                  })
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${new Intl.NumberFormat('fa-IR', { notation: 'compact', compactDisplay: 'short' }).format(value)}`}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'rgba(0, 0, 0, 0.2)',
                  strokeWidth: 1,
                  strokeDasharray: '3 3'
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("fa-IR", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })
                    }}
                    formatter={(value) => {
                      // Ensure value is converted to a number before formatting
                      const numValue = typeof value === 'string' ? parseFloat(value) : value;
                      return [`${new Intl.NumberFormat('fa-IR').format(Number(numValue))} ریال`, undefined];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area 
                type="monotone"
                dataKey="deliveredAmount" 
                stroke={chartConfig.deliveredAmount.color}
                fill="url(#fillDelivered)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm border-t p-6">
        <div className="leading-none text-muted-foreground">
          نمایش گردش مالی سفارشات به ریال در دوره زمانی انتخاب شده (تمامی مبالغ به ریال)
        </div>
        
        {!isLoading && data.length > 0 && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">آمار مالی سفارشات (ریال)</div>
              <div className="text-muted-foreground text-xs">{formatCurrency(totalAmount)} در مجموع</div>
            </div>
            
            <div className="flex flex-col p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">ارزش سفارشات تکمیل‌شده (ریال)</span>
              </div>
              <div className="mt-2 text-xl font-bold">{formatCurrency(totalDeliveredAmount)}</div>
            </div>
            
            <p className="mt-3 text-xs text-muted-foreground">
              این نمودار ارزش مالی سفارشات تکمیل‌شده را نشان می‌دهد. تمامی مبالغ به ریال نمایش داده می‌شوند و به شما کمک می‌کند روند درآمدی کسب و کار خود را تحلیل کنید.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
