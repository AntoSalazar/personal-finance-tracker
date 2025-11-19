import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO } from '@/lib/domain/entities/Category';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: CreateCategoryDTO): Promise<Category> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (!data.type) {
      throw new Error('Category type is required');
    }

    // Validate parent category exists if parentId is provided
    if (data.parentId) {
      const parent = await this.categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    return await this.categoryRepository.create(data);
  }
}
