"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { EnergyForecastData } from "@/lib/types"

const chartConfig = {
  predictedEnergy: {
    label: "Energy",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type EnergyForecastChartProps = {
  data: EnergyForecastData[];
}

export function EnergyForecastChart({ data }: EnergyForecastChartProps) {
  if (!data || data.length === 0) {
      return (
          <div className="flex items-center justify-center h-60 w-full text-muted-foreground">
              No forecast data available.
          </div>
      )
  }
  
  return (
    <div className="h-60 w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart
                data={data}
                accessibilityLayer
                margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickCount={6}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="predictedEnergy"
                  type="monotone"
                  stroke="var(--color-predictedEnergy)"
                  strokeWidth={3}
                  dot={false}
                />
            </LineChart>
        </ChartContainer>
    </div>
  )
}
