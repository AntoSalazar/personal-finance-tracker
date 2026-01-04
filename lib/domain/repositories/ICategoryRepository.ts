import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/Category';

export interface ICategoryRepository {
  findAll(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  findByType(type: string, userId: string): Promise<Category[]>;
  findByParentId(parentId: string, userId: string): Promise<Category[]>;
  create(data: CreateCategoryDTO, userId: string): Promise<Category>;
  update(id: string, data: UpdateCategoryDTO, userId: string): Promise<Category>;
  delete(id: string, userId: string): Promise<void>;
}
