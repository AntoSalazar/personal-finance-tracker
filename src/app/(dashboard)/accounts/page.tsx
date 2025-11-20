"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus, ArrowRightLeft } from "lucide-react"
import { AccountCard } from "@/lib/presentation/components/features/account-card"
import { AccountFormDialog } from "@/lib/presentation/components/features/account-form-dialog"
import { EditAccountFormDialog } from "@/lib/presentation/components/features/edit-account-form-dialog"
import { TransferFormDialog } from "@/lib/presentation/components/features/transfer-form-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { useState } from "react"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, fadeInVariants } from "@/lib/presentation/animations/variants"

export default function AccountsPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()
  const [editingAccount, setEditingAccount] = useState<any | null>(null)

  // Fetch accounts data
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get('/api/accounts')
      return response.data
    },
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete account')
    },
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const accounts = accountsData?.accounts || []
  const totalBalance = accountsData?.totalBalance || 0

  const handleEdit = (id: string) => {
    const account = accounts.find((acc: any) => acc.id === id)
    if (account) {
      setEditingAccount(account)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id)
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2"
        >
          {accounts.length >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <TransferFormDialog>
                <Button variant="outline">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              </TransferFormDialog>
            </motion.div>
          )}
          <AccountFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </AccountFormDialog>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-lg border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-3xl font-bold"
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalBalance)}
            </motion.p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
          </div>
        </div>
      </motion.div>

      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground mb-4">No accounts yet</p>
          <AccountFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </AccountFormDialog>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {accounts.map((account: any, index: number) => (
            <motion.div key={account.id} variants={itemVariants}>
              <AccountCard
                {...account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit Account Dialog */}
      {editingAccount && (
        <EditAccountFormDialog
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          account={editingAccount}
        />
      )}
    </motion.div>
  )
}
