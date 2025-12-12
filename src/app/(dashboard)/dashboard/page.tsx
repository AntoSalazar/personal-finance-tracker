"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { StatsCard } from "@/lib/presentation/components/features/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Download } from "lucide-react"
import { Button } from "@/lib/presentation/components/ui/button"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, fadeInVariants } from "@/lib/presentation/animations/variants"
import { toast } from "sonner"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()

  const handleExport = async () => {
    try {
      toast.info('Generating Excel export...')
      const response = await axios.get('/api/export', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-export-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Excel file downloaded successfully!')
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Export error:', error)
    }
  }

  // Fetch accounts data
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get('/api/accounts')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch transactions data
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await axios.get('/api/transactions')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch crypto data
  const { data: cryptoData, isLoading: cryptoLoading } = useQuery({
    queryKey: ['crypto'],
    queryFn: async () => {
      const response = await axios.get('/api/crypto')
      return response.data
    },
    enabled: !!session,
  })

  const isLoading = isPending || accountsLoading || transactionsLoading || cryptoLoading

  if (isPending) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading your financial overview...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="" value="" icon={<Wallet className="h-4 w-4" />} isLoading />
          <StatsCard title="" value="" icon={<DollarSign className="h-4 w-4" />} isLoading />
          <StatsCard title="" value="" icon={<TrendingUp className="h-4 w-4" />} isLoading />
          <StatsCard title="" value="" icon={<TrendingDown className="h-4 w-4" />} isLoading />
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  // Calculate stats from real data
  const accountsBalance = accountsData?.totalBalance || 0
  const accounts = accountsData?.accounts || []
  const transactions = transactionsData?.transactions || []
  const cryptoPortfolio = cryptoData?.holdings || []

  // Calculate income and expenses
  const totalIncome = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  // Calculate crypto value
  const cryptoValue = cryptoPortfolio.reduce((sum: number, holding: any) =>
    sum + (holding.amount * holding.currentPrice), 0
  )

  // Total balance includes accounts + crypto
  const totalBalance = accountsBalance + cryptoValue

  // Get recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4)

  // Format currency in MXN
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
      className="space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleExport} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild>
              <Link href="/transactions">
                <ArrowDownRight className="mr-2 h-4 w-4" />
                Add Expense
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild variant="outline">
              <Link href="/transactions">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Add Income
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Crypto Value"
            value={formatCurrency(cryptoValue)}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Add your first transaction to get started</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction: any) => (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-medium ${
                        transaction.type === 'INCOME' ? 'text-green-500' :
                        transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/transactions">View All Transactions</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Accounts Overview</CardTitle>
              <CardDescription>Your financial accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>No accounts yet</p>
                  <p className="text-sm mt-2">Add your first account to get started</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {accounts.slice(0, 3).map((account: any) => (
                    <motion.div
                      key={account.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.type.replace('_', ' ')}</p>
                      </div>
                      <span className="font-medium">
                        ${account.balance.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/accounts">Manage Accounts</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
