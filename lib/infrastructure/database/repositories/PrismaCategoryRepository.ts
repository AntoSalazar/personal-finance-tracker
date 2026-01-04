import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/lib/domain/entities/Category';
import prisma from '../prisma-client';

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id, userId },
      include: {
        parent: true,
        children: true,
      },
    });
    return category as any;
  }

  async findByType(type: string, userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: {
        type: type as any,
        userId
      },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async findByParentId(parentId: string, userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: {
        parentId,
        userId
      },
      include: {
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async create(data: CreateCategoryDTO, userId: string): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
    return category as any;
  }

  async update(id: string, data: UpdateCategoryDTO, userId: string): Promise<Category> {
    // First verify ownership
    const existing = await prisma.category.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Category not found or unauthorized');
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
    return category as any;
  }

  async delete(id: string, userId: string): Promise<void> {
    // Check if category exists and belongs to user
    const category = await prisma.category.findUnique({
      where: { id, userId },
      include: { children: true },
    });

    if (!category) {
      throw new Error('Category not found or unauthorized');
    }

    if (category.children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}
