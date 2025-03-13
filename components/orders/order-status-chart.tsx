"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"
import { useEffect, useState } from "react"

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
import { getOrderStatusData, OrderStatusData } from "@/app/actions/orders"
import { OrderStatus } from "@prisma/client"

// Define the type for our chart data
interface OrderStatusChartData {
  status: string
  count: number
  fill: string
}

// Type to ensure status config has a color property
type StatusConfig = {
  label: string
  color: string
}

// Define the chart config with colors for each status
const chartConfig = {
  count: {
    label: "سفارشات",
  },
  PENDING: {
    label: "در انتظار",
    color: "#64748b", // slate-500, lighter and more vibrant
  },
  APPROVED: {
    label: "تایید شده",
    color: "#3b82f6", // blue-500, brighter blue
  },
  SHIPPED: {
    label: "ارسال شده",
    color: "#6366f1", // indigo-500, brighter indigo
  },
  DELIVERED: {
    label: "تحویل داده شده",
    color: "#22c55e", // green-500, brighter green
  },
  CANCELLED: {
    label: "لغو شده",
    color: "#ef4444", // red-500, brighter red
  },
} satisfies ChartConfig

// Default color for fallback
const DEFAULT_COLOR = "#64748b" // slate-500

export function OrderStatusChart() {
  const [chartData, setChartData] = useState<OrderStatusChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getOrderStatusData()
        
        // Transform the data for the chart
        const transformedData = Object.entries(data).map(([status, count]) => {
          // Get the config for this status or use a default color
          const statusConfig = chartConfig[status as keyof typeof chartConfig] as StatusConfig | undefined
          return {
            status,
            count: count as number,
            fill: statusConfig?.color || DEFAULT_COLOR,
          }
        })
        
        setChartData(transformedData)
        
        // Calculate total orders
        const total = transformedData.reduce((sum, item) => sum + item.count, 0)
        setTotalOrders(total)
      } catch (err) {
        setError("خطا در بارگذاری اطلاعات")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>وضعیت سفارشات</CardTitle>
          <CardDescription>در حال بارگذاری...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>وضعیت سفارشات</CardTitle>
          <CardDescription className="text-destructive">خطا در بارگذاری اطلاعات</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>وضعیت سفارشات</CardTitle>
        <CardDescription>توزیع وضعیت فعلی</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="count" 
              label 
              nameKey="status" 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex items-center justify-center text-sm">
        <div className="leading-none text-muted-foreground">
          نمایش توزیع {totalOrders} سفارش
        </div>
      </CardFooter>
    </Card>
  )
}
