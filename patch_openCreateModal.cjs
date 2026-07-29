const fs = require('fs');
let code = fs.readFileSync('src/features/categories/hooks/useCategories.ts', 'utf8');

code = code.replace(/const openCreateModal = \(parentId\?: string \| null\) => \{/g, 
`const openCreateModal = (parentId?: string | null, mode?: 'PARENT' | 'CHILD' | 'SUB_CHILD') => {
    if (mode) setCategoryFormMode(mode);
    else setCategoryFormMode(parentId ? 'CHILD' : 'PARENT');`);

fs.writeFileSync('src/features/categories/hooks/useCategories.ts', code);
console.log('Hook updated with openCreateModal');
