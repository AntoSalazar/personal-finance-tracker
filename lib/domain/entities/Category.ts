/**
 * Category Entity
 * Represents a category for organizing transactions
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: CategoryType;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CategoryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: CategoryType;
  parentId?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  type?: CategoryType;
  parentId?: string;
}
