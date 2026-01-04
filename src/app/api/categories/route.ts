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

// GET /api/categories - Get all categories
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
