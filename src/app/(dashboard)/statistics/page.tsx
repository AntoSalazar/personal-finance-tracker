"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/presentation/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { containerVariants, fadeInVariants } from "@/lib/presentation/animations/variants"
import { useState } from "react"
import { SummaryCards } from "@/lib/presentation/components/statistics/SummaryCards"
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
      className="space-y-6 p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Statistics
        </h2>
        <p className="text-muted-foreground">
          Comprehensive financial analytics and insights
        </p>
      </motion.div>

      {/* Period Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="month" value={period} onValueChange={setPeriod} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="month" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Month</TabsTrigger>
            <TabsTrigger value="quarter" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Quarter</TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Year</TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-6 mt-4">
          {/* Summary Cards - Static with prop updates */}
          <SummaryCards summary={summary} />

          {/* Charts Section - Animated transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
                {/* Monthly Trends Line Chart */}
                <div className="lg:col-span-4 h-full">
                  <IncomeExpenseChart data={monthlyTrends} />
                </div>

                {/* Expense Category Breakdown Pie Chart */}
                <div className="lg:col-span-3 h-full">
                  <ExpenseBreakdownChart data={categoryBreakdown} />
                </div>
              </div>

              {/* Second Row of Charts */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Account Balances Bar Chart */}
                <div className="h-full">
                  <AccountBalancesChart data={accountBalances} />
                </div>

                {/* Top Spending */}
                <div className="h-full">
                  <TopExpensesList data={topSpending} />
                </div>
              </div>

              {/* Net Worth Card */}
              <div>
                <NetWorthCard 
                  netWorth={summary.netWorth} 
                  accountCount={accountBalances.length} 
                  netIncome={summary.netIncome}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
