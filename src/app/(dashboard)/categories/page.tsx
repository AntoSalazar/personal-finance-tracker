"use client"

import { useSession } from "@/lib/infrastructure/auth/auth-client"
import { redirect } from "next/navigation"
import { Button } from "@/lib/presentation/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/presentation/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, fadeInVariants } from "@/lib/presentation/animations/variants"
import { Badge } from "@/lib/presentation/components/ui/badge"
import { CategoryFormDialog } from "@/lib/presentation/components/features/category-form-dialog"
import { useState } from "react"

export default function CategoriesPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // Fetch categories data
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories')
      return response.data
    },
    enabled: !!session,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete category')
    },
  })

  if (isPending || isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/login")
  }

  const categories = categoriesData?.categories || []

  const filteredCategories = categories.filter((category: any) => {
    if (filter === 'income') return category.type === 'INCOME'
    if (filter === 'expense') return category.type === 'EXPENSE'
    return true
  })

  const incomeCount = categories.filter((c: any) => c.type === 'INCOME').length
  const expenseCount = categories.filter((c: any) => c.type === 'EXPENSE').length

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
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your transaction categories</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CategoryFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CategoryFormDialog>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-2xl font-bold"
          >
            {categories.length}
          </motion.p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Income Categories</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-2xl font-bold text-green-600"
          >
            {incomeCount}
          </motion.p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Expense Categories</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-2xl font-bold text-red-600"
          >
            {expenseCount}
          </motion.p>
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
          variant={filter === 'income' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('income')}
        >
          Income
        </Button>
        <Button
          variant={filter === 'expense' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('expense')}
        >
          Expense
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <p className="text-muted-foreground mb-4">No categories yet</p>
          <CategoryFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Category
            </Button>
          </CategoryFormDialog>
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
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category: any, index: number) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={category.type === 'INCOME' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                    >
                      {category.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="text-sm text-muted-foreground">{category.color || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this category?')) {
                            deleteMutation.mutate(category.id)
                          }
                        }}
                        title="Delete category"
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

      {/* Edit category dialog */}
      <CategoryFormDialog
        category={editingCategory || undefined}
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null)
        }}
      >
        <div />
      </CategoryFormDialog>
    </motion.div>
  )
}
