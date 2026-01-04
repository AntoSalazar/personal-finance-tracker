import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // Validate category exists and belongs to user
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error('Category not found or unauthorized');
    }

    // The repository will check for children and throw an error if any exist
    await this.categoryRepository.delete(id, userId);
  }
}
