import { NextResponse } from 'next/server';
import { PrismaClient, EquipmentStatus, OrderStatus, MaintenanceType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Handler for POST requests to /api/seed
export async function POST() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!' 
    });
  } catch (error) {
    console.error('Error during database seeding:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database', details: error?.toString() },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Make GET method also trigger the seeding for easier testing in browser
export async function GET() {
  return POST();
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
  
  // Transliterated company names for email generation
  const transliteratedNames = [
    'pars-tech', 'iran-industries', 'omid-industrial', 'novin-tech',
    'tehran-equipment', 'alborz-mechanical', 'shiraz-tools', 'industry-pioneers',
    'aria-equipment', 'iranian-novin-tech'
  ];
  
  // Email domains
  const emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'company.ir', 'mail.ir', 'outlook.com'];
  
  // Persian names
  const persianNames = [
    'علی محمدی', 'فاطمه حسینی', 'محمد رضایی', 'زهرا کریمی', 
    'امیر تهرانی', 'مریم اکبری', 'حسین نجفی', 'سارا قاسمی',
    'رضا صادقی', 'نازنین جعفری', 'امید رحیمی', 'لیلا میرزایی'
  ];
  
  for (let i = 0; i < count; i++) {
    // Generate company name
    const companyName = i < persianCompanyNames.length ? persianCompanyNames[i] : `شرکت ${faker.string.alpha(5)}`;
    
    // Generate email based on company name
    const transliteratedName = i < transliteratedNames.length 
      ? transliteratedNames[i] 
      : `company${faker.string.alpha(5).toLowerCase()}`;
    
    const emailDomain = emailDomains[faker.number.int({min: 0, max: emailDomains.length - 1})];
    const email = `${transliteratedName}@${emailDomain}`;
    
    // Generate phone number that is 11 digits starting with 09
    const remainingDigits = faker.string.numeric(9);
    const phone = `09${remainingDigits}`;
    
    suppliers.push({
      name: companyName,
      contactPerson: persianNames[i % persianNames.length],
      email,
      phone,
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
  
  // For each part, assign 5-8 suppliers to ensure good price competition
  for (const partId of partIds) {
    const numSuppliers = faker.number.int({ min: 5, max: 8 }); // Increased minimum to 5
    const shuffledSuppliers = [...supplierIds].sort(() => 0.5 - Math.random());
    const selectedSuppliers = shuffledSuppliers.slice(0, numSuppliers);
    
    // Generate a base price for this part
    const basePrice = faker.number.int({ min: 500000, max: 50000000 });
    
    // Track the lowest price variation to set preferred supplier
    let lowestPriceVariation = Infinity;
    const supplierVariations: { supplierId: string; variation: number }[] = [];
    
    // First pass: calculate price variations
    for (const supplierId of selectedSuppliers) {
      // Each supplier's price varies by ±30% from the base price
      const priceVariation = 1 + faker.number.float({ min: -0.3, max: 0.3 });
      lowestPriceVariation = Math.min(lowestPriceVariation, priceVariation);
      supplierVariations.push({ supplierId, variation: priceVariation });
    }
    
    // Second pass: create supplier parts with prices
    for (const { supplierId, variation } of supplierVariations) {
      const price = Math.round(basePrice * variation);
      
      supplierParts.push({
        supplierId,
        partId,
        price,
        leadTime: faker.number.int({ min: 1, max: 45 }),
        // Make the supplier with the lowest price the preferred one
        isPreferred: variation === lowestPriceVariation
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
  
  // Calculate date one year ago for reference
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  for (let i = 0; i < count; i++) {
    const name = i < persianEquipmentNames.length 
      ? persianEquipmentNames[i] 
      : `دستگاه ${faker.string.alpha(4).toUpperCase()}`;
    
    equipment.push({
      name,
      serialNumber: faker.string.alphanumeric(10).toUpperCase(),
      location: `ساختمان ${faker.string.alpha(1).toUpperCase()}، طبقه ${faker.number.int({ min: 1, max: 5 })}، اتاق ${faker.number.int({ min: 101, max: 599 })}`,
      // Purchase date within the last year instead of 10 years
      purchaseDate: faker.date.between({ from: oneYearAgo, to: new Date() }),
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
  
  // Calculate date one year ago for reference
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // Track orders by month (0-11)
  const monthlyCompletedOrders = new Map<number, number>();
  
  // Initialize the map with 0 completed orders for each month
  for (let month = 0; month < 12; month++) {
    monthlyCompletedOrders.set(month, 0);
  }
  
  // Create random orders first
  for (let i = 0; i < count; i++) {
    // Pick a random supplier
    const supplierId = supplierIds[faker.number.int({ min: 0, max: supplierIds.length - 1 })];
    
    // Get parts supplied by this supplier
    const supplierParts = await prisma.supplierPart.findMany({
      where: { supplierId },
      select: { partId: true, price: true }
    });
    
    if (supplierParts.length === 0) continue;
    
    // Create the order with date in the last year
    const orderDate = faker.date.between({ from: oneYearAgo, to: new Date() });
    const status = orderStatuses[faker.number.int({ min: 0, max: orderStatuses.length - 1 })];
    
    // Calculate delivery date based on status
    let deliveryDate = null;
    if (['SHIPPED', 'DELIVERED'].includes(status)) {
      // Ensure delivery date is after order date but not in the future
      const maxDeliveryDate = new Date(Math.min(Date.now(), orderDate.getTime() + 14 * 24 * 60 * 60 * 1000));
      deliveryDate = faker.date.between({ from: orderDate, to: maxDeliveryDate });
      
      // Track completed orders by month
      const month = deliveryDate.getMonth();
      monthlyCompletedOrders.set(month, (monthlyCompletedOrders.get(month) || 0) + 1);
    } else if (status === 'APPROVED') {
      // For approved orders, delivery date can be in the future
      const futureLimit = new Date();
      futureLimit.setDate(futureLimit.getDate() + 30); // Max 30 days in the future
      deliveryDate = faker.date.between({ from: orderDate, to: futureLimit });
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
          unitPrice: Math.round(part.price * (1 + faker.number.float({ min: -0.1, max: 0.1 })))
        }
      });
    }
  }
  
  // Now ensure each month has at least one completed order
  for (let month = 0; month < 12; month++) {
    if ((monthlyCompletedOrders.get(month) || 0) === 0) {
      // This month needs a completed order
      await createCompletedOrderForMonth(supplierIds, partIds, month, oneYearAgo);
    }
  }
  
  console.log('Ensured completed orders for each month of the past year');
}

// Helper function to create a completed order for a specific month
async function createCompletedOrderForMonth(
  supplierIds: string[],
  partIds: string[],
  month: number,
  oneYearAgo: Date
) {
  // Pick a random supplier
  const supplierId = supplierIds[faker.number.int({ min: 0, max: supplierIds.length - 1 })];
  
  // Get parts supplied by this supplier
  const supplierParts = await prisma.supplierPart.findMany({
    where: { supplierId },
    select: { partId: true, price: true }
  });
  
  if (supplierParts.length === 0) return;
  
  // Calculate the month start and end dates
  const monthStart = new Date(oneYearAgo);
  monthStart.setMonth(oneYearAgo.getMonth() + month);
  monthStart.setDate(1);
  
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthStart.getMonth() + 1);
  monthEnd.setDate(0);
  
  // Ensure monthEnd doesn't exceed current date
  const adjustedMonthEnd = new Date(Math.min(monthEnd.getTime(), Date.now()));
  
  // Generate order date within this month
  const orderDate = faker.date.between({ from: monthStart, to: adjustedMonthEnd });
  
  // Ensure delivery date is also within this month but after order date
  const deliveryDate = faker.date.between({ 
    from: orderDate, 
    to: adjustedMonthEnd 
  });
  
  // Create a completed order
  const status = faker.helpers.arrayElement(['SHIPPED', 'DELIVERED']);
  
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
  const selectedParts = shuffledParts.slice(0, Math.min(numItems, shuffledParts.length));
  
  for (const part of selectedParts) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        partId: part.partId,
        quantity: faker.number.int({ min: 1, max: 50 }),
        unitPrice: Math.round(part.price * (1 + faker.number.float({ min: -0.1, max: 0.1 })))
      }
    });
  }
}

async function seedMaintenanceEvents(equipmentIds: string[], partIds: string[], count: number) {
  const maintenanceTypes = Object.values(MaintenanceType);
  const technicians = [
    'علی محمدی', 'فاطمه حسینی', 'محمد رضایی', 'زهرا کریمی', 
    'امیر تهرانی', 'مریم اکبری', 'حسین نجفی', 'سارا قاسمی'
  ];
  
  // Calculate date one year ago for reference
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // Create a map to track events by week number
  const weeklyEvents = new Map<number, number>();
  
  // Initialize the map with 0 events for each week (0-51)
  for (let week = 0; week < 52; week++) {
    weeklyEvents.set(week, 0);
  }
  
  // First, create some random maintenance events for each equipment
  for (const equipmentId of equipmentIds) {
    // Create 1-3 maintenance events per equipment
    const numEvents = faker.number.int({ min: 1, max: 3 });
    
    for (let j = 0; j < numEvents; j++) {
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
      const scheduledDate = faker.date.between({ from: oneYearAgo, to: new Date() });
      
      // Calculate which week this falls into (0-51)
      const weekNumber = Math.floor((scheduledDate.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Increment the count for this week if it's a valid week number
      if (weekNumber >= 0 && weekNumber < 52) {
        weeklyEvents.set(weekNumber, (weeklyEvents.get(weekNumber) || 0) + 1);
      }
      
      // Completed date depends on type and must be after scheduled date
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
  
  // Now, ensure each week has at least 2 events
  for (let week = 0; week < 52; week++) {
    const eventsNeeded = Math.max(0, 2 - (weeklyEvents.get(week) || 0));
    
    for (let i = 0; i < eventsNeeded; i++) {
      // Generate a date in this specific week
      const weekStart = new Date(oneYearAgo);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Ensure weekEnd doesn't exceed current date
      const adjustedWeekEnd = new Date(Math.min(weekEnd.getTime(), Date.now()));
      
      // Generate a date within this week
      const scheduledDate = faker.date.between({ from: weekStart, to: adjustedWeekEnd });
      
      // Pick a random equipment and event type
      const equipmentId = equipmentIds[faker.number.int({ min: 0, max: equipmentIds.length - 1 })];
      const eventType = maintenanceTypes[faker.number.int({ min: 0, max: maintenanceTypes.length - 1 })];
      
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
      
      // Completed date depends on type and must be after scheduled date
      let completedDate = null;
      if (faker.datatype.boolean(0.8)) { // 80% chance it's completed
        // If the scheduled date is in the past
        if (scheduledDate.getTime() < Date.now()) {
          completedDate = faker.date.between({ from: scheduledDate, to: new Date() });
        }
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
  
  console.log('Created maintenance events with minimum 2 events per week for the past year');
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
  // Define maintenance titles that match specific frequencies
  const frequencyTitleMap: Record<number, string[]> = {
    7: ['بازرسی هفتگی', 'سرویس هفتگی', 'نگهداری هفتگی', 'بررسی ایمنی هفتگی'],
    14: ['بازرسی دو هفتگی', 'سرویس دو هفتگی', 'نگهداری دو هفته‌ای'],
    30: ['بازرسی ماهانه', 'سرویس ماهانه', 'روغنکاری ماهانه', 'نگهداری ماهیانه'],
    90: ['بازرسی سه ماهه', 'سرویس فصلی', 'نگهداری فصلی', 'چکاپ سه ماهه'],
    180: ['بازرسی شش ماهه', 'سرویس نیم‌سالانه', 'نگهداری شش ماهه'],
    365: ['اورهال سالانه', 'بازرسی سالانه', 'سرویس سالیانه', 'نگهداری سالانه']
  };
  
  // All frequencies that will be used
  const frequencies = [7, 14, 30, 90, 180, 365]; // Days
  
  // Additional generic maintenance activities that can be appended
  const maintenanceActivities = [
    'تعویض فیلتر', 'کالیبراسیون', 'بررسی تراز', 'تست فشار',
    'به روزرسانی نرم افزار', 'تست ایمنی الکتریکی', 'بررسی سیستم کنترل'
  ];
  
  // Calculate date one year ago for reference
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const schedules = [];
  
  // Create schedules for each frequency to ensure we have all types
  for (const frequency of frequencies) {
    // Get potential titles for this frequency
    const titles = frequencyTitleMap[frequency];
    
    // Number of schedules to create for this frequency (at least 1, up to 3)
    const scheduleCount = Math.min(3, Math.ceil(count / frequencies.length));
    
    for (let i = 0; i < scheduleCount; i++) {
      // Get a base title for this frequency
      let title = titles[i % titles.length];
      
      // For variation, sometimes add a specific maintenance activity
      if (i > 0 && maintenanceActivities.length > 0) {
        const activity = maintenanceActivities.shift();
        title = `${title} - ${activity}`;
      }
      
      // Last executed date should be within the past year
      const lastExecuted = faker.date.between({ from: oneYearAgo, to: new Date() });
      
      // Next due date based on the frequency and last executed
      const nextDue = new Date(lastExecuted);
      nextDue.setDate(nextDue.getDate() + frequency);
      
      schedules.push({
        name: title,
        description: `برنامه منظم ${title} با دوره ${frequency} روزه برای اطمینان از عملکرد بهینه و ایمنی تجهیزات.`,
        frequency,
        lastExecuted,
        nextDue
      });
    }
  }
  
  // Create all schedules in the database
  await Promise.all(
    schedules.slice(0, count).map(schedule => prisma.maintenanceSchedule.create({ data: schedule }))
  );
}
