import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaCategoryRepository } from '@/lib/infrastructure/database/repositories';
import { UpdateCategoryUseCase } from '@/lib/application/use-cases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '@/lib/application/use-cases/categories/DeleteCategoryUseCase';
import { GetCategoriesUseCase } from '@/lib/application/use-cases/categories/GetCategoriesUseCase';
import { CategoryType } from '@/lib/domain/entities/Category';
import { z, ZodError } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  type: z.nativeEnum(CategoryType).optional(),
  parentId: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         type:
 *           type: string
 *           enum: [EXPENSE, INCOME]
 *         parentId:
 *           type: string
 */

// GET /api/categories/[id] - Get category by ID
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     description: Retrieve details of a specific category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a category
 *     description: Update details of an existing category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryInput'
 *     responses:
 *       200:
 *         description: Category successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a category
 *     description: Permanently delete a category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category successfully deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaCategoryRepository();
    const useCase = new GetCategoriesUseCase(repository);

    const category = await useCase.getById(id, userId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return createErrorResponse(error);
  }
});

// PUT /api/categories/[id] - Update category
export const PUT = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    const repository = new PrismaCategoryRepository();
    const useCase = new UpdateCategoryUseCase(repository);

    const category = await useCase.execute(id, validatedData, userId);

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/categories/[id] error:', error);
    return createErrorResponse(error);
  }
});

// DELETE /api/categories/[id] - Delete category
export const DELETE = withAuth(async (req: NextRequest, userId: string, context?: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context!.params;
    const repository = new PrismaCategoryRepository();
    const useCase = new DeleteCategoryUseCase(repository);

    await useCase.execute(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return createErrorResponse(error);
  }
});
