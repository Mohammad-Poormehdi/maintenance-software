import { Part, SupplierPart, Supplier, EquipmentPart, Equipment, MaintenanceEvent } from '@prisma/client'

export type SupplierPartWithRelations = SupplierPart & {
  supplier: Supplier
}

export type EquipmentPartWithRelations = EquipmentPart & {
  equipment: Equipment
}

export type PartWithRelations = Part & {
  supplierParts: SupplierPartWithRelations[]
  equipmentParts: EquipmentPartWithRelations[]
  maintenanceEvents: MaintenanceEvent[]
} 