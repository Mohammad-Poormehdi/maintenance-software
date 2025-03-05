import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { EquipmentForm } from '@/components/equipments/equipment-form'

interface EquipmentPageProps {
  params: Promise<{ equipmentId: string }>
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { equipmentId } = await params
  
  // If we're creating a new equipment
  if (equipmentId === 'new') {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">افزودن تجهیز جدید</h1>
        <EquipmentForm />
      </div>
    )
  }
  
  // If we're editing an existing equipment
  try {
    const equipment = await db.equipment.findUnique({
      where: { id: equipmentId },
    })
    
    if (!equipment) {
      return notFound()
    }
    
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">ویرایش تجهیز</h1>
        <EquipmentForm equipment={equipment} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return notFound()
  }
}
