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
import { Plus } from "lucide-react"

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
import { CategoryFormDialog } from "./category-form-dialog"

const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormDialogProps {
  children: React.ReactNode
}

export function TransactionFormDialog({ children }: TransactionFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)
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

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: "",
      description: "",
      amount: "",
      type: "EXPENSE",
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const response = await axios.post('/api/transactions', {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date, // Send date string directly in YYYY-MM-DD format
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success("Transaction added successfully!")
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add transaction")
    },
  })

  const handleSubmit = (data: TransactionFormValues) => {
    createMutation.mutate(data)
  }

  const accounts = accountsData?.accounts || []
  const categories = categoriesData?.categories || []

  const selectedType = form.watch("type")

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <AnimatePresence>
          {open && (
            <DialogContent className="sm:max-w-[650px]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense transaction.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Type selector - Full width */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INCOME">Income</SelectItem>
                              <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    {/* Description - Full width */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Grocery shopping" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Two column grid for category and date */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              <span>Category</span>
                              {categories.length === 0 && (
                                <CategoryFormDialog
                                  open={categoryDialogOpen}
                                  onOpenChange={setCategoryDialogOpen}
                                  defaultType={selectedType}
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setCategoryDialogOpen(true)
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Create
                                  </Button>
                                </CategoryFormDialog>
                              )}
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem value="none" disabled>No categories yet</SelectItem>
                                ) : (
                                  <>
                                    {categories.map((category: any) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                    <div className="px-2 py-1.5 border-t mt-1">
                                      <CategoryFormDialog
                                        open={categoryDialogOpen}
                                        onOpenChange={setCategoryDialogOpen}
                                        defaultType={selectedType}
                                      >
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start h-8 text-xs"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            setCategoryDialogOpen(true)
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-2" />
                                          Create New Category
                                        </Button>
                                      </CategoryFormDialog>
                                    </div>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button type="submit" disabled={createMutation.isPending || accounts.length === 0}>
                          {createMutation.isPending ? "Adding..." : "Add Transaction"}
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
    </>
  )
}
