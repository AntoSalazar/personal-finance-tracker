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

// GET /api/categories/[id] - Get category by ID
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
