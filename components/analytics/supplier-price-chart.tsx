"use client"

import { TrendingDown } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { useEffect, useState } from "react"

import { getSuppliersTotalPrices } from "@/app/actions/analytics"
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
import { Badge } from "@/components/ui/badge"

// Client-side implementation of the chart
function SupplierPriceChartContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [suppliersData, setSuppliersData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getSuppliersTotalPrices()
        setSuppliersData(data)
      } catch (err) {
        console.error("Failed to fetch supplier data:", err)
        setError("خطا در دریافت داده‌ها")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>
  }
  
  if (suppliersData.length === 0) {
    return <p className="text-center text-muted-foreground">داده‌ای برای نمایش وجود ندارد</p>
  }

  // Get max price for normalization
  const maxPrice = Math.max(...suppliersData.map(item => item.totalPrice))

  // Transform data for the radar chart
  const chartData = suppliersData.map(item => ({
    supplier: item.name,
    totalPrice: item.totalPrice,
    partsCount: item.partsCount,
    preferredPartsCount: item.preferredPartsCount,
    contactPerson: item.contactPerson,
    email: item.email,
    phone: item.phone,
    // Add a normalized value between 0-100 for better visualization
    normalizedPrice: (item.totalPrice / maxPrice) * 100
  }))

  // Create chart config with a single price series
  const chartConfig = {
    normalizedPrice: {
      label: "مجموع قیمت نسبی",
      color: "var(--chart-2)",
    }
  } as ChartConfig

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-[4/3] w-full max-w-full"
    >
      <RadarChart 
        data={chartData}
        width={500}
        height={375}
      >
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarAngleAxis 
          dataKey="supplier" 
          tick={{ 
            fill: 'var(--foreground)', 
            fontSize: 11,
            textAnchor: 'middle',
            dy: 4
          }}
        />
        <PolarGrid />
        <Radar
          dataKey="normalizedPrice"
          fill="var(--chart-2)"
          fillOpacity={0.3}
          stroke="var(--chart-2)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  )
}

// Loading fallback
function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <p>در حال بارگیری...</p>
    </div>
  )
}

// Main exported component - no longer needs Suspense since we're managing loading state in the content component
export function SupplierPriceChart() {
  return (
    <Card dir="ltr">
      <CardHeader className="items-center pb-4">
        <CardTitle>مقایسه قیمت کلی تامین‌کنندگان</CardTitle>
        <CardDescription>
          مقایسه مجموع قیمت تمام قطعات هر تامین‌کننده
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <SupplierPriceChartContent />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          مقایسه قیمت تامین‌کنندگان <TrendingDown className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground text-xs">
          * قیمت‌ها به صورت نسبی نمایش داده شده‌اند
        </div>
      </CardFooter>
    </Card>
  )
}

