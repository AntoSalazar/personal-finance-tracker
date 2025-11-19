import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category } from '@/lib/domain/entities/Category';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  async getByType(type: string): Promise<Category[]> {
    return await this.categoryRepository.findByType(type);
  }

  async getById(id: string): Promise<Category | null> {
    return await this.categoryRepository.findById(id);
  }
}
