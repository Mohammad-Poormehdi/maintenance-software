import { Equipment, ProductionLine } from '@prisma/client'

export interface ProductionLineWithRelations extends ProductionLine {
  equipment: Equipment[]
} 