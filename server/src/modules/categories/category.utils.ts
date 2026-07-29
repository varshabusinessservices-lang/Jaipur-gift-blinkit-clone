import { env } from '../../config/env';
import { CategoryTreeNode } from './category.types';

export const MAX_CATEGORY_DEPTH = parseInt(process.env.CATEGORY_MAX_DEPTH || '6', 10);

/**
 * Resolves media URL to a clean path or full HTTPS URL.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('blob:')) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('//')) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return cleanPath.replace(/\/+/g, '/');
}

/**
 * Converts a category name to a clean, URL-friendly slug.
 */
export function slugifyCategoryName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and hyphen
    .replace(/[\s_]+/g, '-')     // Replace spaces/underscores with hyphen
    .replace(/-+/g, '-')         // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');    // Trim leading/trailing hyphens
}

/**
 * Calculates new level and path string for a category based on its parent.
 */
export function calculateLevelAndPath(
  parentId: string | null,
  categoryId: string,
  parentCategory?: { level: number; path: string | null } | null
): { level: number; path: string } {
  if (!parentId || !parentCategory) {
    return {
      level: 1,
      path: categoryId,
    };
  }

  const newLevel = parentCategory.level + 1;
  const parentPath = parentCategory.path || parentId;
  const newPath = `${parentPath}/${categoryId}`;

  return {
    level: newLevel,
    path: newPath,
  };
}

/**
 * Verifies that placing a category under newParent does not exceed max allowed depth.
 */
export function isDepthAllowed(
  parentLevel: number,
  maxSubtreeDepth: number = 1
): boolean {
  return parentLevel + maxSubtreeDepth <= MAX_CATEGORY_DEPTH;
}

/**
 * Constructs a recursive tree structure from a flat array of category records.
 */
export function buildCategoryTree(categories: any[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // Initialize map items
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      productCount: cat._count?.products || 0,
      activeChildCount: 0,
    });
  });

  // Link children to parents
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (!node) return;

    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parentNode = categoryMap.get(cat.parentId)!;
      parentNode.children.push(node);
      if (cat.status === 'ACTIVE' && !cat.deletedAt) {
        parentNode.activeChildCount = (parentNode.activeChildCount || 0) + 1;
      }
    } else {
      roots.push(node);
    }
  });

  // Sort nodes at each level by sortOrder then name
  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
}

/**
 * Checks if candidateParentId is self or an existing child/descendant of targetCategoryId.
 */
export function isDescendant(
  targetCategoryId: string,
  candidateParentId: string | null,
  allCategories: Array<{ id: string; parentId: string | null }>
): boolean {
  if (!candidateParentId) return false;
  if (candidateParentId === targetCategoryId) return true;

  let currentId: string | null = candidateParentId;
  const parentLookup = new Map<string, string | null>(
    allCategories.map((c) => [c.id, c.parentId])
  );

  const visited = new Set<string>();

  while (currentId) {
    if (currentId === targetCategoryId) return true;
    if (visited.has(currentId)) break; // Cycle prevention
    visited.add(currentId);
    currentId = parentLookup.get(currentId) || null;
  }

  return false;
}
