import { PartForm } from '@/components/parts/part-form'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface InventoryPartPageProps {
  params: Promise<{ partId: string }>
}

export default async function InventoryPartPage({ params }: InventoryPartPageProps) {
  const { partId } = await params
  
  // If not "new", fetch the part data
  const part = await db.part.findUnique({
    where: {
      id: partId,
    },
    include: {
      supplierParts: {
        include: {
          supplier: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  // If partId is not "new" and part is not found, return 404
  if (partId !== 'new' && !part) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PartForm part={part} />
    </div>
  )
}

