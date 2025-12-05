"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Textarea } from "@/lib/presentation/components/ui/textarea"

const debtSchema = z.object({
  personName: z.string().min(2, "Person name must be at least 2 characters"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

type DebtFormValues = z.infer<typeof debtSchema>

interface DebtFormDialogProps {
  children: React.ReactNode
}

export function DebtFormDialog({ children }: DebtFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      personName: "",
      amount: "",
      description: "",
      dueDate: "",
      notes: "",
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: DebtFormValues) => {
      const response = await axios.post('/api/debts', {
        ...data,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      toast.success("Debt added successfully!")
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add debt")
    },
  })

  const handleSubmit = (data: DebtFormValues) => {
    createMutation.mutate(data)
  }

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
                <DialogTitle>Add Debt</DialogTitle>
                <DialogDescription>
                  Record money that someone owes you.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Two column grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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

                  {/* Description - Full width */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="What the debt is for" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Adding..." : "Add Debt"}
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
