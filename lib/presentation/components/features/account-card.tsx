"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Button } from "@/lib/presentation/components/ui/button"
import { Wallet, CreditCard, PiggyBank, TrendingUp, Banknote, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/presentation/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { cardVariants } from "@/lib/presentation/animations/variants"

interface AccountCardProps {
  id: string
  name: string
  type: "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT" | "CASH"
  balance: number
  currency?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const accountIcons = {
  CHECKING: Wallet,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
  CASH: Banknote,
}

const accountColors = {
  CHECKING: "text-blue-500",
  SAVINGS: "text-green-500",
  CREDIT_CARD: "text-purple-500",
  INVESTMENT: "text-orange-500",
  CASH: "text-gray-500",
}

export function AccountCard({
  id,
  name,
  type,
  balance,
  currency = "USD",
  onEdit,
  onDelete,
}: AccountCardProps) {
  const Icon = accountIcons[type]
  const iconColor = accountColors[type]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </motion.div>
            <div>
              <CardTitle className="text-base font-medium">{name}</CardTitle>
              <CardDescription className="text-xs">
                {type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(id)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(id)} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {formatCurrency(balance)}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
