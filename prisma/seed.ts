import { PrismaClient, EquipmentStatus, OrderStatus, MaintenanceType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data (optional - remove if you want to add to existing data)
  await clearDatabase();
  
  // 1. Create suppliers (10)
  const supplierIds = await seedSuppliers(10);
  console.log('Suppliers created:', supplierIds.length);
  
  // 2. Create parts (50)
  const partIds = await seedParts(50);
  console.log('Parts created:', partIds.length);
  
  // 3. Create supplier-part relationships
  await seedSupplierParts(supplierIds, partIds);
  console.log('Supplier-part relationships created');
  
  // 4. Create equipment (20)
  const equipmentIds = await seedEquipment(20);
  console.log('Equipment created:', equipmentIds.length);
  
  // 5. Create equipment-part relationships
  await seedEquipmentParts(equipmentIds, partIds);
  console.log('Equipment-part relationships created');
  
  // 6. Create orders and order items
  await seedOrders(supplierIds, partIds, 30);
  console.log('Orders and order items created');
  
  // 7. Create maintenance events
  await seedMaintenanceEvents(equipmentIds, partIds, 50);
  console.log('Maintenance events created');
  
  // 8. Create maintenance schedules
  await seedMaintenanceSchedules(15);
  console.log('Maintenance schedules created');
  
  console.log('Database seeding completed!');
}

async function clearDatabase() {
  // Delete in reverse order of dependencies
  await prisma.maintenanceEvent.deleteMany({});
  await prisma.maintenanceSchedule.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.equipmentPart.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.supplierPart.deleteMany({});
  await prisma.part.deleteMany({});
  await prisma.supplier.deleteMany({});
}

async function seedSuppliers(count: number): Promise<string[]> {
  const suppliers = [];
  
  // Persian company names
  const persianCompanyNames = [
    'شرکت پارس فناوری', 'صنایع ایران', 'گروه صنعتی امید', 'فن‌آوران نوین',
    'تجهیزات صنعتی تهران', 'صنایع مکانیک البرز', 'ابزار صنعت شیراز', 'پیشگامان صنعت',
    'تجهیزات آریا', 'فناوری نوین ایرانیان'
  ];
  
  // Persian names
  const persianNames = [
    'علی محمدی', 'فاطمه حسینی', 'محمد رضایی', 'زهرا کریمی', 
    'امیر تهرانی', 'مریم اکبری', 'حسین نجفی', 'سارا قاسمی',
    'رضا صادقی', 'نازنین جعفری', 'امید رحیمی', 'لیلا میرزایی'
  ];
  
  for (let i = 0; i < count; i++) {
    suppliers.push({
      name: i < persianCompanyNames.length ? persianCompanyNames[i] : `شرکت ${faker.string.alpha(5)}`,
      contactPerson: persianNames[i % persianNames.length],
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: `خیابان ${faker.string.alpha(8)}، پلاک ${faker.number.int({min: 1, max: 200})}، ${['تهران', 'اصفهان', 'شیراز', 'تبریز', 'مشهد'][i % 5]}`
    });
  }
  
  const createdSuppliers = await Promise.all(
    suppliers.map(supplier => prisma.supplier.create({ data: supplier }))
  );
  
  return createdSuppliers.map(s => s.id);
}

async function seedParts(count: number): Promise<string[]> {
  const parts = [];
  
  const persianPartNames = [
    'پمپ هیدرولیک', 'برد مدار', 'موتور الکتریکی', 'فیلتر', 'کمپرسور',
    'شیر', 'بلبرینگ', 'واشر', 'تسمه', 'پولی', 'چرخ دنده', 'سنسور', 'کلید',
    'اتصال دهنده', 'کابل', 'لوله', 'شلنگ', 'سیلندر', 'فشارسنج', 'ترموستات',
    'فن', 'مبدل حرارتی', 'رادیاتور', 'باتری', 'منبع تغذیه', 'پانل کنترل',
    'نمایشگر', 'صفحه کلید', 'انتقال', 'روان کننده', 'فیلتر هوا', 'فیلتر روغن',
    'فیلتر سوخت', 'اورینگ', 'آب بندی', 'پمپ', 'محرک', 'شفت', 'زنجیر'
  ];
  
  for (let i = 0; i < count; i++) {
    const name = i < persianPartNames.length 
      ? persianPartNames[i] 
      : `قطعه ${faker.string.alpha(4)}`;
    
    parts.push({
      name,
      description: `توضیحات برای ${name} - این قطعه برای استفاده در تجهیزات صنعتی مناسب است`,
      currentStock: faker.number.int({ min: 0, max: 200 }),
      minimumStock: faker.number.int({ min: 5, max: 50 })
    });
  }
  
  const createdParts = await Promise.all(
    parts.map(part => prisma.part.create({ data: part }))
  );
  
  return createdParts.map(p => p.id);
}

async function seedSupplierParts(supplierIds: string[], partIds: string[]) {
  const supplierParts = [];
  
  // For each part, assign 1-3 random suppliers
  for (const partId of partIds) {
    const numSuppliers = faker.number.int({ min: 1, max: 3 });
    const shuffledSuppliers = [...supplierIds].sort(() => 0.5 - Math.random());
    const selectedSuppliers = shuffledSuppliers.slice(0, numSuppliers);
    
    for (const supplierId of selectedSuppliers) {
      supplierParts.push({
        supplierId,
        partId,
        price: parseFloat(faker.commerce.price({ min: 10, max: 5000 })),
        leadTime: faker.number.int({ min: 1, max: 45 }),
        isPreferred: selectedSuppliers.indexOf(supplierId) === 0 // First supplier is preferred
      });
    }
  }
  
  await Promise.all(
    supplierParts.map(sp => prisma.supplierPart.create({ data: sp }))
  );
}

async function seedEquipment(count: number): Promise<string[]> {
  const equipment = [];
  
  const persianEquipmentNames = [
    'دستگاه CNC', 'نوار نقاله صنعتی', 'دستگاه تزریق پلاستیک', 'ربات مونتاژ',
    'سیستم بسته بندی', 'کوره صنعتی', 'پرس هیدرولیک', 'برج خنک کننده', 
    'کمپرسور هوا', 'دستگاه جوش', 'دستگاه چاپ', 'کوره', 'میکسر', 
    'سانتریفیوژ', 'خشک کن', 'دیگ بخار', 'ژنراتور', 'لیفتراک', 'جرثقیل برقی',
    'سیستم تهویه', 'اسکنر کنترل کیفیت', 'پرینتر سه بعدی', 'برش لیزری'
  ];
  
  const statuses = Object.values(EquipmentStatus);
  
  for (let i = 0; i < count; i++) {
    const name = i < persianEquipmentNames.length 
      ? persianEquipmentNames[i] 
      : `دستگاه ${faker.string.alpha(4).toUpperCase()}`;
    
    equipment.push({
      name,
      serialNumber: faker.string.alphanumeric(10).toUpperCase(),
      location: `ساختمان ${faker.string.alpha(1).toUpperCase()}، طبقه ${faker.number.int({ min: 1, max: 5 })}، اتاق ${faker.number.int({ min: 101, max: 599 })}`,
      purchaseDate: faker.date.past({ years: 10 }),
      status: statuses[faker.number.int({ min: 0, max: statuses.length - 1 })]
    });
  }
  
  const createdEquipment = await Promise.all(
    equipment.map(eq => prisma.equipment.create({ data: eq }))
  );
  
  return createdEquipment.map(e => e.id);
}

async function seedEquipmentParts(equipmentIds: string[], partIds: string[]) {
  const equipmentParts = [];
  
  // For each equipment, assign 3-10 random parts
  for (const equipmentId of equipmentIds) {
    const numParts = faker.number.int({ min: 3, max: 10 });
    const shuffledParts = [...partIds].sort(() => 0.5 - Math.random());
    const selectedParts = shuffledParts.slice(0, numParts);
    
    for (const partId of selectedParts) {
      equipmentParts.push({
        equipmentId,
        partId,
        quantity: faker.number.int({ min: 1, max: 5 })
      });
    }
  }
  
  await Promise.all(
    equipmentParts.map(ep => prisma.equipmentPart.create({ data: ep }))
  );
}

async function seedOrders(supplierIds: string[], partIds: string[], count: number) {
  const orderStatuses = Object.values(OrderStatus);
  
  for (let i = 0; i < count; i++) {
    // Pick a random supplier
    const supplierId = supplierIds[faker.number.int({ min: 0, max: supplierIds.length - 1 })];
    
    // Get parts supplied by this supplier
    const supplierParts = await prisma.supplierPart.findMany({
      where: { supplierId },
      select: { partId: true, price: true }
    });
    
    if (supplierParts.length === 0) continue;
    
    // Create the order
    const orderDate = faker.date.recent({ days: 60 });
    const status = orderStatuses[faker.number.int({ min: 0, max: orderStatuses.length - 1 })];
    
    // Calculate delivery date based on status
    let deliveryDate = null;
    if (['SHIPPED', 'DELIVERED'].includes(status)) {
      deliveryDate = faker.date.soon({ days: 14, refDate: orderDate });
    } else if (status === 'APPROVED') {
      deliveryDate = faker.date.future({ years: 0.1, refDate: orderDate });
    }
    
    const order = await prisma.order.create({
      data: {
        orderNumber: `PO-${faker.string.numeric(6)}`,
        supplierId,
        orderDate,
        deliveryDate,
        status
      }
    });
    
    // Create 1-5 order items for this order
    const numItems = faker.number.int({ min: 1, max: 5 });
    const shuffledParts = [...supplierParts].sort(() => 0.5 - Math.random());
    const selectedParts = shuffledParts.slice(0, numItems);
    
    for (const part of selectedParts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          partId: part.partId,
          quantity: faker.number.int({ min: 1, max: 50 }),
          unitPrice: parseFloat((part.price * (1 - faker.number.float({ min: -0.1, max: 0.1 }))).toFixed(2)) // Slight variation from supplier price
        }
      });
    }
  }
}

async function seedMaintenanceEvents(equipmentIds: string[], partIds: string[], count: number) {
  const maintenanceTypes = Object.values(MaintenanceType);
  const technicians = [
    'علی محمدی', 'فاطمه حسینی', 'محمد رضایی', 'زهرا کریمی', 
    'امیر تهرانی', 'مریم اکبری', 'حسین نجفی', 'سارا قاسمی'
  ];
  
  for (let i = 0; i < count; i++) {
    // Pick a random equipment
    const equipmentId = equipmentIds[faker.number.int({ min: 0, max: equipmentIds.length - 1 })];
    
    // For some events, associate with a part
    const usePart = faker.datatype.boolean();
    let partId = null;
    
    if (usePart) {
      // Try to find a part associated with this equipment
      const equipmentParts = await prisma.equipmentPart.findMany({
        where: { equipmentId },
        select: { partId: true }
      });
      
      if (equipmentParts.length > 0) {
        partId = equipmentParts[faker.number.int({ min: 0, max: equipmentParts.length - 1 })].partId;
      } else {
        // Fallback to a random part
        partId = partIds[faker.number.int({ min: 0, max: partIds.length - 1 })];
      }
    }
    
    const eventType = maintenanceTypes[faker.number.int({ min: 0, max: maintenanceTypes.length - 1 })];
    const scheduledDate = faker.date.recent({ days: 60 });
    
    // Completed date depends on type
    let completedDate = null;
    if (faker.datatype.boolean(0.8)) { // 80% chance it's completed
      completedDate = faker.date.between({ from: scheduledDate, to: new Date() });
    }
    
    await prisma.maintenanceEvent.create({
      data: {
        equipmentId,
        partId,
        eventType,
        description: getMaintenanceDescription(eventType),
        scheduledDate,
        completedDate,
        createdBy: technicians[faker.number.int({ min: 0, max: technicians.length - 1 })]
      }
    });
  }
}

function getMaintenanceDescription(type: MaintenanceType): string {
  switch (type) {
    case 'SCHEDULED_MAINTENANCE':
      return faker.helpers.arrayElement([
        'بازرسی منظم سه ماهه',
        'بازرسی سالانه سیستم',
        'روغنکاری و تنظیم روتین',
        'ارزیابی عملکرد برنامه ریزی شده',
        'سرویس نگهداری پیشگیرانه'
      ]);
    case 'BREAKDOWN':
      return faker.helpers.arrayElement([
        'خرابی غیرمنتظره در حین عملیات',
        'خاموشی اضطراری به دلیل نقص',
        'خرابی قطعه حیاتی',
        'اختلال عملیاتی به دلیل خطای سیستم',
        'توقف برنامه ریزی نشده نیازمند توجه فوری'
      ]);
    case 'REPAIR':
      return faker.helpers.arrayElement([
        'رفع اتصال کوتاه برقی',
        'تعمیر نشت مایع هیدرولیک',
        'رفع نقص نرم افزاری',
        'اصلاح مشکلات تراز',
        'حل مشکلات گرمای بیش از حد'
      ]);
    case 'REPLACEMENT':
      return faker.helpers.arrayElement([
        'تعویض مجموعه بلبرینگ فرسوده',
        'نصب پانل کنترل جدید',
        'تعویض تسمه آسیب دیده',
        'تعویض آرایه سنسور خراب',
        'ارتقاء قطعه منسوخ'
      ]);
    case 'INSPECTION':
      return faker.helpers.arrayElement([
        'تأیید انطباق ایمنی',
        'ارزیابی تضمین کیفیت',
        'تست عملکرد معیار',
        'بازرسی استانداردهای نظارتی',
        'ارزیابی ایمنی عملیاتی'
      ]);
    default:
      return 'فعالیت نگهداری عمومی';
  }
}

async function seedMaintenanceSchedules(count: number) {
  const persianMaintenanceNames = [
    'بازرسی سه ماهه', 'اورهال سالانه', 'روغنکاری ماهانه',
    'بررسی ایمنی هفتگی', 'تعویض فیلتر', 'سرویس کالیبراسیون',
    'به روزرسانی نرم افزار', 'تست ایمنی الکتریکی', 'تعویض مایع خنک کننده',
    'تست فشار', 'بررسی تراز', 'بازرسی تسمه',
    'سرویس موتور', 'بررسی سیستم کنترل', 'کالیبراسیون سنسور'
  ];
  
  for (let i = 0; i < count && i < persianMaintenanceNames.length; i++) {
    const frequency = faker.helpers.arrayElement([7, 14, 30, 90, 180, 365]); // Days
    // Fix the linter error: use years instead of days
    const lastExecuted = faker.date.past({ years: (frequency * 1.5) / 365 });
    const nextDue = new Date(lastExecuted);
    nextDue.setDate(nextDue.getDate() + frequency);
    
    await prisma.maintenanceSchedule.create({
      data: {
        name: persianMaintenanceNames[i],
        description: `برنامه منظم ${persianMaintenanceNames[i]} برای اطمینان از عملکرد بهینه و ایمنی تجهیزات.`,
        frequency,
        lastExecuted,
        nextDue
      }
    });
  }
}

function getMaintenanceScheduleDescription(name: string): string {
  // Persian description based on the name
  return `برنامه نگهداری منظم برای ${name} جهت اطمینان از عملکرد مطلوب و ایمنی تجهیزات.`;
}

main()
  .catch(e => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 