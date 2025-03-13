import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, Clock } from "lucide-react";

interface MaintenanceKPIProps {
  count: number;
  loading?: boolean;
}

function MaintenanceKPILoading({ title }: { title: string }) {
  return (
    <Card className="col-span-1 shadow-md border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 animate-pulse">
          <p>در حال بارگیری...</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DelayedMaintenanceKPI({
  count,
  loading = false
}: MaintenanceKPIProps) {
  if (loading) {
    return <MaintenanceKPILoading title="تعمیرات تاخیر افتاده" />;
  }

  return (
    <Card className={`col-span-1 shadow-md overflow-hidden ${
      count > 0 
        ? 'border-t-4 border-t-red-500 bg-gradient-to-b from-red-50 to-white dark:from-red-950/30 dark:to-slate-900' 
        : 'border-t-4 border-t-green-500 bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-slate-900'
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${
          count > 0 
            ? 'text-red-700 dark:text-red-400' 
            : 'text-green-700 dark:text-green-400'
        }`}>تعمیرات تاخیر افتاده</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant={count > 0 ? "destructive" : "default"} className={`flex items-center ${
          count > 0 
            ? 'bg-red-100 border-red-300 dark:bg-red-950/20 dark:border-red-800/60' 
            : 'bg-green-100 border-green-300 dark:bg-green-950/20 dark:border-green-800/60'
        }`}>
          <AlertCircle className={`h-5 w-5 mr-2 ${
            count > 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`} />
          <div>
            <AlertDescription className="flex items-center mt-1">
              <span className={`text-3xl font-bold ${
                count > 0 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-green-700 dark:text-green-400'
              }`}>{count}</span>
              <span className="mr-2 text-lg">مورد</span>
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function UpcomingWeekMaintenanceKPI({
  count,
  loading = false
}: MaintenanceKPIProps) {
  if (loading) {
    return <MaintenanceKPILoading title="تعمیرات در هفته آینده" />;
  }

  return (
    <Card className="col-span-1 shadow-md border-t-4 border-t-amber-500 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-amber-700 dark:text-amber-400">تعمیرات در هفته آینده</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="flex items-center bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/60 dark:text-amber-300">
          <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
          <div>
            <AlertDescription className="flex items-center mt-1">
              <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">{count}</span>
              <span className="mr-2 text-lg">مورد</span>
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function FutureMaintenanceKPI({
  count,
  loading = false
}: MaintenanceKPIProps) {
  if (loading) {
    return <MaintenanceKPILoading title="تعمیرات آینده" />;
  }

  return (
    <Card className="col-span-1 shadow-md border-t-4 border-t-blue-500 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-700 dark:text-blue-400">تعمیرات آینده</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="flex items-center bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800/60 dark:text-blue-300">
          <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          <div>
            <AlertDescription className="flex items-center mt-1">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{count}</span>
              <span className="mr-2 text-lg">مورد</span>
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Keep the original component for backward compatibility if needed
export function MaintenanceScheduleKPI({
  delayedCount,
  dueWithinWeekCount,
  futureCount,
  loading = false
}: {
  delayedCount: number;
  dueWithinWeekCount: number;
  futureCount: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="col-span-1 shadow-md border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">وضعیت برنامه‌های نگهداری</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400 animate-pulse">
            <p>در حال بارگیری...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
      <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">وضعیت برنامه‌های نگهداری</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Alert variant={delayedCount > 0 ? "destructive" : "default"} 
          className={`flex items-center ${delayedCount > 0 
            ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-950/20 dark:border-red-800/60 dark:text-red-300' 
            : 'bg-green-100 border-green-300 text-green-800 dark:bg-green-950/20 dark:border-green-800/60 dark:text-green-300'}`}>
          <AlertCircle className={`h-5 w-5 mr-2 ${delayedCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
          <div>
            <AlertTitle className={`font-semibold ${delayedCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>تعمیرات تاخیر افتاده</AlertTitle>
            <AlertDescription className="flex items-center mt-1">
              <span className={`text-2xl font-bold ${delayedCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>{delayedCount}</span>
              <span className="mr-2">مورد</span>
            </AlertDescription>
          </div>
        </Alert>

        <Alert variant="default" className="flex items-center bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/60 dark:text-amber-300">
          <Clock className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
          <div>
            <AlertTitle className="font-semibold text-amber-700 dark:text-amber-400">تعمیرات در هفته آینده</AlertTitle>
            <AlertDescription className="flex items-center mt-1">
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{dueWithinWeekCount}</span>
              <span className="mr-2">مورد</span>
            </AlertDescription>
          </div>
        </Alert>

        <Alert className="flex items-center bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800/60 dark:text-blue-300">
          <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          <div>
            <AlertTitle className="font-semibold text-blue-700 dark:text-blue-400">تعمیرات آینده</AlertTitle>
            <AlertDescription className="flex items-center mt-1">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{futureCount}</span>
              <span className="mr-2">مورد</span>
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
} 