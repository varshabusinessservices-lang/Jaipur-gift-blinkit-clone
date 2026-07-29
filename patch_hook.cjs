const fs = require('fs');
let code = fs.readFileSync('src/features/categories/hooks/useCategories.ts', 'utf8');

code = code.replace("const [defaultParentId, setDefaultParentId] = useState<string | null>(null);", 
`const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [categoryFormMode, setCategoryFormMode] = useState<'PARENT' | 'CHILD' | 'SUB_CHILD'>('PARENT');`);

code = code.replace("defaultParentId,", "defaultParentId,\n    categoryFormMode,\n    setCategoryFormMode,");
code = code.replace("setDefaultParentId,", "setDefaultParentId,");

fs.writeFileSync('src/features/categories/hooks/useCategories.ts', code);
console.log('Hook updated');
