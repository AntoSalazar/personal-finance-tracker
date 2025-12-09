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

const markPaidSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  paidDate: z.string(),
})

type MarkPaidFormValues = z.infer<typeof markPaidSchema>

interface MarkDebtPaidDialogProps {
  children: React.ReactNode
  debt: {
    id: string
    personName: string
    amount: number
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MarkDebtPaidDialog({ children, debt, open: controlledOpen, onOpenChange }: MarkDebtPaidDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const queryClient = useQueryClient()

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }

  // Fetch accounts for the dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get('/api/accounts')
      return response.data
    },
  })

  // Fetch categories for the dropdown (filter for income categories)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories')
      return response.data
    },
  })

  const form = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidSchema),
    defaultValues: {
      accountId: "",
      categoryId: "",
      paidDate: format(new Date(), "yyyy-MM-dd"),
    },
  })

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        accountId: "",
        categoryId: "",
        paidDate: format(new Date(), "yyyy-MM-dd"),
      })
    }
  }, [open, form])

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async (data: MarkPaidFormValues) => {
      const response = await axios.post(`/api/debts/${debt.id}/pay`, {
        accountId: data.accountId,
        categoryId: data.categoryId,
        paidDate: new Date(data.paidDate).toISOString(),
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      queryClient.invalidateQueries({ queryKey: ['debts', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success("Debt marked as paid and income transaction created!")
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to mark debt as paid")
    },
  })

  const handleSubmit = (data: MarkPaidFormValues) => {
    markPaidMutation.mutate(data)
  }

  const accounts = accountsData?.accounts || []
  const categories = categoriesData?.categories?.filter((cat: any) => cat.type === 'INCOME') || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>Mark Debt as Paid</DialogTitle>
                <DialogDescription>
                  Record payment from {debt.personName} for ${Math.abs(debt.amount).toFixed(2)}.
                  This will create an income transaction.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account to receive payment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map((account: any) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.type})
                              </SelectItem>
                            ))}
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select income category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paidDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={markPaidMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button type="submit" disabled={markPaidMutation.isPending}>
                        {markPaidMutation.isPending ? "Processing..." : "Mark as Paid"}
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
