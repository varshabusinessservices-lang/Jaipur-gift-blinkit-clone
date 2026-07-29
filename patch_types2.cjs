const fs = require('fs');
let code = fs.readFileSync('server/src/modules/categories/category.types.ts', 'utf8');

if(!code.includes('level?: number;')) {
  code = code.replace(/categoryType\?: 'PARENT' \| 'CHILD' \| 'SUB_CHILD';/, `categoryType?: 'PARENT' | 'CHILD' | 'SUB_CHILD';\n  level?: number;`);
  fs.writeFileSync('server/src/modules/categories/category.types.ts', code);
  console.log('Types updated again');
}
