import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createErrorResponse } from '@/lib/infrastructure/api/auth-middleware';
import { PrismaCategoryRepository } from '@/lib/infrastructure/database/repositories';
import { GetCategoriesUseCase } from '@/lib/application/use-cases/categories/GetCategoriesUseCase';
import { CreateCategoryUseCase } from '@/lib/application/use-cases/categories/CreateCategoryUseCase';
import { CategoryType } from '@/lib/domain/entities/Category';
import { z, ZodError } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  type: z.nativeEnum(CategoryType),
  parentId: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
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
 *     CreateCategoryInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [EXPENSE, INCOME]
 *         description:
 *           type: string
 *         color:
 *           type: string
 *         icon:
 *           type: string
 *         parentId:
 *           type: string
 */

// GET /api/categories - Get all categories
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of categories, optionally filtered by type.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EXPENSE, INCOME]
 *         description: Filter by category type
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new category
 *     description: Create a new category for transactions.
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryInput'
 *     responses:
 *       201:
 *         description: Category successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const repository = new PrismaCategoryRepository();
    const useCase = new GetCategoriesUseCase(repository);

    let categories;
    if (type) {
      categories = await useCase.getByType(type, userId);
    } else {
      categories = await useCase.execute(userId);
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return createErrorResponse(error);
  }
});

// POST /api/categories - Create new category
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    const repository = new PrismaCategoryRepository();
    const useCase = new CreateCategoryUseCase(repository);

    const category = await useCase.execute(validatedData, userId);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/categories error:', error);
    return createErrorResponse(error);
  }
});
