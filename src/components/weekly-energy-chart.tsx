// src/components/weekly-energy-chart.tsx
"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Activity } from "@/lib/types"
import { format, subDays, startOfDay } from "date-fns"

const chartConfig = {
  recharge: {
    label: "Recharge",
    color: "hsl(var(--chart-2))",
  },
  drain: {
    label: "Drain",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type WeeklyEnergyChartProps = {
  activities: Activity[]
}

export function WeeklyEnergyChart({ activities }: WeeklyEnergyChartProps) {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      startOfDay(subDays(new Date(), i))
    ).reverse()

    return last7Days.map((day) => {
      const dayActivities = activities.filter(
        (a) => startOfDay(new Date(a.date)).getTime() === day.getTime()
      )

      const recharge = dayActivities
        .filter((a) => a.impact > 0)
        .reduce((sum, a) => sum + a.impact, 0)

      const drain = dayActivities
        .filter((a) => a.impact < 0)
        .reduce((sum, a) => sum + a.impact, 0)

      return {
        date: format(day, "eee"), // e.g., "Mon"
        recharge,
        drain: Math.abs(drain), // Make drain a positive number for the chart
      }
    })
  }, [activities])

  return (
    <div className="h-60 w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                />
                <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="recharge"
                  type="monotone"
                  stroke="var(--color-recharge)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="drain"
                  type="monotone"
                  stroke="var(--color-drain)"
                  strokeWidth={2}
                  dot={false}
                />
            </LineChart>
        </ChartContainer>
    </div>
  )
}
