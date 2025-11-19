"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { StatsCard } from "@/lib/presentation/components/features/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/lib/presentation/components/ui/button"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()

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
  const totalBalance = accountsData?.totalBalance || 0
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

  // Get recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/transactions">
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/transactions">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Add Income
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={`$${totalBalance.toFixed(2)}`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Income"
          value={`$${totalIncome.toFixed(2)}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatsCard
          title="Crypto Value"
          value={`$${cryptoValue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
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
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/transactions">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accounts Overview</CardTitle>
            <CardDescription>Your financial accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No accounts yet</p>
                <p className="text-sm mt-2">Add your first account to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.slice(0, 3).map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.type.replace('_', ' ')}</p>
                    </div>
                    <span className="font-medium">${account.balance.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/accounts">Manage Accounts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
