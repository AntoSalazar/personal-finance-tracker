"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/presentation/components/ui/select"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultType?: "INCOME" | "EXPENSE"
  category?: {
    id: string
    name: string
    type: "INCOME" | "EXPENSE"
    description?: string
    color?: string
    icon?: string
  }
}

export function CategoryFormDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultType = "EXPENSE",
  category
}: CategoryFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const queryClient = useQueryClient()
  const isEditing = !!category

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || defaultType,
      description: category?.description || "",
      color: category?.color || "#3b82f6",
      icon: category?.icon || "",
    },
  })

  // Reset form when category changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        type: category?.type || defaultType,
        description: category?.description || "",
        color: category?.color || "#3b82f6",
        icon: category?.icon || "",
      })
    }
  }, [open, category, defaultType, form])

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (isEditing) {
        const response = await axios.put(`/api/categories/${category.id}`, data)
        return response.data
      } else {
        const response = await axios.post('/api/categories', data)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!")
      setOpen(false)
      form.reset({
        name: "",
        type: defaultType,
        description: "",
        color: "#3b82f6",
        icon: "",
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || (isEditing ? "Failed to update category" : "Failed to create category"))
    },
  })

  const handleSubmit = (data: CategoryFormValues) => {
    saveMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Category" : "Create New Category"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update the category information." : "Add a new category to organize your transactions."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Groceries, Salary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-center">
                            <Input type="color" {...field} className="w-16 h-10" />
                            <Input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="#3b82f6"
                              className="flex-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description" {...field} />
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
                      <Button type="submit" disabled={saveMutation.isPending}>
                        {saveMutation.isPending
                          ? (isEditing ? "Updating..." : "Creating...")
                          : (isEditing ? "Update Category" : "Create Category")
                        }
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
