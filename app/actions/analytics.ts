'use server';

import { db } from "@/lib/db";
import { startOfMonth, subMonths, format } from "date-fns-jalali";
import { OrderStatus } from "@prisma/client";
import { startOfDay, endOfDay, eachDayOfInterval } from "date-fns";

interface SupplierPriceData {
  part: string;
  [supplier: string]: string | number;
}

interface SupplierTotalPriceData {
  supplier: string;
  totalPrice: number;
}

/**
 * Calculates the stock compliance KPI 
 * Formula: (Number of parts above minimum stock / Total number of parts) × 100%
 */
export async function getStockComplianceKPI() {
  try {
    // Get all parts from the database
    const parts = await db.part.findMany({
      select: {
        id: true,
        currentStock: true,
        minimumStock: true,
      },
    });

    // Calculate KPI metrics
    const totalParts = parts.length;
    const partsAboveMinimum = parts.filter(
      (part) => part.currentStock >= part.minimumStock
    ).length;

    // Calculate compliance percentage (avoid division by zero)
    const compliancePercentage = totalParts > 0 
      ? Math.round((partsAboveMinimum / totalParts) * 100) 
      : 0;

    return {
      compliancePercentage,
      partsAboveMinimum,
      totalParts,
    };
  } catch (error) {
    console.error("Error calculating stock compliance KPI:", error);
    // Return default values in case of error
    return {
      compliancePercentage: 0,
      partsAboveMinimum: 0,
      totalParts: 0,
    };
  }
}

export async function getInventoryTurnoverData() {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      start: startOfMonth(date),
      end: i === 0 ? new Date() : startOfMonth(subMonths(date, -1)),
      month: format(date, 'MMMM'),
    };
  }).reverse();

  const data = await Promise.all(
    months.map(async ({ start, end, month }) => {
      // Get total parts consumed in maintenance for the month
      const partsConsumed = await db.maintenanceEvent.count({
        where: {
          completedDate: {
            gte: start,
            lt: end,
          },
          partId: {
            not: null,
          },
        },
      });

      // Get average inventory level for the month
      const parts = await db.part.findMany({
        select: {
          currentStock: true,
        },
      });

      const averageInventory = parts.reduce((sum, part) => sum + part.currentStock, 0) / parts.length;

      const turnoverRate = averageInventory > 0 ? partsConsumed / averageInventory : 0;

      return {
        month,
        turnoverRate: Number(turnoverRate.toFixed(2)),
      };
    })
  );

  // Calculate trend
  const lastMonth = data[data.length - 1].turnoverRate;
  const previousMonth = data[data.length - 2].turnoverRate;
  const trend = previousMonth !== 0 
    ? Number((((lastMonth - previousMonth) / previousMonth) * 100).toFixed(1))
    : 0;

  return {
    data,
    trend,
  };
}

export async function getStockOutData() {
  try {
    const parts = await db.part.groupBy({
      by: ['name'],
      where: {
        currentStock: 0
      },
      _count: {
        currentStock: true
      }
    });

    return parts.map(part => ({
      name: part.name,
      stockOuts: part._count.currentStock
    }));
  } catch (error) {
    console.error('Error fetching stock-out data:', error);
    throw new Error('Failed to fetch stock-out data');
  }
}

/**
 * Gets the most used parts based on their usage in equipment and maintenance events
 */
export async function getMostUsedParts() {
  try {
    const parts = await db.part.findMany({
      select: {
        name: true,
        _count: {
          select: {
            equipmentParts: true,
            maintenanceEvents: true,
          }
        }
      },
      orderBy: [
        {
          equipmentParts: {
            _count: 'desc'
          }
        },
        {
          maintenanceEvents: {
            _count: 'desc'
          }
        }
      ],
      take: 10
    });

    return parts.map(part => ({
      name: part.name,
      count: part._count.equipmentParts + part._count.maintenanceEvents
    }));
  } catch (error) {
    console.error('Error fetching most used parts:', error);
    return [];
  }
}

/**
 * Gets price comparison data across suppliers for common parts
 */
export async function getSupplierPriceData() {
  try {
    // Get all parts that have multiple suppliers
    const partsWithMultipleSuppliers = await db.part.findMany({
      where: {
        supplierParts: {
          some: {
            supplier: {
              supplierParts: {
                some: {}
              }
            }
          }
        }
      },
      select: {
        name: true,
        supplierParts: {
          select: {
            price: true,
            supplier: {
              select: {
                name: true
              }
            }
          },
          where: {
            supplier: {
              supplierParts: {
                some: {}
              }
            }
          }
        }
      },
      take: 6
    });

    // Transform the data for the radar chart
    const suppliers = new Set<string>();
    const transformedData = partsWithMultipleSuppliers.map(part => {
      const priceData = {
        part: part.name
      } as SupplierPriceData;
      
      part.supplierParts.forEach(sp => {
        suppliers.add(sp.supplier.name);
        priceData[sp.supplier.name] = sp.price;
      });
      
      return priceData;
    });

    return {
      data: transformedData,
      suppliers: Array.from(suppliers)
    };
  } catch (error) {
    console.error('Error fetching supplier price data:', error);
    return {
      data: [],
      suppliers: []
    };
  }
}

export async function getOutOfStockParts() {
  try {
    const outOfStockParts = await db.part.findMany({
      where: {
        currentStock: {
          lte: db.part.fields.minimumStock
        }
      },
      orderBy: {
        currentStock: 'asc'
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        minimumStock: true
      }
    });
    
    return outOfStockParts;
  } catch (error) {
    console.error("Error fetching out-of-stock parts:", error);
    throw error;
  }
}

/**
 * Get the total price for all parts from each supplier
 */
export async function getSupplierTotalPrices(): Promise<SupplierTotalPriceData[]> {
  try {
    // Get all suppliers with their parts and prices
    const supplierParts = await db.supplierPart.findMany({
      include: {
        supplier: true,
      },
    });

    // Group and sum by supplier
    const supplierPriceMap = supplierParts.reduce((acc: Record<string, { supplier: string; totalPrice: number }>, item) => {
      const supplierId = item.supplierId;
      const supplierName = item.supplier.name;
      
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplier: supplierName,
          totalPrice: 0,
        };
      }
      
      acc[supplierId].totalPrice += item.price;
      return acc;
    }, {});

    // Convert to array format
    const result = Object.values(supplierPriceMap);
    
    return result;
  } catch (error) {
    console.error("Error getting supplier total prices:", error);
    throw new Error("Failed to fetch supplier total price data");
  }
}

// Fetch supplier total price data for the radar chart
export async function getSuppliersTotalPrices() {
  try {
    // Get all suppliers with their parts
    const suppliers = await db.supplier.findMany({
      include: {
        supplierParts: true,
      },
    })

    // Calculate the total price for each supplier
    const suppliersWithTotalPrice = suppliers.map(supplier => {
      const totalPrice = supplier.supplierParts.reduce(
        (sum, part) => sum + part.price,
        0
      )
      
      // Count how many preferred parts this supplier has
      const preferredPartsCount = supplier.supplierParts.filter(
        part => part.isPreferred
      ).length
      
      return {
        id: supplier.id,
        name: supplier.name,
        totalPrice,
        partsCount: supplier.supplierParts.length,
        preferredPartsCount,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
      }
    })
    
    // Sort by total price (highest first)
    return suppliersWithTotalPrice.sort((a, b) => b.totalPrice - a.totalPrice)
  } catch (error) {
    console.error("Error fetching supplier price data:", error)
    throw new Error("Failed to fetch supplier price data")
  }
}

/**
 * Fetches order cancellation data from the database
 * Returns the percentage of cancelled orders and related counts
 */
export async function fetchOrderCancellationData() {
  try {
    // Count total orders
    const totalOrders = await db.order.count();
    
    // Count cancelled orders
    const cancelledOrders = await db.order.count({
      where: {
        status: OrderStatus.CANCELLED
      }
    });
    
    // Calculate percentage (handle case where there are no orders)
    const percentage = totalOrders > 0 
      ? Math.round((cancelledOrders / totalOrders) * 100) 
      : 0;
    
    return {
      percentage,
      cancelledOrders,
      totalOrders
    };
  } catch (error) {
    console.error("Error fetching order cancellation data:", error);
    throw new Error("Failed to fetch order cancellation data");
  }
}

/**
 * Fetches maintenance events data grouped by date and type (preventive vs reactive)
 * - Preventive: SCHEDULED_MAINTENANCE
 * - Reactive: All other maintenance types (BREAKDOWN, REPAIR, REPLACEMENT, INSPECTION)
 */
export async function getMaintenanceEventsData(months: number = 3) {
  try {
    // Get date range (from X months ago until now)
    const endDate = new Date()
    const startDate = subMonths(endDate, months)
    
    // Get all maintenance events in the date range that have been completed
    const events = await db.maintenanceEvent.findMany({
      where: {
        completedDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        eventType: true,
        completedDate: true
      }
    })
    
    // Create a map of dates to store counts
    const dateMap = new Map()
    
    // Process each event and count by type
    events.forEach(event => {
      if (!event.completedDate) return
      
      // Format date as YYYY-MM-DD
      const dateStr = format(event.completedDate, 'yyyy-MM-dd')
      
      // Initialize date in map if it doesn't exist
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { preventive: 0, reactive: 0 })
      }
      
      // Update counts based on event type
      const counts = dateMap.get(dateStr)
      if (event.eventType === 'SCHEDULED_MAINTENANCE') {
        counts.preventive += 1
      } else {
        counts.reactive += 1
      }
    })
    
    // Convert map to array of objects sorted by date
    const result = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    // If we have sparse data, fill in missing dates with zeros
    if (result.length > 0 && result.length < 30) {
      const filledData = fillMissingDates(startDate, endDate, result)
      return filledData
    }
    
    return result
  } catch (error) {
    console.error('Error fetching maintenance events data:', error)
    return []
  }
}

/**
 * Helper function to fill in missing dates with zero values
 */
function fillMissingDates(startDate: Date, endDate: Date, data: any[]) {
  // Create a map of existing dates for quick lookup
  const existingDates = new Map(data.map(item => [item.date, item]))
  
  // Generate all dates in the interval
  const allDates = eachDayOfInterval({ start: startDate, end: endDate })
  
  // Map each date to an entry in our result
  return allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return existingDates.get(dateStr) || { date: dateStr, preventive: 0, reactive: 0 }
  })
}

/**
 * Fetches order data and calculates total amounts by month
 * Returns the total delivered and pending order amounts for visualization
 */
export async function getOrdersData(months: number = 3) {
  try {
    // Calculate the start date based on the months parameter
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Fetch all orders in the date range
    const orders = await db.order.findMany({
      where: {
        orderDate: {
          gte: startDate
        }
      },
      include: {
        orderItems: true
      },
      orderBy: {
        orderDate: 'asc'
      }
    });
    
    // Group orders by month and calculate totals
    const monthlyData = new Map();
    
    orders.forEach(order => {
      // Get year-month as the key (e.g., "2023-01")
      const date = new Date(order.orderDate);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      // Initialize month data if it doesn't exist
      if (!monthlyData.has(yearMonth)) {
        monthlyData.set(yearMonth, {
          delivered: 0,
          pending: 0
        });
      }
      
      // Calculate the total value of this order
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      // Add to the appropriate category based on order status
      const monthData = monthlyData.get(yearMonth);
      if (order.status === 'DELIVERED') {
        monthData.delivered += orderTotal;
      } else if (['PENDING', 'APPROVED', 'SHIPPED'].includes(order.status)) {
        monthData.pending += orderTotal;
      }
      // Note: CANCELLED orders are not included in either category
    });
    
    // Convert the map to an array sorted by date
    const result = Array.from(monthlyData.entries())
      .map(([date, values]) => ({
        date,
        delivered: values.delivered,
        pending: values.pending
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return result;
  } catch (error) {
    console.error("Error fetching order data:", error);
    return [];
  }
} 