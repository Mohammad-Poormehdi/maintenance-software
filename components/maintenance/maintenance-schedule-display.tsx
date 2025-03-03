"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import { Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { MaintenanceScheduleWithStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { updateScheduleAction } from "@/app/maintenance-schedule/actions";

interface MaintenanceScheduleDisplayProps {
  schedules: MaintenanceScheduleWithStatus[];
  completedEvents: any[]; // Update this with a more specific type if available
}

export function MaintenanceScheduleDisplay({ schedules, completedEvents }: MaintenanceScheduleDisplayProps) {
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  
  const overdueSchedules = schedules.filter(schedule => schedule.status === "overdue");
  const dueSoonSchedules = schedules.filter(schedule => schedule.status === "due-soon");
  const upcomingSchedules = schedules.filter(schedule => schedule.status === "upcoming");
  
  async function handleComplete(id: string) {
    try {
      setIsSubmitting(prev => ({ ...prev, [id]: true }));
      await updateScheduleAction(id);
      toast.success("تعمیر و نگهداری به عنوان تکمیل شده علامت گذاری و مجدداً زمانبندی شد.");
    } catch (error) {
      toast.error("تکمیل تعمیر و نگهداری ناموفق بود.");
    } finally {
      setIsSubmitting(prev => ({ ...prev, [id]: false }));
    }
  }
  
  return (
    <Tabs defaultValue="all" className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="all">همه</TabsTrigger>
        <TabsTrigger value="overdue" className="relative">
          تاخیر
          {overdueSchedules.length > 0 && (
            <Badge variant="destructive" className="mr-2">
              {overdueSchedules.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="due-soon">به زودی</TabsTrigger>
        <TabsTrigger value="upcoming">آینده</TabsTrigger>
      </TabsList>
      
      {["all", "overdue", "due-soon", "upcoming"].map(tab => (
        <TabsContent key={tab} value={tab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(tab === "all" ? schedules : 
              tab === "overdue" ? overdueSchedules :
              tab === "due-soon" ? dueSoonSchedules : upcomingSchedules
            ).map(schedule => (
              <ScheduleCard 
                key={schedule.id}
                schedule={schedule}
                onComplete={() => handleComplete(schedule.id)}
                isSubmitting={!!isSubmitting[schedule.id]}
              />
            ))}
            
            {(tab === "all" ? schedules : 
              tab === "overdue" ? overdueSchedules :
              tab === "due-soon" ? dueSoonSchedules : upcomingSchedules
            ).length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-muted-foreground">برنامه تعمیر و نگهداری یافت نشد.</p>
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

interface ScheduleCardProps {
  schedule: MaintenanceScheduleWithStatus;
  onComplete: () => void;
  isSubmitting: boolean;
}

function ScheduleCard({ schedule, onComplete, isSubmitting }: ScheduleCardProps) {
  const { name, description, nextDue, lastExecuted, frequency, status, daysUntilDue } = schedule;
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-md text-right",
      status === "overdue" && "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900",
      status === "due-soon" && "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900",
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <StatusBadge status={status} daysUntilDue={daysUntilDue} />
          <CardTitle className="flex-1 text-right">{name}</CardTitle>
        </div>
        <CardDescription>
          {description || "توضیحی ارائه نشده است"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-row-reverse">
          <span>
            تاریخ بعدی: <strong>{new Date(nextDue).toLocaleDateString('fa-IR')}</strong>
          </span>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 flex-row-reverse">
          <span>هر {frequency} روز</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        {lastExecuted && (
          <div className="flex items-center gap-2 flex-row-reverse">
            <span>آخرین انجام: {new Date(lastExecuted).toLocaleDateString('fa-IR')}</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={onComplete}
          disabled={isSubmitting}
          variant={isPast(new Date(nextDue)) ? "destructive" : "default"}
        >
          {isSubmitting ? "در حال پردازش..." : "علامت گذاری به عنوان تکمیل شده"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status, daysUntilDue }: { status: string, daysUntilDue: number }) {
  if (status === "overdue") {
    return (
      <Badge variant="destructive" className="flex items-center gap-1 flex-row-reverse">
        {Math.abs(daysUntilDue)} روز تاخیر
        <AlertTriangle className="h-3 w-3" />
      </Badge>
    );
  }
  
  if (status === "due-soon") {
    return (
      <Badge variant="outline" className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 flex-row-reverse">
        {daysUntilDue} روز تا موعد
        <Clock className="h-3 w-3" />
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 flex-row-reverse">
      در {daysUntilDue} روز
      <Calendar className="h-3 w-3" />
    </Badge>
  );
} 