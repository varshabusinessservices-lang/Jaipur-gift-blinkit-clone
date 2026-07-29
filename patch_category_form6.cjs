const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

code = code.replace(/defaultParentId\?: string \| null;/, "defaultParentId?: string | null;\n  categoryFormMode?: 'PARENT' | 'CHILD' | 'SUB_CHILD';");
code = code.replace(/defaultParentId,/, "defaultParentId,\n  categoryFormMode = 'PARENT',");

fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal categoryFormMode added');
