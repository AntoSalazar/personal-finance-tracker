"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Button } from "@/lib/presentation/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/presentation/components/ui/dialog"
import { Input } from "@/lib/presentation/components/ui/input"
import { Label } from "@/lib/presentation/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/presentation/components/ui/select"
import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"

export default function CryptoPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    amount: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: "",
    accountId: "",
    categoryId: "",
  })

  // Fetch crypto data
  const { data: cryptoData, isLoading } = useQuery({
    queryKey: ['crypto'],
    queryFn: async () => {
      const response = await axios.get('/api/crypto')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get('/api/accounts')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories')
      return response.data
    },
    enabled: !!session,
  })

  // Create crypto holding mutation
  const createHolding = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/crypto', {
        ...data,
        amount: parseFloat(data.amount),
        purchasePrice: parseFloat(data.purchasePrice),
        accountId: data.accountId || undefined,
        categoryId: data.categoryId || undefined,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setOpen(false)
      setFormData({
        symbol: "",
        name: "",
        amount: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: "",
        accountId: "",
        categoryId: "",
      })
      toast.success("Crypto holding added successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add crypto holding")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that category is selected if account is selected
    if (formData.accountId && !formData.categoryId) {
      toast.error("Please select a category when purchasing from an account")
      return
    }

    createHolding.mutate(formData)
  }

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const holdings = cryptoData?.holdings || []
  const accounts = accountsData?.accounts || []
  const categories = categoriesData?.categories || []

  // Calculate portfolio metrics
  const totalPortfolioValue = holdings.reduce((sum: number, holding: any) =>
    sum + (holding.amount * holding.currentPrice), 0
  )
  const totalInvested = holdings.reduce((sum: number, holding: any) =>
    sum + (holding.amount * holding.purchasePrice), 0
  )
  const totalProfitLoss = totalPortfolioValue - totalInvested
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crypto Portfolio</h2>
          <p className="text-muted-foreground">Track your cryptocurrency holdings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Crypto Holding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Crypto Holding</DialogTitle>
              <DialogDescription>
                Add a new cryptocurrency to your portfolio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="BTC"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Bitcoin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    placeholder="0.5"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (MXN)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="any"
                    placeholder="50000"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Purchase From Account (Optional)</Label>
                  <Select
                    value={formData.accountId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, accountId: value, categoryId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None - Track manually" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.accountId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select
                      value={formData.categoryId || undefined}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter((cat: any) => cat.type === 'EXPENSE').map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Cost</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted">
                      <span className="text-sm font-medium">
                        {formatCurrency(parseFloat(formData.amount || "0") * parseFloat(formData.purchasePrice || "0"))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.accountId
                  ? "💰 The purchase cost will be automatically deducted from the selected account"
                  : "📝 No account selected - crypto will be tracked manually without affecting balances"}
              </p>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHolding.isPending}>
                  {createHolding.isPending ? "Adding..." : "Add Holding"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
          <p className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{holdings.length} assets</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
          <p className="text-3xl font-bold">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Profit/Loss</p>
          <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
          </p>
          <p className={`text-sm font-medium ${totalProfitLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No crypto holdings yet</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Crypto Holding
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {holdings.map((holding: any) => {
            const invested = holding.amount * holding.purchasePrice
            const currentValue = holding.amount * holding.currentPrice
            const profitLoss = currentValue - invested
            const profitLossPercent = invested > 0 ? (profitLoss / invested) * 100 : 0

            return (
              <Card key={holding.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-medium">{holding.name}</CardTitle>
                    <CardDescription className="text-xs">{holding.symbol}</CardDescription>
                  </div>
                  <div className={`text-right ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <p className="text-sm font-bold">{profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(currentValue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {holding.amount} {holding.symbol}
                      </p>
                    </div>
                    <div className="pt-2 border-t grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Price</p>
                        <p className="text-sm font-medium">{formatCurrency(holding.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Invested</p>
                        <p className="text-sm font-medium">{formatCurrency(invested)}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Profit/Loss</p>
                      <p className={`text-sm font-bold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
