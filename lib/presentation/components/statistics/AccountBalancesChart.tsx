"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { motion } from "framer-motion"

interface AccountBalancesChartProps {
  data: any[]
}

const accountTypeColors: Record<string, string> = {
  CHECKING: 'bg-slate-700',
  SAVINGS: 'bg-emerald-600',
  CREDIT_CARD: 'bg-amber-600',
  INVESTMENT: 'bg-indigo-600',
  CASH: 'bg-cyan-600',
  OTHER: 'bg-zinc-500',
}

export function AccountBalancesChart({ data }: AccountBalancesChartProps) {
  if (data.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
          <CardDescription>Current balance by account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No accounts available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate max absolute value for scaling
  const maxAbsoluteBalance = Math.max(...data.map(d => Math.abs(d.balance)))

  // Calculate percentage for each bar based on absolute value
  const getBarWidth = (balance: number) => {
    if (maxAbsoluteBalance === 0) return 0
    return (Math.abs(balance) / maxAbsoluteBalance) * 100
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Account Balances</CardTitle>
        <CardDescription>Current balance by account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((account, index) => {
            const barWidth = getBarWidth(account.balance)
            const colorClass = accountTypeColors[account.type] || accountTypeColors.OTHER
            const isNegative = account.balance < 0

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span className="font-medium truncate max-w-[150px]">{account.name}</span>
                  </div>
                  <span className={`font-semibold ${isNegative ? 'text-red-500' : 'text-foreground'}`}>
                    ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="relative h-8 bg-muted/30 rounded-md overflow-hidden">
                  {/* Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full ${colorClass} ${isNegative ? 'opacity-60' : ''} rounded-md flex items-center justify-end px-2`}
                  >
                    <span className="text-xs font-medium text-white">
                      {account.type.replace('_', ' ')}
                    </span>
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-xs">
            {Array.from(new Set(data.map(d => d.type))).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${accountTypeColors[type as string] || accountTypeColors.OTHER}`} />
                <span className="text-muted-foreground">{(type as string).replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
