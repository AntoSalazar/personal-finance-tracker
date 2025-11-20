"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/presentation/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { containerVariants, fadeInVariants } from "@/lib/presentation/animations/variants"
import { useState } from "react"
import { IncomeExpenseChart } from "@/lib/presentation/components/statistics/IncomeExpenseChart"
import { ExpenseBreakdownChart } from "@/lib/presentation/components/statistics/ExpenseBreakdownChart"
import { AccountBalancesChart } from "@/lib/presentation/components/statistics/AccountBalancesChart"
import { TopExpensesList } from "@/lib/presentation/components/statistics/TopExpensesList"
import { NetWorthCard } from "@/lib/presentation/components/statistics/NetWorthCard"

export default function StatisticsPage() {
  const { data: session, isPending } = useSession()
  const [period, setPeriod] = useState('month')

  // Fetch statistics data
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['statistics', period],
    queryFn: async () => {
      const response = await axios.get(`/api/statistics?period=${period}`)
      return response.data
    },
    enabled: !!session,
  })

  if (isPending) {
    return (
      <div className="space-y-4 p-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  const summary = statsData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    savingsRate: 0,
    netWorth: 0,
    transactionCount: 0,
    avgExpenseAmount: 0,
    avgIncomeAmount: 0,
  }

  const categoryBreakdown = statsData?.categoryBreakdown || []
  const monthlyTrends = statsData?.monthlyTrends || []
  const accountBalances = statsData?.accountBalances || []
  const topSpending = statsData?.topSpending || []

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
      className="space-y-4 p-4 md:p-6 max-w-[1600px] mx-auto"
    >
      {/* Header with tabs inline for desktop */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Financial Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your wealth and spending patterns
          </p>
        </div>

        {/* Period Tabs - Inline on desktop */}
        <Tabs defaultValue="month" value={period} onValueChange={setPeriod}>
          <TabsList className="grid w-full md:w-auto grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="month" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs md:text-sm">Month</TabsTrigger>
            <TabsTrigger value="quarter" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs md:text-sm">Quarter</TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs md:text-sm">Year</TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs md:text-sm">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Hero Section - Net Worth */}
          <NetWorthCard
            netWorth={summary.netWorth}
            accountCount={accountBalances.length}
            netIncome={summary.netIncome}
          />

          {/* Main Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Monthly Trends - Takes 2 columns */}
            <div className="lg:col-span-2">
              <IncomeExpenseChart data={monthlyTrends} />
            </div>

            {/* Expense Breakdown - Takes 1 column */}
            <div className="lg:col-span-1">
              <ExpenseBreakdownChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Account Balances */}
            <AccountBalancesChart data={accountBalances} />

            {/* Top Spending */}
            <TopExpensesList data={topSpending} />
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
