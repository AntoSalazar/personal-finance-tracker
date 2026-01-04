import { ICategoryRepository } from '@/lib/domain/repositories/ICategoryRepository';
import { Category } from '@/lib/domain/entities/Category';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(userId: string): Promise<Category[]> {
    return await this.categoryRepository.findAll(userId);
  }

  async getByType(type: string, userId: string): Promise<Category[]> {
    return await this.categoryRepository.findByType(type, userId);
  }

  async getById(id: string, userId: string): Promise<Category | null> {
    return await this.categoryRepository.findById(id, userId);
  }
}
