"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/lib/presentation/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

interface IncomeExpenseChartProps {
  data: any[]
}

const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Income vs Expenses Trend</CardTitle>
        <CardDescription>Monthly comparison over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No data available for this period</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                <XAxis
                  dataKey="month"
                  className="text-xs font-medium"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  className="text-xs font-medium"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      indicator="line" 
                      className="w-40 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl"
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-income)', r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-expenses)', r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
