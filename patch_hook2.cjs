const fs = require('fs');
let code = fs.readFileSync('src/features/categories/hooks/useCategories.ts', 'utf8');

code = code.replace(/await categoryApi.createCategory\(data\);/, 
`if (categoryFormMode === 'PARENT') {
        await categoryApi.createParentCategory(data);
      } else if (categoryFormMode === 'CHILD') {
        await categoryApi.createChildCategory(data);
      } else if (categoryFormMode === 'SUB_CHILD') {
        await categoryApi.createSubChildCategory(data);
      } else {
        await categoryApi.createCategory(data); // fallback
      }`);

fs.writeFileSync('src/features/categories/hooks/useCategories.ts', code);
console.log('Hook handleCreate updated');
