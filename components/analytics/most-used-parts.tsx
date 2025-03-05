"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMostUsedParts } from "@/app/actions/analytics"

export function MostUsedParts() {
  const [partsData, setPartsData] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMostUsedParts()
      setPartsData(data)
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>قطعات پرمصرف</CardTitle>
        <CardDescription>۱۰ قطعه با بیشترین مصرف</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام قطعه</TableHead>
              <TableHead className="text-center">تعداد مصرف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partsData.map((part) => (
              <TableRow key={part.name}>
                <TableCell className="text-right">{part.name}</TableCell>
                <TableCell className="text-center">{part.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          تحلیل قطعات پرمصرف <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          نمایش ۱۰ قطعه با بیشترین مصرف
        </div>
      </CardFooter>
    </Card>
  )
}
