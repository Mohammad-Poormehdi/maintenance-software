import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ partId: string }> }
) {
  try {
    const { partId } = await params
    const supplierParts = await db.supplierPart.findMany({
      where: {
        partId: partId
      },
      include: {
        supplier: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    })

    const priceData = supplierParts.map(sp => ({
      supplier: sp.supplier.name,
      price: sp.price,
      isPreferred: sp.isPreferred
    }))

    return NextResponse.json(priceData)
  } catch (error) {
    console.error('Error fetching part prices:', error)
    return NextResponse.json({ error: 'Failed to fetch part prices' }, { status: 500 })
  }
} 