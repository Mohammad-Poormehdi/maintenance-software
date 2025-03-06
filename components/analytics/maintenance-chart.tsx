"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMaintenanceEventsData } from "@/app/actions/analytics"

// Define the type for our maintenance data
interface MaintenanceDataPoint {
  date: string
  preventive: number
  reactive: number
}

const chartConfig = {
  preventive: {
    label: "پیشگیرانه",
    color: "#3b82f6",
  },
  reactive: {
    label: "واکنشی",
    color: "#ef4444",
  },
} satisfies ChartConfig

interface MaintenanceChartProps {
  initialData?: MaintenanceDataPoint[]
  title?: string
  description?: string
}

export function MaintenanceChart({
  initialData = [],
  title = "فعالیت‌های نگهداری",
  description = "مرور نگهداری برنامه‌ریزی شده در مقابل نگهداری اضطراری",
}: MaintenanceChartProps) {
  const [timeRange, setTimeRange] = React.useState("3m")
  const [data, setData] = React.useState<MaintenanceDataPoint[]>(initialData)
  const [isLoading, setIsLoading] = React.useState(initialData.length === 0)

  // Fetch data when the time range changes
  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      let months = 3 // default for 3m
      
      if (timeRange === "1m") {
        months = 1
      } else if (timeRange === "6m") {
        months = 6
      } else if (timeRange === "1y") {
        months = 12
      }
      
      try {
        const maintenanceData = await getMaintenanceEventsData(months)
        setData(maintenanceData)
      } catch (error) {
        console.error("Failed to fetch maintenance data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [timeRange])
  
  // Calculate percentage of preventive vs reactive maintenance
  const calculateMaintenanceDistribution = () => {
    if (!data.length) return { preventivePercentage: 0, reactivePercentage: 0, total: 0 }
    
    const totals = data.reduce((acc, item) => {
      acc.preventive += item.preventive
      acc.reactive += item.reactive
      return acc
    }, { preventive: 0, reactive: 0 })
    
    const total = totals.preventive + totals.reactive
    
    return {
      preventivePercentage: total ? Math.round((totals.preventive / total) * 100) : 0,
      reactivePercentage: total ? Math.round((totals.reactive / total) * 100) : 0,
      total
    }
  }
  
  const { preventivePercentage, reactivePercentage, total } = calculateMaintenanceDistribution()
  
  return (
    <Card dir="rtl" className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-right">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger dir="rtl"
            className="w-[160px] rounded-lg sm:mr-auto"
            aria-label="انتخاب بازه زمانی"
          >
            <SelectValue placeholder="۳ ماه گذشته" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1m" className="rounded-lg">
              ماه گذشته
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              ۳ ماه گذشته
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              ۶ ماه گذشته
            </SelectItem>
            <SelectItem value="1y" className="rounded-lg">
              سال گذشته
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">در حال بارگذاری داده‌های نگهداری...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">داده‌های نگهداری برای این دوره موجود نیست</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart data={data} accessibilityLayer>
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
                    day: "numeric",
                  })
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={{
                  fill: 'rgba(0, 0, 0, 0.1)',
                  strokeDasharray: '3 3',
                  strokeWidth: 1,
                  stroke: '#ccc',
                  radius: 4,
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
                    indicator="dashed"
                  />
                }
              />
              <Bar 
                dataKey="preventive" 
                fill="#3b82f6"
                radius={4} 
              />
              <Bar 
                dataKey="reactive" 
                fill="#ef4444"
                radius={4} 
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm border-t p-6">
        <div className="leading-none text-muted-foreground">
          نمایش فعالیت‌های نگهداری برای دوره انتخاب شده
        </div>
        
        {!isLoading && data.length > 0 && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">توزیع فعالیت‌های نگهداری</div>
              <div className="text-muted-foreground text-xs">{total} مورد در مجموع</div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2.5 mb-3">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${preventivePercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>پیشگیرانه: {preventivePercentage}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>واکنشی: {reactivePercentage}%</span>
              </div>
            </div>
            
            <p className="mt-3 text-xs text-muted-foreground">
              {preventivePercentage > reactivePercentage 
                ? "نسبت بالای نگهداری پیشگیرانه نشان‌دهنده مدیریت مؤثر تجهیزات است."
                : "نسبت بالای نگهداری واکنشی ممکن است نیاز به بهبود برنامه نگهداری پیشگیرانه را نشان دهد."}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
