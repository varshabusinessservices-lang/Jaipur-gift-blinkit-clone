const fs = require('fs');
let code = fs.readFileSync('src/features/categories/pages/CategoryListPage.tsx', 'utf8');

code = code.replace("categoryFormMode={categoryFormMode}", "categoryFormMode={categoryFormMode as 'PARENT' | 'CHILD' | 'SUB_CHILD'}");
code = code.replace("openCreateModal(parentId)", "openCreateModal(parentId, undefined)");

fs.writeFileSync('src/features/categories/pages/CategoryListPage.tsx', code);
console.log('List page fixed');
