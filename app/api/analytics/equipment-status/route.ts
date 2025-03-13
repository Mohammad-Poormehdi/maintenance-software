import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Define the expected shape of the query result
interface EquipmentStatusCount {
  status: 'HEALTHY' | 'NEEDS_REPAIR' | 'NEEDS_REPLACEMENT';
  count: bigint | number;
}

export async function GET() {
  try {
    // Query the database to get equipment parts counts by equipment status
    // We need to join EquipmentPart with Equipment to get the status
    const equipmentPartsByStatus = await db.$queryRaw<EquipmentStatusCount[]>`
      SELECT e.status, COUNT(ep.id) as count
      FROM "EquipmentPart" ep
      JOIN "Equipment" e ON ep."equipmentId" = e.id
      GROUP BY e.status
    `;

    // Transform the data into the format we need
    const statusCounts = {
      HEALTHY: 0,
      NEEDS_REPAIR: 0,
      NEEDS_REPLACEMENT: 0
    };

    // Fill in the counts from the raw query
    for (const item of equipmentPartsByStatus) {
      statusCounts[item.status] = Number(item.count);
    }

    return NextResponse.json(statusCounts);
  } catch (error) {
    console.error("Error fetching equipment status data:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment status data" }, 
      { status: 500 }
    );
  }
} 