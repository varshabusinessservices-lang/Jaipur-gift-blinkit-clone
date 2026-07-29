const fs = require('fs');
let code = fs.readFileSync('src/features/categories/hooks/useCategories.ts', 'utf8');

code = code.replace("const [defaultParentId,\n    categoryFormMode,\n    setCategoryFormMode, setDefaultParentId] = useState<string | null>(null);\n  const [categoryFormMode, setCategoryFormMode] = useState<'PARENT' | 'CHILD' | 'SUB_CHILD'>('PARENT');", 
"const [defaultParentId, setDefaultParentId] = useState<string | null>(null);\n  const [categoryFormMode, setCategoryFormMode] = useState<'PARENT' | 'CHILD' | 'SUB_CHILD'>('PARENT');");

fs.writeFileSync('src/features/categories/hooks/useCategories.ts', code);
console.log('Hook fixed');
