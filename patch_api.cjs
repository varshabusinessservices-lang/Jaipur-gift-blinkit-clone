const fs = require('fs');
let code = fs.readFileSync('src/features/categories/services/categoryApi.ts', 'utf8');

const createFns = `
  async createParentCategory(formData: CategoryFormData): Promise<Category> {
    if (config.adminUseMockApi) return this.createCategory(formData);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(\`\${API_BASE}/admin/categories/parent\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create parent category');
    return data.data;
  },

  async createChildCategory(formData: CategoryFormData): Promise<Category> {
    if (config.adminUseMockApi) return this.createCategory(formData);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(\`\${API_BASE}/admin/categories/child\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create child category');
    return data.data;
  },

  async createSubChildCategory(formData: CategoryFormData): Promise<Category> {
    if (config.adminUseMockApi) return this.createCategory(formData);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(\`\${API_BASE}/admin/categories/sub-child\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create sub-child category');
    return data.data;
  },
`;

code = code.replace(/async updateCategory\(/, createFns + '\n  async updateCategory(');
fs.writeFileSync('src/features/categories/services/categoryApi.ts', code);
console.log('API updated');
