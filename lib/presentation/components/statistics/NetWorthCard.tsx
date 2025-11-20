"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Target, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"

interface NetWorthCardProps {
  netWorth: number
  accountCount: number
  netIncome: number
}

export function NetWorthCard({ netWorth, accountCount, netIncome }: NetWorthCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Target className="h-5 w-5 text-primary" />
          </div>
          Net Worth Overview
        </CardTitle>
        <CardDescription>Total value across all accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <motion.p 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-4xl font-bold text-primary tracking-tight"
            >
              ${netWorth.toFixed(2)}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Across {accountCount} accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {netIncome >= 0 ? (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ArrowUpRight className="h-10 w-10 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ArrowDownRight className="h-10 w-10 text-red-500" />
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
