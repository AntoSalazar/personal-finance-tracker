"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/presentation/components/ui/card"
import { Badge } from "@/lib/presentation/components/ui/badge"
import { motion } from "framer-motion"

interface TopExpensesListProps {
  data: any[]
}

export function TopExpensesList({ data }: TopExpensesListProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
      <CardHeader>
        <CardTitle>Top Expenses</CardTitle>
        <CardDescription>Largest transactions this period</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((transaction: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.02)" }}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 p-2 rounded-md transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm truncate max-w-[200px]">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {transaction.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-red-500 text-sm">
                  ${transaction.amount.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
