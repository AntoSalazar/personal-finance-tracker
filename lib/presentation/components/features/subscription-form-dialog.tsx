"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/lib/presentation/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/presentation/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/presentation/components/ui/form"
import { Input } from "@/lib/presentation/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/presentation/components/ui/select"
import { Textarea } from "@/lib/presentation/components/ui/textarea"

const subscriptionSchema = z.object({
  name: z.string().min(2, "Subscription name must be at least 2 characters"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  nextBillingDate: z.string().min(1, "Next billing date is required"),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

interface SubscriptionFormDialogProps {
  children: React.ReactNode
}

export function SubscriptionFormDialog({ children }: SubscriptionFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()

  // Fetch accounts for the dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get('/api/accounts')
      return response.data
    },
  })

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories')
      return response.data
    },
  })

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      amount: "",
      frequency: "MONTHLY",
      nextBillingDate: format(new Date(), "yyyy-MM-dd"),
      accountId: "",
      categoryId: "",
      notes: "",
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionFormValues) => {
      const response = await axios.post('/api/subscriptions', {
        ...data,
        amount: parseFloat(data.amount),
        nextBillingDate: new Date(data.nextBillingDate).toISOString(),
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success("Subscription added successfully!")
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add subscription")
    },
  })

  const handleSubmit = (data: SubscriptionFormValues) => {
    createMutation.mutate(data)
  }

  const accounts = accountsData?.accounts || []
  const categories = categoriesData?.categories || []
  const expenseCategories = categories.filter((cat: any) => cat.type === 'EXPENSE')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[550px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>Add Subscription</DialogTitle>
                <DialogDescription>
                  Track recurring subscriptions like Netflix, Spotify, etc.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Two column grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Netflix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Two column grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextBillingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Billing Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Two column grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.length === 0 ? (
                                <SelectItem value="none" disabled>No accounts available</SelectItem>
                              ) : (
                                accounts.map((account: any) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.length === 0 ? (
                                <SelectItem value="none" disabled>No expense categories</SelectItem>
                              ) : (
                                expenseCategories.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button type="submit" disabled={createMutation.isPending || accounts.length === 0}>
                        {createMutation.isPending ? "Adding..." : "Add Subscription"}
                      </Button>
                    </motion.div>
                  </DialogFooter>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
