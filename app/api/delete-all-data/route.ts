import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
      // First delete junction/child tables
      prisma.maintenanceEvent.deleteMany({}),
      prisma.orderItem.deleteMany({}),
      prisma.order.deleteMany({}),
      prisma.supplierPart.deleteMany({}),
      prisma.equipmentPart.deleteMany({}),
      
      // Then delete main tables
      prisma.maintenanceSchedule.deleteMany({}),
      prisma.equipment.deleteMany({}),
      prisma.part.deleteMany({}),
      prisma.supplier.deleteMany({}),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "All data has been deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
