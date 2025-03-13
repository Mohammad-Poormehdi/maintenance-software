import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { format } from 'date-fns-jalali'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CalendarCheck, 
  Clock, 
  FileText, 
  MapPin, 
  Tag, 
  Factory, 
  CircleAlert, 
  ArrowRightLeft 
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EquipmentInfoPageProps {
  params: Promise<{ equipmentId: string }>
}

export default async function EquipmentInfoPage({ params }: EquipmentInfoPageProps) {
  const { equipmentId } = await params

  try {
    const equipment = await db.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        productionLine: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        maintenanceEvents: {
          include: {
            part: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        equipmentParts: {
          include: {
            part: true,
          }
        }
      },
    })
    
    if (!equipment) {
      return notFound()
    }

    // Function to calculate average maintenance time
    function calculateAverageMaintenanceTime(events: any[]): { days: number, count: number, totalDays: number } | null {
      // Filter events that have both scheduled and completed dates
      const completedEvents = events.filter(
        (event) => event.scheduledDate && event.completedDate
      );
      
      if (completedEvents.length === 0) return null;
      
      // Calculate time difference in days for each event
      const totalDays = completedEvents.reduce((sum, event) => {
        const scheduledDate = new Date(event.scheduledDate!);
        const completedDate = new Date(event.completedDate!);
        const diffTime = completedDate.getTime() - scheduledDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      // Calculate average
      return {
        days: Math.round(totalDays / completedEvents.length),
        count: completedEvents.length,
        totalDays
      };
    }

    // Function to calculate Mean Time Between Failures (MTBF)
    function calculateMTBF(events: any[]): { days: number, count: number } | null {
      // Filter only breakdown events with completed dates (representing actual failures)
      const breakdownEvents = events
        .filter(event => event.eventType === 'BREAKDOWN' && event.completedDate)
        .sort((a, b) => new Date(a.completedDate!).getTime() - new Date(b.completedDate!).getTime());
      
      if (breakdownEvents.length <= 1) return null; // Need at least 2 failures to calculate time between
      
      // Calculate time differences between consecutive failures
      let totalDays = 0;
      for (let i = 1; i < breakdownEvents.length; i++) {
        const prevFailureDate = new Date(breakdownEvents[i-1].completedDate!);
        const currentFailureDate = new Date(breakdownEvents[i].completedDate!);
        const diffTime = currentFailureDate.getTime() - prevFailureDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      }
      
      // Calculate average time between failures
      const failureIntervalCount = breakdownEvents.length - 1;
      return {
        days: Math.round(totalDays / failureIntervalCount),
        count: failureIntervalCount
      };
    }

    // Function to translate maintenance event type to Persian
    function getMaintenanceTypeLabel(type: string) {
      const labels: Record<string, string> = {
        SCHEDULED_MAINTENANCE: 'نگهداری برنامه‌ریزی شده',
        BREAKDOWN: 'خرابی',
        REPAIR: 'تعمیر',
        REPLACEMENT: 'تعویض',
        INSPECTION: 'بازرسی'
      }
      return labels[type] || type
    }

    // Function to get status label
    function getStatusLabel(status: string) {
      const labels: Record<string, string> = {
        HEALTHY: 'سالم',
        NEEDS_REPAIR: 'نیاز به تعمیر',
        NEEDS_REPLACEMENT: 'نیاز به تعویض'
      }
      return labels[status] || status
    }

    // Function to get status color
    function getStatusColor(status: string) {
      const colors: Record<string, string> = {
        HEALTHY: 'bg-green-100 text-green-800 hover:bg-green-200',
        NEEDS_REPAIR: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        NEEDS_REPLACEMENT: 'bg-red-100 text-red-800 hover:bg-red-200'
      }
      return colors[status] || ''
    }

    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">اطلاعات تجهیز</h1>
          <Link href={`/equipments/${equipmentId}`}>
            <Button variant="outline">ویرایش تجهیز</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Equipment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>مشخصات تجهیز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-2 items-center">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">نام تجهیز</div>
                    <div className="font-medium">{equipment.name}</div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Tag className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">شماره سریال</div>
                    <div className="font-medium">{equipment.serialNumber || 'ندارد'}</div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">موقعیت مکانی</div>
                    <div className="font-medium">{equipment.location || 'ندارد'}</div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <CalendarCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">تاریخ خرید</div>
                    <div className="font-medium">
                      {equipment.purchaseDate 
                        ? format(new Date(equipment.purchaseDate), 'yyyy/MM/dd') 
                        : 'ندارد'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Factory className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">خط تولید</div>
                    <div className="font-medium">
                      {equipment.productionLine?.name || 'ندارد'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <CircleAlert className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">وضعیت</div>
                    <div>
                      <Badge variant="secondary" className={getStatusColor(equipment.status)}>
                        {getStatusLabel(equipment.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Used in Equipment */}
          {equipment.equipmentParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>قطعات مورد استفاده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {equipment.equipmentParts.map((equipmentPart) => (
                    <div key={equipmentPart.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div className="font-medium">{equipmentPart.part.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          تعداد: {equipmentPart.quantity}
                        </Badge>
                        <Link href={`/parts/${equipmentPart.part.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Events */}
          {equipment.maintenanceEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>سوابق نگهداری و تعمیرات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Block */}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">آمار نگهداری و تعمیرات</h4>
                  <div className="text-sm">
                    <p>
                      میانگین زمان اتمام عملیات نگهداری: 
                      <span className="font-bold mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.days || 0}
                      </span>
                      روز
                    </p>
                    <p className="mt-1">
                      مجموع زمان تعمیرات: 
                      <span className="font-bold mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.totalDays || 0}
                      </span>
                      روز
                    </p>
                    {calculateMTBF(equipment.maintenanceEvents) && (
                      <p className="mt-1">
                        میانگین زمان بین خرابی‌ها (MTBF): 
                        <span className="font-bold mx-1">
                          {calculateMTBF(equipment.maintenanceEvents)?.days || 0}
                        </span>
                        روز
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1">
                      (بر اساس 
                      <span className="font-medium mx-1">
                        {calculateAverageMaintenanceTime(equipment.maintenanceEvents)?.count || 0}
                      </span>
                      رویداد تکمیل شده 
                      {calculateMTBF(equipment.maintenanceEvents) && (
                        <>
                          و 
                          <span className="font-medium mx-1">
                            {calculateMTBF(equipment.maintenanceEvents)?.count || 0}
                          </span>
                          دوره خرابی
                        </>
                      )}
                      )
                    </p>
                  </div>
                </div>

                {/* Maintenance Events List */}
                <div className="flex flex-col space-y-4">
                  {equipment.maintenanceEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col space-y-2 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {getMaintenanceTypeLabel(event.eventType)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {event.completedDate ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                              تکمیل شده
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100">
                              در انتظار تکمیل
                            </Badge>  
                          )}
                          <span className="text-sm text-muted-foreground">
                            {event.completedDate
                              ? format(new Date(event.completedDate), 'yyyy/MM/dd')
                              : ''}
                          </span>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.part && (
                        <div className="text-sm">
                          قطعه: <span className="font-medium">{event.part.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            تاریخ برنامه‌ریزی: {event.scheduledDate 
                              ? format(new Date(event.scheduledDate), 'yyyy/MM/dd')
                              : 'ندارد'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarCheck className="h-3.5 w-3.5" />
                          <span>
                            تاریخ ثبت: {format(new Date(event.createdAt), 'yyyy/MM/dd')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return notFound()
  }
}
