import { useMemo } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import type { ChartConfig } from "@/components/ui/chart"
import { productStore } from "@/Stores/productStore"

export const description = "A horizontal bar chart"

const chartConfig = {
  stock: {
    label: "Stock",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const monthLabels = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function ComboChart() {
  const stocklog = productStore((state) => state.stocklog)

  const { chartData, trendingText, isTrendingUp } = useMemo(() => {
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: monthLabels[i],
      stock: 0,
    }))

    // Get only the latest stock entry per month
    const latestByMonth = new Map<number, typeof stocklog[0]>()

    stocklog.forEach((item) => {
      const month = new Date(item.created_at).getMonth()
      const existing = latestByMonth.get(month)

      if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
        latestByMonth.set(month, item)
      }
    })

    // Fill monthly array with latest current_stock values
    latestByMonth.forEach((item, month) => {
      monthly[month].stock = item.current_stock || 0
    })

    const currentMonthIndex = new Date().getMonth()
    const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : null

    const currentStock = monthly[currentMonthIndex]?.stock || 0
    const prevStock = prevMonthIndex !== null ? monthly[prevMonthIndex]?.stock || 0 : 0

    const difference = currentStock - prevStock
    const percentChange = prevStock > 0 ? (difference / prevStock) * 100 : 0

    const isTrendingUp = percentChange >= 0
    const trendingText = isTrendingUp
      ? `stock up by ${percentChange.toFixed(2)}% this month`
      : `stock down by ${Math.abs(percentChange).toFixed(2)}% this month`

    return {
      chartData: monthly,
      trendingText,
      isTrendingUp,
    }
  }, [stocklog])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock - Bar Chart</CardTitle>
        <CardDescription>January - December {new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[270px] w-[13rem]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: -20 }}
          >
            <XAxis type="number" dataKey="stock" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="stock" fill="var(--color-stock)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendingText}
          {isTrendingUp ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing most recent stock entry per month
        </div>
      </CardFooter>
    </Card>
  )
}
