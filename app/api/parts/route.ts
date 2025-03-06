import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const parts = await db.part.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return NextResponse.json(parts)
  } catch (error) {
    console.error('Failed to fetch parts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parts' },
      { status: 500 }
    )
  }
} 