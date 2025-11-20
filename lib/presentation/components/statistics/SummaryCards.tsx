"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/lib/presentation/components/ui/progress"
import { itemVariants } from "@/lib/presentation/animations/variants"

interface SummaryCardsProps {
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    savingsRate: number
    transactionCount: number
    avgExpenseAmount: number
    avgIncomeAmount: number
  }
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${summary.totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${summary.avgIncomeAmount.toFixed(2)} per transaction
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${summary.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${summary.avgExpenseAmount.toFixed(2)} per transaction
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${summary.netIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.transactionCount} transactions
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.savingsRate.toFixed(1)}%
            </div>
            <Progress value={Math.max(0, Math.min(100, summary.savingsRate))} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
