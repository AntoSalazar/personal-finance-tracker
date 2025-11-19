"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Skeleton } from "@/lib/presentation/components/ui/skeleton"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ReactNode
  isLoading?: boolean
}

export function StatsCard({ title, value, change, trend, icon, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
