import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category, UpdateCategoryDTO } from '@/lib/domain/entities/Category';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string, data: UpdateCategoryDTO, userId: string): Promise<Category> {
    // Validate category exists and belongs to user
    const existingCategory = await this.categoryRepository.findById(id, userId);
    if (!existingCategory) {
      throw new Error('Category not found or unauthorized');
    }

    // Validate parent category exists if parentId is provided
    if (data.parentId) {
      // Prevent circular references
      if (data.parentId === id) {
        throw new Error('Category cannot be its own parent');
      }

      const parent = await this.categoryRepository.findById(data.parentId, userId);
      if (!parent) {
        throw new Error('Parent category not found');
      }

      // Ensure parent is of the same type
      if (parent.type !== existingCategory.type) {
        throw new Error('Parent category must be of the same type');
      }
    }

    return await this.categoryRepository.update(id, data, userId);
  }
}
