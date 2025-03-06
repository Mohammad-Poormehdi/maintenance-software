import { getMaintenanceEventsData } from "@/app/actions/analytics"
import { MaintenanceChart } from "@/components/analytics/maintenance-chart"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export default async function MaintenanceAnalyticsPage() {
  // Pre-fetch 3 months of data
  const initialData = await getMaintenanceEventsData(3)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Analytics</h1>
        <p className="text-muted-foreground">
          Track and analyze preventive vs reactive maintenance trends
        </p>
      </div>
      
      <MaintenanceChart 
        initialData={initialData}
        title="Maintenance Activities"
        description="Comparison of scheduled vs unscheduled maintenance events"
      />
      
      {/* You can add more analytics components here */}
    </div>
  )
} 