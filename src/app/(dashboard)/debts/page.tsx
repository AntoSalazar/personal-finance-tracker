"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus, CheckCircle, XCircle, Clock, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/presentation/components/ui/table"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, fadeInVariants } from "@/lib/presentation/animations/variants"
import { Badge } from "@/lib/presentation/components/ui/badge"
import { DebtFormDialog } from "@/lib/presentation/components/features/debt-form-dialog"
import { MarkDebtPaidDialog } from "@/lib/presentation/components/features/mark-debt-paid-dialog"
import { useState } from "react"

export default function DebtsPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [editingDebt, setEditingDebt] = useState<any>(null)
  const [payingDebt, setPayingDebt] = useState<any>(null)

  // Fetch debts data
  const { data: debtsData, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const response = await axios.get('/api/debts')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch summary data
  const { data: summaryData } = useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: async () => {
      const response = await axios.get('/api/debts/summary')
      return response.data
    },
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/debts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success('Debt deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete debt')
    },
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const debts = debtsData?.debts || []
  const summary = summaryData || {
    totalDebts: 0,
    totalAmount: 0,
    paidDebts: 0,
    paidAmount: 0,
    unpaidDebts: 0,
    unpaidAmount: 0,
  }

  const filteredDebts = debts.filter((debt: any) => {
    if (filter === 'paid') return debt.isPaid
    if (filter === 'unpaid') return !debt.isPaid
    return true
  })

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
          <h2 className="text-3xl font-bold tracking-tight">Debts Receivable</h2>
          <p className="text-muted-foreground">Track money owed to you</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DebtFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Debt
            </Button>
          </DebtFormDialog>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Owed</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-2xl font-bold text-blue-600"
          >
            {formatCurrency(summary.unpaidAmount)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">{summary.unpaidDebts} unpaid debts</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-2xl font-bold text-green-600"
          >
            {formatCurrency(summary.paidAmount)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">{summary.paidDebts} paid debts</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-2xl font-bold"
          >
            {formatCurrency(summary.totalAmount)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">{summary.totalDebts} total debts</p>
        </motion.div>
      </motion.div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unpaid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unpaid')}
        >
          Unpaid
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
        >
          Paid
        </Button>
      </div>

      {filteredDebts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground mb-4">No debts yet</p>
          <DebtFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Debt
            </Button>
          </DebtFormDialog>
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
                <TableHead>Person</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.map((debt: any, index: number) => (
                <motion.tr
                  key={debt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{debt.personName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{debt.description || '-'}</TableCell>
                  <TableCell>
                    {debt.dueDate ? format(new Date(debt.dueDate), "MMM dd, yyyy") : '-'}
                  </TableCell>
                  <TableCell>
                    {debt.isPaid ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Paid
                      </Badge>
                    ) : debt.dueDate && new Date(debt.dueDate) < new Date() ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="mr-1 h-3 w-3" />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600">
                    {formatCurrency(debt.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!debt.isPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPayingDebt(debt)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDebt(debt)}
                        title="Edit debt"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this debt?')) {
                            deleteMutation.mutate(debt.id)
                          }
                        }}
                        title="Delete debt"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Edit debt dialog */}
      <DebtFormDialog
        debt={editingDebt || undefined}
        open={!!editingDebt}
        onOpenChange={(open) => {
          if (!open) setEditingDebt(null)
        }}
      >
        <div />
      </DebtFormDialog>

      {/* Mark debt as paid dialog */}
      {payingDebt && (
        <MarkDebtPaidDialog
          debt={payingDebt}
          open={!!payingDebt}
          onOpenChange={(open) => {
            if (!open) setPayingDebt(null)
          }}
        >
          <div />
        </MarkDebtPaidDialog>
      )}
    </motion.div>
  )
}
