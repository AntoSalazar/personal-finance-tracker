"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus } from "lucide-react"
import { AccountCard } from "@/lib/presentation/components/features/account-card"
import { AccountFormDialog } from "@/lib/presentation/components/features/account-form-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

export default function AccountsPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()

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
    console.log("Edit account:", id)
    // TODO: Implement edit functionality
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <AccountFormDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </AccountFormDialog>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No accounts yet</p>
          <AccountFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </AccountFormDialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account: any) => (
            <AccountCard
              key={account.id}
              {...account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
