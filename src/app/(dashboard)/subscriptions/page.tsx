"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus, PlayCircle, PauseCircle, XCircle } from "lucide-react"
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
import { SubscriptionFormDialog } from "@/lib/presentation/components/features/subscription-form-dialog"
import { useState } from "react"

export default function SubscriptionsPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all')

  // Fetch subscriptions data
  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await axios.get('/api/subscriptions')
      return response.data
    },
    enabled: !!session,
  })

  // Fetch summary data
  const { data: summaryData } = useQuery({
    queryKey: ['subscriptions', 'summary'],
    queryFn: async () => {
      const response = await axios.get('/api/subscriptions/summary')
      return response.data
    },
    enabled: !!session,
  })

  // Process subscription mutation
  const processMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/api/subscriptions/${id}/process`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Subscription processed successfully')
    },
    onError: () => {
      toast.error('Failed to process subscription')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/subscriptions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Subscription deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete subscription')
    },
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const subscriptions = subscriptionsData?.subscriptions || []
  const summary = summaryData || {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pausedSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalMonthlyAmount: 0,
    nextBillingDate: null,
  }

  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    if (filter === 'all') return true
    return sub.status === filter.toUpperCase()
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'MONTHLY': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'QUARTERLY': return 'bg-green-100 text-green-700 border-green-200'
      case 'YEARLY': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage your recurring subscriptions</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SubscriptionFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </SubscriptionFormDialog>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-4"
      >
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-2xl font-bold text-red-600"
          >
            {formatCurrency(summary.totalMonthlyAmount)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Normalized to monthly</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-2xl font-bold text-green-600"
          >
            {summary.activeSubscriptions}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Currently running</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-2xl font-bold"
          >
            {summary.totalSubscriptions}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">All subscriptions</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Next Bill</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-lg font-bold"
          >
            {summary.nextBillingDate ? format(new Date(summary.nextBillingDate), "MMM dd") : 'N/A'}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Next billing date</p>
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
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'paused' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paused')}
        >
          Paused
        </Button>
        <Button
          variant={filter === 'cancelled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </Button>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground mb-4">No subscriptions yet</p>
          <SubscriptionFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subscription
            </Button>
          </SubscriptionFormDialog>
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
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription: any, index: number) => (
                <motion.tr
                  key={subscription.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getFrequencyBadgeColor(subscription.frequency)}>
                      {subscription.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.nextBillingDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {subscription.status === 'ACTIVE' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : subscription.status === 'PAUSED' ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <PauseCircle className="mr-1 h-3 w-3" />
                        Paused
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatCurrency(subscription.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {subscription.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processMutation.mutate(subscription.id)}
                      >
                        Process Now
                      </Button>
                    )}
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
