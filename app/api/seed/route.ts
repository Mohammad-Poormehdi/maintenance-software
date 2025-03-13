import { NextResponse } from 'next/server';
import { PrismaClient, EquipmentStatus, OrderStatus, MaintenanceType, ProductionLineStatus } from '@prisma/client';
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
    
    // 4. Create production lines (10)
    const productionLineIds = await seedProductionLines(10);
    console.log('Production lines created:', productionLineIds.length);
    
    // 5. Create equipment (20) associated with production lines
    const equipmentIds = await seedEquipment(20, productionLineIds);
    console.log('Equipment created:', equipmentIds.length);
    
    // 6. Create equipment-part relationships
    await seedEquipmentParts(equipmentIds, partIds);
    console.log('Equipment-part relationships created');
    
    // 7. Create orders and order items
    await seedOrders(supplierIds, partIds, 30);
    console.log('Orders and order items created');
    
    // 8. Create maintenance events
    await seedMaintenanceEvents(equipmentIds, partIds, 50);
    console.log('Maintenance events created');
    
    // 9. Create maintenance schedules
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
  await prisma.productionLine.deleteMany({});
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

async function seedEquipment(count: number, productionLineIds: string[]): Promise<string[]> {
  const equipment = [];
  
  // Group equipment names by production line type
  const equipmentByProductionLine = {
    'خط تولید اصلی': ['دستگاه CNC', 'پرس هیدرولیک', 'برش لیزری'],
    'خط مونتاژ': ['ربات مونتاژ', 'دستگاه جوش', 'پیچ گوشتی اتوماتیک'],
    'خط بسته‌بندی': ['سیستم بسته بندی', 'دستگاه شرینک', 'دستگاه لیبل زنی'],
    'خط تست کیفیت': ['اسکنر کنترل کیفیت', 'دستگاه تست فشار', 'دستگاه اندازه گیری دقیق'],
    'خط تولید محصول A': ['دستگاه تزریق پلاستیک', 'کوره صنعتی', 'میکسر'],
    'خط تولید محصول B': ['سانتریفیوژ', 'خشک کن', 'فیلتر پرس'],
    'خط تولید محصول C': ['دیگ بخار', 'کمپرسور هوا', 'برج خنک کننده'],
    'خط پردازش اولیه': ['نوار نقاله صنعتی', 'دستگاه شستشو', 'جداکننده اتوماتیک'],
    'خط پردازش نهایی': ['دستگاه چاپ', 'پرینتر سه بعدی', 'پولیشر'],
    'خط پرداخت': ['دستگاه رنگ آمیزی', 'کوره', 'پاشش پودری']
  };
  
  // Fallback equipment names for any production line
  const fallbackEquipmentNames = [
    'ژنراتور', 'لیفتراک', 'جرثقیل برقی', 'سیستم تهویه', 'تابلو برق صنعتی',
    'سیستم اطفاء حریق', 'اینورتر فرکانس', 'پمپ صنعتی', 'کنترلر PLC'
  ];
  
  const statuses = Object.values(EquipmentStatus);
  
  // Calculate date one year ago for reference
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // Get production line names for mapping
  const productionLines = await Promise.all(
    productionLineIds.map(id => prisma.productionLine.findUnique({
      where: { id },
      select: { id: true, name: true }
    }))
  );
  
  // Create equipment for each production line
  for (const productionLine of productionLines) {
    if (!productionLine) continue;
    
    // Determine how many pieces of equipment to create for this production line
    // We want to create a total of 'count' pieces across all production lines
    const equipmentPerLine = Math.max(2, Math.floor(count / productionLineIds.length));
    
    for (let i = 0; i < equipmentPerLine; i++) {
      // Get specific equipment names for this production line type if available
      const specificEquipment = equipmentByProductionLine[productionLine.name as keyof typeof equipmentByProductionLine] || [];
      
      // Choose a name from specific equipment if available, otherwise use fallback
      let name;
      if (i < specificEquipment.length) {
        name = specificEquipment[i];
      } else {
        const fallbackIndex = (productionLines.indexOf(productionLine) * 3 + i) % fallbackEquipmentNames.length;
        name = fallbackEquipmentNames[fallbackIndex];
      }
      
      equipment.push({
        name,
        serialNumber: faker.string.alphanumeric(10).toUpperCase(),
        location: `ساختمان ${faker.string.alpha(1).toUpperCase()}، طبقه ${faker.number.int({ min: 1, max: 5 })}، اتاق ${faker.number.int({ min: 101, max: 599 })}`,
        purchaseDate: faker.date.past({ years: 10 }),
        // Bias status distribution: 80% HEALTHY, 15% NEEDS_REPAIR, 5% NEEDS_REPLACEMENT
        status: (() => {
          const rand = Math.random();
          if (rand < 0.8) return EquipmentStatus.HEALTHY;
          if (rand < 0.95) return EquipmentStatus.NEEDS_REPAIR;
          return EquipmentStatus.NEEDS_REPLACEMENT;
        })(),
        productionLineId: productionLine.id
      });
    }
  }
  
  // Fill remaining equipment count if needed
  const remainingCount = count - equipment.length;
  if (remainingCount > 0) {
    for (let i = 0; i < remainingCount; i++) {
      // Pick a random production line for remaining equipment
      const randomProductionLineId = productionLineIds[faker.number.int({ min: 0, max: productionLineIds.length - 1 })];
      
      equipment.push({
        name: `دستگاه ${faker.string.alpha(4).toUpperCase()}`,
        serialNumber: faker.string.alphanumeric(10).toUpperCase(),
        location: `ساختمان ${faker.string.alpha(1).toUpperCase()}، طبقه ${faker.number.int({ min: 1, max: 5 })}، اتاق ${faker.number.int({ min: 101, max: 599 })}`,
        purchaseDate: faker.date.past({ years: 10 }),
        // Bias status distribution: 80% HEALTHY, 15% NEEDS_REPAIR, 5% NEEDS_REPLACEMENT
        status: (() => {
          const rand = Math.random();
          if (rand < 0.8) return EquipmentStatus.HEALTHY;
          if (rand < 0.95) return EquipmentStatus.NEEDS_REPAIR;
          return EquipmentStatus.NEEDS_REPLACEMENT;
        })(),
        productionLineId: randomProductionLineId
      });
    }
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
  
  // Initialize an array to track orders for each month (0-11)
  const monthlyOrders = Array(12).fill(0);
  // Initialize an array to track DELIVERED orders for each month (0-11)
  const monthlyDeliveredOrders = Array(12).fill(0);
  
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
    
    // Track which month this order belongs to
    const orderMonth = orderDate.getMonth();
    monthlyOrders[orderMonth]++;
    
    // Track delivered orders separately
    if (status === 'DELIVERED') {
      monthlyDeliveredOrders[orderMonth]++;
    }
    
    // Calculate delivery date based on status
    let deliveryDate = null;
    if (['SHIPPED', 'DELIVERED'].includes(status)) {
      // Ensure delivery date is after order date but not in the future
      const maxDeliveryDate = new Date(Math.min(Date.now(), orderDate.getTime() + 14 * 24 * 60 * 60 * 1000));
      deliveryDate = faker.date.between({ from: orderDate, to: maxDeliveryDate });
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
  
  console.log('Monthly order distribution before ensuring coverage:', monthlyOrders);
  console.log('Monthly DELIVERED order distribution before ensuring coverage:', monthlyDeliveredOrders);
  
  // Now ensure each month has at least one order
  for (let month = 0; month < 12; month++) {
    let needsOrder = monthlyOrders[month] === 0;
    let needsDeliveredOrder = monthlyDeliveredOrders[month] === 0;
    
    if (needsOrder) {
      console.log(`Creating missing order for month ${month}`);
      // This month needs an order
      await createOrderForMonth(supplierIds, partIds, month, oneYearAgo, needsDeliveredOrder ? 'DELIVERED' : undefined);
      // We created a delivered order, so mark that need as satisfied
      if (needsDeliveredOrder) {
        needsDeliveredOrder = false;
      }
    }
    
    // If we still need a delivered order for this month, create one specifically
    if (needsDeliveredOrder) {
      console.log(`Creating missing DELIVERED order for month ${month}`);
      await createOrderForMonth(supplierIds, partIds, month, oneYearAgo, 'DELIVERED');
    }
  }
  
  console.log('Ensured at least one order for each month of the past year');
  console.log('Ensured at least one DELIVERED order for each month of the past year');
}

// Helper function to create an order for a specific month
async function createOrderForMonth(
  supplierIds: string[],
  partIds: string[],
  month: number,
  oneYearAgo: Date,
  forceStatus?: OrderStatus
) {
  // Pick a random supplier
  const supplierId = supplierIds[faker.number.int({ min: 0, max: supplierIds.length - 1 })];
  
  // Get parts supplied by this supplier
  const supplierParts = await prisma.supplierPart.findMany({
    where: { supplierId },
    select: { partId: true, price: true }
  });
  
  if (supplierParts.length === 0) {
    // If no supplier parts found, create them first
    const numParts = Math.min(3, partIds.length);
    for (let i = 0; i < numParts; i++) {
      const partId = partIds[i];
      await prisma.supplierPart.create({
        data: {
          supplierId,
          partId,
          price: faker.number.int({ min: 100000, max: 2000000 }),
          leadTime: faker.number.int({ min: 1, max: 30 }),
          isPreferred: i === 0 // First one is preferred
        }
      });
    }
    
    // Now retry fetching the supplier parts
    const supplierParts = await prisma.supplierPart.findMany({
      where: { supplierId },
      select: { partId: true, price: true }
    });
    
    if (supplierParts.length === 0) {
      console.error(`Could not create supplier parts for month ${month}`);
      return;
    }
  }
  
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
  
  // Use the forced status if provided, otherwise randomly select
  // For DELIVERED orders, use a date in the same month
  const status = forceStatus || faker.helpers.arrayElement(['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED']);
  
  // Calculate delivery date based on status
  let deliveryDate = null;
  if (['SHIPPED', 'DELIVERED'].includes(status)) {
    // For completed orders, ensure delivery date is in the same month
    const maxDeliveryDate = new Date(Math.min(adjustedMonthEnd.getTime(), Date.now()));
    deliveryDate = faker.date.between({ from: orderDate, to: maxDeliveryDate });
  } else if (status === 'APPROVED') {
    // For approved orders, delivery date can be in the future
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + 30);
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
  
  console.log(`Created order for month ${month}, order date: ${orderDate.toISOString()}, status: ${status}`);
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
  
  // Create a map to track events by month and type
  const monthlyEvents = new Map<number, { primitive: number; reactive: number }>();
  
  // Initialize the map with 0 events for each month (0-11)
  for (let month = 0; month < 12; month++) {
    monthlyEvents.set(month, { primitive: 0, reactive: 0 });
  }
  
  // Categories of maintenance types
  const primitiveTypes = [MaintenanceType.SCHEDULED_MAINTENANCE, MaintenanceType.INSPECTION];
  const reactiveTypes = [MaintenanceType.BREAKDOWN, MaintenanceType.REPAIR];
  
  // REPLACEMENT can be either primitive or reactive depending on context
  // We'll allocate REPLACEMENT events proportionally based on our primitive/reactive ratio
  
  console.log('Applying primitive-dominated monthly maintenance distribution...');
  
  // Calculate how many BREAKDOWN events to create based on the desired ratio
  // We want only 20% of total events to be reactive
  const totalEvents = count; // Total number of maintenance events to create
  const reactiveEventCount = Math.round(totalEvents * 0.20); // 20% reactive
  const primitiveEventCount = totalEvents - reactiveEventCount; // 80% primitive
  
  console.log(`Setting up ${primitiveEventCount} primitive events (${Math.round(primitiveEventCount/totalEvents*100)}%) and ${reactiveEventCount} reactive events (${Math.round(reactiveEventCount/totalEvents*100)}%)`);
  
  // Create BREAKDOWN events (part of reactive maintenance)
  // We'll allocate a portion of the reactive events to BREAKDOWNs
  // For example, we might allocate 60% of reactive events as BREAKDOWNs
  const breakdownEvents = Math.round(reactiveEventCount * 0.6);
  const breakdownsPerEquipment = Math.max(1, Math.ceil(breakdownEvents / equipmentIds.length));
  
  console.log(`Creating ${breakdownEvents} BREAKDOWN events (${breakdownsPerEquipment} per equipment on average)...`);
  
  // Create a smaller number of BREAKDOWN events due to the ratio
  let totalBreakdownsCreated = 0;
  
  for (const equipmentId of equipmentIds) {
    // We want a smaller MTBF (more days between failures) to reduce the frequency
    // of breakdowns in line with our ratio
    const mtbf = faker.number.int({ min: 120, max: 300 }); // Increased MTBF (fewer breakdowns)
    console.log(`Equipment ${equipmentId} MTBF: ${mtbf} days`);
    
    // Calculate how many breakdowns can fit in a year with this MTBF
    const daysInYear = 365;
    const maxBreakdowns = Math.floor(daysInYear / mtbf);
    const numBreakdowns = Math.min(breakdownsPerEquipment, Math.max(1, maxBreakdowns));
    
    if (totalBreakdownsCreated >= breakdownEvents) {
      // We've already created enough breakdown events
      break;
    }
    
    let lastBreakdownDate = new Date(oneYearAgo);
    
    for (let j = 0; j < numBreakdowns; j++) {
      if (totalBreakdownsCreated >= breakdownEvents) {
        // We've reached our target breakdown count
        break;
      }
      
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
      
      // Calculate the next breakdown date based on MTBF with some randomness
      const mtbfVariation = mtbf * (1 + faker.number.float({ min: -0.15, max: 0.15 }));
      const nextBreakdownMs = lastBreakdownDate.getTime() + (mtbfVariation * 24 * 60 * 60 * 1000);
      
      // Ensure the breakdown date is within the past year
      const scheduledDate = new Date(Math.min(nextBreakdownMs, Date.now() - 24 * 60 * 60 * 1000)); // At least 1 day ago
      lastBreakdownDate = scheduledDate;
      
      // Calculate which week this falls into (0-51)
      const weekNumber = Math.floor((scheduledDate.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Increment the count for this week if it's a valid week number
      if (weekNumber >= 0 && weekNumber < 52) {
        weeklyEvents.set(weekNumber, (weeklyEvents.get(weekNumber) || 0) + 1);
      }
      
      // Calculate the month (0-11)
      const monthNumber = scheduledDate.getMonth();
      
      // Update the monthly event count
      const monthData = monthlyEvents.get(monthNumber);
      if (monthData) {
        monthData.reactive += 1;
        monthlyEvents.set(monthNumber, monthData);
      }
      
      // Set completed date to be 1-7 days after scheduled date
      const repairDuration = faker.number.int({ min: 1, max: 7 }); // Days
      
      const completedDate = new Date(scheduledDate);
      completedDate.setDate(scheduledDate.getDate() + repairDuration);
      
      // Only use completed date if it's not in the future
      const finalCompletedDate = completedDate.getTime() > Date.now() ? null : completedDate;
      
      await prisma.maintenanceEvent.create({
        data: {
          equipmentId,
          partId,
          eventType: 'BREAKDOWN',
          description: getMaintenanceDescription('BREAKDOWN'),
          scheduledDate,
          completedDate: finalCompletedDate,
          createdBy: technicians[faker.number.int({ min: 0, max: technicians.length - 1 })]
        }
      });
      
      totalBreakdownsCreated++;
    }
  }
  
  console.log(`Created ${totalBreakdownsCreated} BREAKDOWN events`);
  
  // Track reactive events created so far
  let totalReactiveCreated = totalBreakdownsCreated;
  
  // Create remaining reactive events (REPAIR)
  const repairEventsNeeded = reactiveEventCount - totalReactiveCreated;
  console.log(`Creating ${repairEventsNeeded} REPAIR events...`);
  
  if (repairEventsNeeded > 0) {
    for (let i = 0; i < repairEventsNeeded; i++) {
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
      
      const scheduledDate = faker.date.between({ from: oneYearAgo, to: new Date() });
      
      // Calculate which week this falls into (0-51)
      const weekNumber = Math.floor((scheduledDate.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Increment the count for this week if it's a valid week number
      if (weekNumber >= 0 && weekNumber < 52) {
        weeklyEvents.set(weekNumber, (weeklyEvents.get(weekNumber) || 0) + 1);
      }
      
      // Calculate the month (0-11)
      const monthNumber = scheduledDate.getMonth();
      
      // Update the monthly event count
      const monthData = monthlyEvents.get(monthNumber);
      if (monthData) {
        monthData.reactive += 1;
        monthlyEvents.set(monthNumber, monthData);
      }
      
      // Set maintenance duration between 1-7 days
      let completedDate = null;
      if (faker.datatype.boolean(0.8)) { // 80% chance it's completed
        const maintenanceDuration = faker.number.int({ min: 1, max: 5 }); // Days
        
        completedDate = new Date(scheduledDate);
        completedDate.setDate(scheduledDate.getDate() + maintenanceDuration);
        
        // Only use completed date if it's not in the future
        if (completedDate.getTime() > Date.now()) {
          completedDate = null;
        }
      }
      
      await prisma.maintenanceEvent.create({
        data: {
          equipmentId,
          partId,
          eventType: 'REPAIR',
          description: getMaintenanceDescription('REPAIR'),
          scheduledDate,
          completedDate,
          createdBy: technicians[faker.number.int({ min: 0, max: technicians.length - 1 })]
        }
      });
      
      totalReactiveCreated++;
    }
  }
  
  // Now create primitive maintenance events
  console.log(`Creating ${primitiveEventCount} primitive maintenance events...`);
  
  // Aim for roughly even distribution of primitive events across months
  const targetPrimitivePerMonth = Math.ceil(primitiveEventCount / 12);
  console.log(`Target primitive events per month: ~${targetPrimitivePerMonth}`);
  
  // Distribution of primitive maintenance types (SCHEDULED_MAINTENANCE, INSPECTION, and some REPLACEMENT)
  // 60% SCHEDULED_MAINTENANCE, 30% INSPECTION, 10% REPLACEMENT (as preventative replacement)
  const scheduledCount = Math.round(primitiveEventCount * 0.6);
  const inspectionCount = Math.round(primitiveEventCount * 0.3);
  const preventativeReplacementCount = primitiveEventCount - scheduledCount - inspectionCount;
  
  console.log(`Distribution: ${scheduledCount} SCHEDULED_MAINTENANCE, ${inspectionCount} INSPECTION, ${preventativeReplacementCount} preventative REPLACEMENT`);
  
  // Create primitive maintenance events prioritizing months that need more
  async function createPrimitiveEvent(eventType: MaintenanceType) {
    // Determine which month needs more primitive events to ensure balance
    // Find months with the lowest primitive-to-reactive ratio
    const monthEntries = Array.from(monthlyEvents.entries());
    
    // Sort months by primitive-to-reactive ratio (ascending)
    // Prioritize months with lower ratios
    monthEntries.sort((a, b) => {
      const ratioA = a[1].reactive === 0 ? Infinity : a[1].primitive / a[1].reactive;
      const ratioB = b[1].reactive === 0 ? Infinity : b[1].primitive / b[1].reactive;
      return ratioA - ratioB;
    });
    
    // Select the month with the lowest ratio that still needs more primitive events
    let targetMonth = monthEntries[0][0]; // Default to first month
    
    // If all months have good ratios, distribute evenly
    const allMonthsGood = monthEntries.every(([_, data]) => {
      return data.reactive === 0 || data.primitive > data.reactive;
    });
    
    if (allMonthsGood) {
      // If all months already have good ratios, distribute more evenly
      // Find the month with the fewest primitive events
      monthEntries.sort((a, b) => a[1].primitive - b[1].primitive);
      targetMonth = monthEntries[0][0];
    }
    
    // Generate a date in the target month
    const monthStartDate = new Date(oneYearAgo);
    monthStartDate.setMonth(oneYearAgo.getMonth() + targetMonth);
    monthStartDate.setDate(1); // First day of the month
    
    const monthEndDate = new Date(monthStartDate);
    monthEndDate.setMonth(monthStartDate.getMonth() + 1);
    monthEndDate.setDate(0); // Last day of the month
    
    // Ensure date is not in the future
    const adjustedMonthEndDate = new Date(Math.min(monthEndDate.getTime(), Date.now()));
    
    // Pick a random date within the month
    const scheduledDate = faker.date.between({ from: monthStartDate, to: adjustedMonthEndDate });
    
    // Pick a random equipment
    const equipmentId = equipmentIds[faker.number.int({ min: 0, max: equipmentIds.length - 1 })];
    
    // For some events, associate with a part (probability varies by event type)
    let usePartProbability = 0.3; // Default 30% chance
    if (eventType === 'INSPECTION') {
      usePartProbability = 0.1; // Only 10% chance for inspections
    } else if (eventType === 'REPLACEMENT') {
      usePartProbability = 0.9; // 90% chance for replacements
    }
    
    const usePart = faker.datatype.boolean(usePartProbability);
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
    
    // Calculate which week this falls into (0-51)
    const weekNumber = Math.floor((scheduledDate.getTime() - oneYearAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Increment the count for this week if it's a valid week number
    if (weekNumber >= 0 && weekNumber < 52) {
      weeklyEvents.set(weekNumber, (weeklyEvents.get(weekNumber) || 0) + 1);
    }
    
    // Update the monthly event count
    const monthData = monthlyEvents.get(targetMonth);
    if (monthData) {
      monthData.primitive += 1;
      monthlyEvents.set(targetMonth, monthData);
    }
    
    // Set maintenance duration based on event type
    let completionProbability = 0.95; // Default 95% completion rate for primitive
    let maxMaintenanceDuration = 3; // Default 1-3 days for primitive
    
    if (eventType === 'INSPECTION') {
      completionProbability = 0.98; // 98% for inspections
      maxMaintenanceDuration = 2; // 1-2 days for inspections
    } else if (eventType === 'REPLACEMENT') {
      completionProbability = 0.9; // 90% for replacements
      maxMaintenanceDuration = 4; // 1-4 days for replacements
    }
    
    let completedDate = null;
    if (faker.datatype.boolean(completionProbability)) {
      const maintenanceDuration = faker.number.int({ min: 1, max: maxMaintenanceDuration });
      
      completedDate = new Date(scheduledDate);
      completedDate.setDate(scheduledDate.getDate() + maintenanceDuration);
      
      // Only use completed date if it's not in the future
      if (completedDate.getTime() > Date.now()) {
        completedDate = null;
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
  
  // Create SCHEDULED_MAINTENANCE events
  for (let i = 0; i < scheduledCount; i++) {
    await createPrimitiveEvent('SCHEDULED_MAINTENANCE');
  }
  
  // Create INSPECTION events
  for (let i = 0; i < inspectionCount; i++) {
    await createPrimitiveEvent('INSPECTION');
  }
  
  // Create preventative REPLACEMENT events
  for (let i = 0; i < preventativeReplacementCount; i++) {
    await createPrimitiveEvent('REPLACEMENT');
  }
  
  // Ensure each week has at least 2 events
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
      
      // Calculate the month (0-11)
      const monthNumber = scheduledDate.getMonth();
      
      // Pick a random equipment
      const equipmentId = equipmentIds[faker.number.int({ min: 0, max: equipmentIds.length - 1 })];
      
      // For maintaining our desired ratio, we'll heavily favor primitive maintenance
      // 85% chance of primitive, 15% chance of reactive
      const isPrimitive = faker.datatype.boolean(0.85);
      
      // Choose event type based on primitive/reactive determination
      let eventType;
      if (isPrimitive) {
        // Choose between SCHEDULED_MAINTENANCE and INSPECTION
        eventType = primitiveTypes[faker.number.int({ min: 0, max: primitiveTypes.length - 1 })];
        
        // Update the monthly primitive count
        const monthData = monthlyEvents.get(monthNumber);
        if (monthData) {
          monthData.primitive += 1;
          monthlyEvents.set(monthNumber, monthData);
        }
      } else {
        // Choose between BREAKDOWN and REPAIR
        eventType = reactiveTypes[faker.number.int({ min: 0, max: reactiveTypes.length - 1 })];
        
        // Update the monthly reactive count
        const monthData = monthlyEvents.get(monthNumber);
        if (monthData) {
          monthData.reactive += 1;
          monthlyEvents.set(monthNumber, monthData);
        }
      }
      
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
      
      // Set maintenance duration based on event type
      let completedDate = null;
      if (faker.datatype.boolean(0.8)) { // 80% chance it's completed
        // Primitive maintenance tends to be completed faster
        const maxDuration = isPrimitive ? 3 : 7;
        const maintenanceDuration = faker.number.int({ min: 1, max: maxDuration }); // Days
        
        completedDate = new Date(scheduledDate);
        completedDate.setDate(scheduledDate.getDate() + maintenanceDuration);
        
        // Only use completed date if it's not in the future
        if (completedDate.getTime() > Date.now()) {
          completedDate = null;
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
  
  // Log the final distribution of events by month
  console.log('Monthly maintenance event distribution:');
  let primitiveDominatedCount = 0;
  
  for (let month = 0; month < 12; month++) {
    const data = monthlyEvents.get(month) || { primitive: 0, reactive: 0 };
    const ratio = data.reactive === 0 ? '∞' : (data.primitive / data.reactive).toFixed(2);
    const primitiveDominated = data.reactive === 0 || data.primitive > data.reactive;
    
    if (primitiveDominated) {
      primitiveDominatedCount++;
    }
    
    console.log(`Month ${month}: ${data.primitive} primitive, ${data.reactive} reactive (ratio: ${ratio}) - ${primitiveDominated ? 'Primitive dominated' : 'Reactive dominated'}`);
  }
  
  console.log(`${primitiveDominatedCount} out of 12 months have more primitive than reactive maintenance events (${Math.round(primitiveDominatedCount/12*100)}%)`);
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
  
  const today = new Date();
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
      
      // Determine if this schedule should be due in the future
      // 30% chance for 2 days in future, 20% chance for 7 days in future
      const randomValue = Math.random();
      let nextDue: Date;
      let lastExecuted: Date;
      
      if (randomValue < 0.3) {
        // Due in 2 days
        nextDue = new Date(today);
        nextDue.setDate(today.getDate() + 2);
        lastExecuted = new Date(nextDue);
        lastExecuted.setDate(nextDue.getDate() - frequency);
      } else if (randomValue < 0.5) {
        // Due in 7 days
        nextDue = new Date(today);
        nextDue.setDate(today.getDate() + 7);
        lastExecuted = new Date(nextDue);
        lastExecuted.setDate(nextDue.getDate() - frequency);
      } else {
        // Due in the past or very near future (within 1 day)
        lastExecuted = new Date(today);
        lastExecuted.setDate(today.getDate() - frequency + faker.number.int({ min: -1, max: 1 }));
        nextDue = new Date(lastExecuted);
        nextDue.setDate(lastExecuted.getDate() + frequency);
      }
      
      // Ensure lastExecuted is not earlier than oneYearAgo
      lastExecuted = new Date(Math.max(lastExecuted.getTime(), oneYearAgo.getTime()));
      
      // Log the schedule timing
      const daysFromNow = Math.round((nextDue.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      console.log(`Schedule: ${title}, Next due: ${nextDue.toISOString()}, Days from now: ${daysFromNow}`);
      
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
  
  // Log distribution of future dates
  const futureDates = schedules.filter(s => s.nextDue > today);
  console.log(`Created ${futureDates.length} schedules with future dates`);
  futureDates.forEach(s => {
    const daysFromNow = Math.round((s.nextDue.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    console.log(`- ${s.name}: due in ${daysFromNow} days`);
  });
}

async function seedProductionLines(count: number): Promise<string[]> {
  const productionLines = [];
  
  const persianProductionLineNames = [
    'خط تولید اصلی', 'خط مونتاژ', 'خط بسته‌بندی', 'خط تست کیفیت',
    'خط تولید محصول A', 'خط تولید محصول B', 'خط تولید محصول C',
    'خط پردازش اولیه', 'خط پردازش نهایی', 'خط پرداخت'
  ];
  
  const statuses = Object.values(ProductionLineStatus);
  
  for (let i = 0; i < count; i++) {
    const name = i < persianProductionLineNames.length 
      ? persianProductionLineNames[i] 
      : `خط تولید ${faker.string.alpha(1).toUpperCase()}`;
    
    productionLines.push({
      name,
      description: `این ${name} برای تولید محصولات با کیفیت بالا طراحی شده است.`,
      status: statuses[faker.number.int({ min: 0, max: statuses.length - 1 })],
      capacity: faker.number.float({ min: 50, max: 500, fractionDigits: 1 })
    });
  }
  
  const createdProductionLines = await Promise.all(
    productionLines.map(pl => prisma.productionLine.create({ data: pl }))
  );
  
  return createdProductionLines.map(pl => pl.id);
}
