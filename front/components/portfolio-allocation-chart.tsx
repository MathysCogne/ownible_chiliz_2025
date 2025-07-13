"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface AllocationData {
  category: string;
  value: number;
  fill: string;
}

interface PortfolioAllocationChartProps {
  data: AllocationData[];
}

export function PortfolioAllocationChart({ data }: PortfolioAllocationChartProps) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.category] = { label: item.category, color: item.fill };
    return acc;
  }, {} as any);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.category}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
} 