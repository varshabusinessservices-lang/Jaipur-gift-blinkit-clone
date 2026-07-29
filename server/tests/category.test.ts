import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from '../src/modules/categories/category.service';
import { 
  slugifyCategoryName, 
  calculateLevelAndPath, 
  isDepthAllowed, 
  isDescendant,
  buildCategoryTree 
} from '../src/modules/categories/category.utils';

describe('Category Utilities & Business Rules', () => {
  it('should format category names into clean slugs', () => {
    expect(slugifyCategoryName('Personalised Photo Frames & Gifts!'))
      .toBe('personalised-photo-frames-gifts');
    expect(slugifyCategoryName('  Jaipur   Craft Specials   '))
      .toBe('jaipur-craft-specials');
    expect(slugifyCategoryName('3D Crystal LED @ 90-Min Delivery'))
      .toBe('3d-crystal-led-90-min-delivery');
  });

  it('should calculate level and path correctly for nested categories', () => {
    const rootPath = calculateLevelAndPath(null, 'cat-1', null);
    expect(rootPath.level).toBe(1);
    expect(rootPath.path).toBe('cat-1');

    const level2Path = calculateLevelAndPath('cat-1', 'cat-2', { level: 1, path: 'cat-1' });
    expect(level2Path.level).toBe(2);
    expect(level2Path.path).toBe('cat-1/cat-2');

    const level3Path = calculateLevelAndPath('cat-2', 'cat-3', { level: 2, path: 'cat-1/cat-2' });
    expect(level3Path.level).toBe(3);
    expect(level3Path.path).toBe('cat-1/cat-2/cat-3');
  });

  it('should enforce MAX_CATEGORY_DEPTH = 6 constraint', () => {
    expect(isDepthAllowed(1, 1)).toBe(true);
    expect(isDepthAllowed(5, 1)).toBe(true);
    expect(isDepthAllowed(6, 1)).toBe(false);
    expect(isDepthAllowed(4, 3)).toBe(false); // 4 + 3 = 7 > 6
  });

  it('should detect circular parent relationships and self-parenting', () => {
    const flatList = [
      { id: 'cat-a', parentId: null },
      { id: 'cat-b', parentId: 'cat-a' },
      { id: 'cat-c', parentId: 'cat-b' },
    ];

    expect(isDescendant('cat-a', 'cat-a', flatList)).toBe(true); // Self
    expect(isDescendant('cat-a', 'cat-c', flatList)).toBe(true); // cat-c is descendant of cat-a
    expect(isDescendant('cat-c', 'cat-a', flatList)).toBe(false); // cat-a is ancestor of cat-c, not descendant
  });

  it('should construct recursive tree structure from flat category list', () => {
    const categories = [
      { id: '1', parentId: null, name: 'Root A', sortOrder: 2, status: 'ACTIVE' },
      { id: '2', parentId: null, name: 'Root B', sortOrder: 1, status: 'ACTIVE' },
      { id: '3', parentId: '1', name: 'Child A1', sortOrder: 1, status: 'ACTIVE' },
      { id: '4', parentId: '3', name: 'Subchild A1a', sortOrder: 1, status: 'ACTIVE' },
    ];

    const tree = buildCategoryTree(categories);
    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe('Root B'); // Sort order 1 comes first
    expect(tree[1].name).toBe('Root A'); // Sort order 2
    expect(tree[1].children).toHaveLength(1);
    expect(tree[1].children[0].name).toBe('Child A1');
    expect(tree[1].children[0].children).toHaveLength(1);
    expect(tree[1].children[0].children[0].name).toBe('Subchild A1a');
  });
});

describe('CategoryService CRUD Operations', () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
  });

  it('should list categories and return tree structure', async () => {
    const tree = await service.getCategoryTree();
    expect(Array.isArray(tree)).toBe(true);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree[0]).toHaveProperty('id');
    expect(tree[0]).toHaveProperty('children');
  });

  it('should create a new category and auto-generate slug', async () => {
    const newCategory = await service.createCategory({
      name: 'Custom Wooden Nameplates',
      shortDescription: 'Handcrafted teak wood brass nameplates.',
      isFeatured: true,
      status: 'ACTIVE',
    }, 'admin-user-id');

    expect(newCategory).toHaveProperty('id');
    expect(newCategory.name).toBe('Custom Wooden Nameplates');
    expect(newCategory.slug).toContain('custom-wooden-nameplates');
    expect(newCategory.level).toBe(1);
  });

  it('should block deletion if subcategories exist', async () => {
    // Attempting to delete 'cat-001' which has child 'cat-002'
    await expect(service.deleteCategory('cat-001', { mode: 'SINGLE' }, 'admin-id')).rejects.toThrow(/subcategories/i);
  });

  it('should allow deletion when category has no subcategories', async () => {
    // Delete leaf category 'cat-003'
    const result = await service.deleteCategory('cat-003', undefined, 'admin-id');
    expect(result.success).toBe(true);
  });
});
