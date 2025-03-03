import { Suspense } from "react";
import { MaintenanceScheduleDisplay } from "@/components/maintenance/maintenance-schedule-display";
import { SchedulesSkeleton } from "@/components/maintenance/schedules-skeleton";
import { getMaintenanceSchedules, getCompletedMaintenanceEvents } from "@/lib/db/maintenance";

export const dynamic = "force-dynamic";

export default async function MaintenanceSchedulePage() {
  const [schedules, completedEvents] = await Promise.all([
    getMaintenanceSchedules(),
    getCompletedMaintenanceEvents()
  ]);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">برنامه تعمیر و نگهداری</h1>
        <p className="text-muted-foreground">
          تمامی وظایف تعمیر و نگهداری آینده تجهیزات خود را مشاهده و مدیریت کنید.
        </p>
      </div>    
      
      <Suspense fallback={<SchedulesSkeleton />}>
        <MaintenanceScheduleDisplay 
          schedules={schedules} 
          completedEvents={completedEvents} 
        />
      </Suspense>
    </div>
  );
}

