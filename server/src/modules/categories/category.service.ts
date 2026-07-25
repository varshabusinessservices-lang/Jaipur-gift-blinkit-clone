import { CategoryRepository } from './category.repository';
import { 
  CategoryFilterQuery, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryReorderItem 
} from './category.types';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async getCategories(filters: CategoryFilterQuery) {
    return this.repository.findCategories(filters);
  }

  async getCategoryTree() {
    return this.repository.findCategoryTree();
  }

  async getCategoryById(id: string) {
    const category = await this.repository.findCategoryById(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto, adminId?: string) {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Category name is required.');
    }

    return this.repository.createCategory(dto, adminId);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, adminId?: string) {
    return this.repository.updateCategory(id, dto, adminId);
  }

  async updateCategoryStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED', adminId?: string) {
    return this.repository.updateCategoryStatus(id, status, adminId);
  }

  async reorderCategories(items: CategoryReorderItem[], adminId?: string) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Reorder items array is required.');
    }
    return this.repository.reorderCategories(items, adminId);
  }

  async deleteCategory(id: string, adminId?: string) {
    return this.repository.deleteCategory(id, adminId);
  }

  async restoreCategory(id: string, adminId?: string) {
    return this.repository.restoreCategory(id, adminId);
  }
}
