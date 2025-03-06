"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOutOfStockParts } from "@/app/actions/analytics";
import { Badge } from "@/components/ui/badge";

interface OutOfStockPart {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
}

interface OutOfStockPartsProps {
  className?: string;
}

export function OutOfStockList({ className }: OutOfStockPartsProps) {
  const [outOfStockParts, setOutOfStockParts] = useState<OutOfStockPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const parts = await getOutOfStockParts();
        setOutOfStockParts(parts);
      } catch (error) {
        console.error("Error fetching out-of-stock parts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <span>اقلام ناموجود</span>
          {!isLoading && <Badge variant="destructive">{outOfStockParts.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p>در حال بارگیری...</p>
          </div>
        ) : outOfStockParts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            تمام اقلام موجود هستند
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {outOfStockParts.map((part) => (
                <div 
                  key={part.id} 
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">
                      حداقل موجودی: {part.minimumStock}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${part.currentStock === 0 ? 'text-destructive' : 'text-amber-500'}`}>
                      {part.currentStock}
                    </span>
                    <span className="text-xs text-muted-foreground">موجودی فعلی</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
