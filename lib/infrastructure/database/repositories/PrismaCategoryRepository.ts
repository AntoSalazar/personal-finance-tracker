import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/lib/domain/entities/Category';
import prisma from '../prisma-client';

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
    return category as any;
  }

  async findByType(type: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { type: type as any },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async findByParentId(parentId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { parentId },
      include: {
        children: true,
      },
      orderBy: { name: 'asc' },
    });
    return categories as any;
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const category = await prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
    return category as any;
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
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

  async delete(id: string): Promise<void> {
    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (category && category.children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}
