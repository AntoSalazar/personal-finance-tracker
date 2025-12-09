import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    // Validate category exists
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // The repository will check for children and throw an error if any exist
    await this.categoryRepository.delete(id);
  }
}
