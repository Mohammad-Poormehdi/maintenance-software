import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProductionLineStatus } from "@prisma/client";
import { ProductionLineForm } from "@/components/production-lines/production-line-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductionLinePageProps {
  params: Promise<{
    productionLineId: string;
  }>;
}

// Define server action for creating/updating production lines
async function saveProductionLine(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as ProductionLineStatus;
  const capacity = formData.get("capacity") ? parseFloat(formData.get("capacity") as string) : null;

  // Validate required fields
  if (!name) {
    throw new Error("Name is required");
  }

  // Check if we're updating or creating
  if (id && id !== "new") {
    // Update existing production line
    await db.productionLine.update({
      where: { id },
      data: {
        name,
        description,
        status,
        capacity,
      },
    });
  } else {
    // Create new production line
    await db.productionLine.create({
      data: {
        name,
        description,
        status,
        capacity,
      },
    });
  }

  // Redirect to production lines list
  redirect("/production-lines");
}

async function getProductionLine(id: string) {
  if (id === "new") return null;

  const productionLine = await db.productionLine.findUnique({
    where: { id },
    include: {
      equipment: true,
    },
  });

  if (!productionLine) notFound();

  return productionLine;
}

export default async function ProductionLinePage({
  params,
}: ProductionLinePageProps) {
  const {productionLineId} = await params
  const productionLine =  productionLineId !== "new" 
    ? await getProductionLine(productionLineId)
    : null;

  const title = productionLine ? "ویرایش خط تولید" : "افزودن خط تولید جدید";
  const description = productionLine 
    ? "ویرایش اطلاعات خط تولید موجود"
    : "ایجاد یک خط تولید جدید در سیستم";

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <ProductionLineForm
          productionLine={productionLine}
          saveProductionLine={saveProductionLine}
        />
      </Suspense>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
