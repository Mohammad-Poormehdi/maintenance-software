'use server';

import { db } from "@/lib/db";
import { startOfMonth, subMonths, format } from "date-fns-jalali";

interface SupplierPriceData {
  part: string;
  [supplier: string]: string | number;
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