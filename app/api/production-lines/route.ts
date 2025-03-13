import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const productionLines = await db.productionLine.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(productionLines)
  } catch (error) {
    console.error('Error fetching production lines:', error)
    return NextResponse.json({ error: 'Failed to fetch production lines' }, { status: 500 })
  }
} 