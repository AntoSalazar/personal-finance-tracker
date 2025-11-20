"use client"

import { Card } from "@/lib/presentation/components/ui/card"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

interface NetWorthCardProps {
  netWorth: number
  accountCount: number
  netIncome: number
}

export function NetWorthCard({ netWorth, accountCount, netIncome }: NetWorthCardProps) {
  const isPositive = netWorth >= 0
  const isGrowing = netIncome >= 0

  return (
    <Card className="relative overflow-hidden border-none shadow-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />

      {/* Content */}
      <div className="relative p-4 md:p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left section - Main value */}
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Total Net Worth</p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${
                  isPositive ? 'text-foreground' : 'text-destructive'
                }`}>
                  ${Math.abs(netWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              </motion.div>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{accountCount} {accountCount === 1 ? 'account' : 'accounts'}</p>
            </div>
          </div>

          {/* Right section - Compact trend */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground/60 mb-1">Period</p>
              <p className={`text-base md:text-lg font-semibold ${
                isGrowing
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isGrowing ? '+' : ''}{netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <motion.div
              animate={{
                y: isGrowing ? [0, -4, 0] : [0, 4, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut"
              }}
              className={`p-2.5 rounded-xl ${
                isGrowing
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
                  : 'bg-rose-500/10 dark:bg-rose-500/20'
              }`}
            >
              {isGrowing ? (
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Card>
  )
}
