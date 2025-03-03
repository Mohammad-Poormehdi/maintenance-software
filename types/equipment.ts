import { Equipment, EquipmentPart, MaintenanceEvent, Part } from '@prisma/client'

export interface EquipmentPartWithPart extends EquipmentPart {
  part: Part
}

export interface EquipmentWithRelations extends Equipment {
  equipmentParts: EquipmentPartWithPart[]
  maintenanceEvents: MaintenanceEvent[]
} 