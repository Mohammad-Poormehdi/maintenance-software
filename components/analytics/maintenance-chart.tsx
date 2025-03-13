"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, InfoIcon, PieChartIcon } from "lucide-react"

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
import { getMaintenanceData } from "@/app/actions/analytics"

// Define the type for our maintenance data
interface MaintenanceDataPoint {
  date: string
  scheduled: number
  other: number
}

const chartConfig = {
  scheduled: {
    label: "نگهداری پیشگیرانه",
    color: "#2563eb",
  },
  other: {
    label: "سایر رویدادها",
    color: "#dc2626",
  },
} satisfies ChartConfig

interface MaintenanceChartProps {
  initialData?: MaintenanceDataPoint[]
  title?: string
  description?: string
}

// Custom tooltip component to show more detailed information
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  const scheduled = payload[0]?.value || 0;
  const other = payload[1]?.value || 0;
  const total = scheduled + other;
  const scheduledPercentage = total > 0 ? Math.round((scheduled / total) * 100) : 0;
  const otherPercentage = total > 0 ? Math.round((other / total) * 100) : 0;

  return (
    <div className="bg-background border rounded-lg shadow-md p-3 text-right min-w-[200px]">
      <h4 className="font-medium mb-2 flex items-center gap-1.5">
        <InfoIcon className="h-4 w-4" />
        {new Date(label).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long"
        })}
      </h4>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></div>
            نگهداری پیشگیرانه:
          </span>
          <span className="font-medium">
            {new Intl.NumberFormat('fa-IR').format(scheduled)} ({scheduledPercentage}%)
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></div>
            سایر رویدادها:
          </span>
          <span className="font-medium">
            {new Intl.NumberFormat('fa-IR').format(other)} ({otherPercentage}%)
          </span>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1.5">
              <PieChartIcon className="h-4 w-4" />
              کل رویدادها:
            </span>
            <span className="font-medium">
              {new Intl.NumberFormat('fa-IR').format(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MaintenanceChart({
  initialData = [],
  title = "روند رویدادهای نگهداری",
  description = "مقایسه نگهداری پیشگیرانه با سایر رویدادهای نگهداری در سال گذشته",
}: MaintenanceChartProps) {
  const [data, setData] = React.useState<MaintenanceDataPoint[]>(initialData)
  const [isLoading, setIsLoading] = React.useState(initialData.length === 0)
  const [trend, setTrend] = React.useState<{ percentage: number; isPositive: boolean }>({ 
    percentage: 0, 
    isPositive: true 
  })

  // Fetch data for the past year
  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const months = 12 // Always fetch 1 year of data
      
      try {
        const maintenanceData = await getMaintenanceData(months)
        
        // Transform data to match the component's interface
        const transformedData = maintenanceData.map((item: { date: string; scheduled: number; other: number }) => ({
          date: item.date,
          scheduled: item.scheduled,
          other: item.other
        }))
        
        setData(transformedData)
        
        // Calculate trend
        if (transformedData.length >= 2) {
          const lastMonth = transformedData[transformedData.length - 1];
          const previousMonth = transformedData[transformedData.length - 2];
          
          const currentRatio = lastMonth.scheduled / (lastMonth.scheduled + lastMonth.other || 1);
          const previousRatio = previousMonth.scheduled / (previousMonth.scheduled + previousMonth.other || 1);
          
          if (previousRatio > 0) {
            const percentageChange = ((currentRatio - previousRatio) / previousRatio) * 100;
            setTrend({
              percentage: Math.abs(parseFloat(percentageChange.toFixed(1))),
              isPositive: currentRatio > previousRatio
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch maintenance data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate maintenance stats
  const calculateMaintenanceStats = () => {
    if (!data.length) return { totalScheduled: 0, totalOther: 0, totalEvents: 0 }
    
    const totalScheduled = data.reduce((acc, item) => acc + (item.scheduled || 0), 0)
    const totalOther = data.reduce((acc, item) => acc + (item.other || 0), 0)
    
    return {
      totalScheduled,
      totalOther,
      totalEvents: totalScheduled + totalOther
    }
  }
  
  const { totalScheduled, totalOther, totalEvents } = calculateMaintenanceStats()
  const scheduledPercentage = totalEvents > 0 
    ? Math.round((totalScheduled / totalEvents) * 100) 
    : 0
  
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
            <p className="text-muted-foreground">در حال بارگذاری داده‌های نگهداری...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <p className="text-muted-foreground">داده‌های نگهداری برای سال گذشته موجود نیست</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart 
              data={data} 
              accessibilityLayer
              margin={{
                left: 12,
                right: 12,
              }}
            >
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
                tickFormatter={(value) => `${new Intl.NumberFormat('fa-IR').format(value)}`}
              />
              <ChartTooltip 
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone"
                dataKey="scheduled" 
                stroke={chartConfig.scheduled.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone"
                dataKey="other" 
                stroke={chartConfig.other.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 text-sm border-t p-6">
        <div className="flex w-full items-start gap-2">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.isPositive ? (
                <>نگهداری پیشگیرانه {trend.percentage}% افزایش یافته است <TrendingUp className="h-4 w-4 text-green-500" /></>
              ) : (
                <>نگهداری پیشگیرانه {trend.percentage}% کاهش یافته است <TrendingDown className="h-4 w-4 text-red-500" /></>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              نمایش مقایسه رویدادهای نگهداری برای سال گذشته
            </div>
          </div>
        </div>
        
        {!isLoading && data.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">آمار رویدادهای نگهداری</div>
              <div className="text-muted-foreground text-xs">{new Intl.NumberFormat('fa-IR').format(totalEvents)} رویداد در مجموع</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2563eb" }}></div>
                  <span className="text-sm font-medium">نگهداری پیشگیرانه</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-bold">{new Intl.NumberFormat('fa-IR').format(totalScheduled)}</span>
                  <span className="text-sm text-muted-foreground">{scheduledPercentage}%</span>
                </div>
              </div>
              
              <div className="flex flex-col p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#dc2626" }}></div>
                  <span className="text-sm font-medium">سایر رویدادها</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-bold">{new Intl.NumberFormat('fa-IR').format(totalOther)}</span>
                  <span className="text-sm text-muted-foreground">{100 - scheduledPercentage}%</span>
                </div>
              </div>
            </div>
            
            <p className="mt-3 text-xs text-muted-foreground">
              این نمودار تعداد رویدادهای نگهداری پیشگیرانه را در مقایسه با سایر انواع رویدادهای نگهداری نشان می‌دهد. افزایش نسبت نگهداری پیشگیرانه معمولاً نشان‌دهنده کاهش خرابی‌های ناگهانی و بهبود پایداری سیستم است.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
