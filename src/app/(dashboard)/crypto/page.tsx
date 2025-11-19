"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Button } from "@/lib/presentation/components/ui/button"
import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export default function CryptoPage() {
  const { data: session, isPending } = useSession()

  // Fetch crypto data
  const { data: cryptoData, isLoading } = useQuery({
    queryKey: ['crypto'],
    queryFn: async () => {
      const response = await axios.get('/api/crypto')
      return response.data
    },
    enabled: !!session,
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const holdings = cryptoData?.holdings || []
  const totalPortfolioValue = holdings.reduce((sum: number, holding: any) =>
    sum + (holding.amount * holding.currentPrice), 0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crypto Portfolio</h2>
          <p className="text-muted-foreground">Track your cryptocurrency holdings</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
            <p className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{holdings.length} assets</p>
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No crypto holdings yet</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Crypto Holding
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {holdings.map((holding: any) => (
            <Card key={holding.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-medium">{holding.name}</CardTitle>
                  <CardDescription className="text-xs">{holding.symbol}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(holding.amount * holding.currentPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {holding.amount} {holding.symbol}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="text-sm font-medium">{formatCurrency(holding.currentPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
