"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/presentation/components/ui/table"
import { TransactionFormDialog } from "@/lib/presentation/components/features/transaction-form-dialog"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, fadeInVariants } from "@/lib/presentation/animations/variants"

export default function TransactionsPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()

  // Fetch transactions data
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await axios.get('/api/transactions')
      return response.data
    },
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/transactions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete transaction')
    },
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const transactions = transactionsData?.transactions || []

  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
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
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">View and manage your transactions</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <TransactionFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </TransactionFormDialog>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2"
      >
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Income</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-2xl font-bold text-green-600"
          >
            {formatCurrency(totalIncome)}
          </motion.p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-2xl font-bold text-red-600"
          >
            {formatCurrency(totalExpenses)}
          </motion.p>
        </motion.div>
      </motion.div>

      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground mb-4">No transactions yet</p>
          <TransactionFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Transaction
            </Button>
          </TransactionFormDialog>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-lg border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: any, index: number) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05, type: "spring" }}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-700"
                          : transaction.type === "EXPENSE"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {transaction.type}
                    </motion.span>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : transaction.type === "EXPENSE"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : ""}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </motion.div>
  )
}
