const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryTableView.tsx', 'utf8');

code = code.replace(/\{cat\.level < 3 && \(\n                          <button\n                            onClick=\{\(\) => onAddSubcategory\(cat\.id\)\}\n                            className="p-1\.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"\n                            title=\{cat\.level === 1 \? 'Add Child Category' : 'Add Sub-Child Category'\}\n                          >\n                            \n                          \)\}/g, 
  `{cat.level < 3 && (
                          <button
                            onClick={() => onAddSubcategory(cat.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={cat.level === 1 ? 'Add Child Category' : 'Add Sub-Child Category'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          )}`);

fs.writeFileSync('src/features/categories/components/CategoryTableView.tsx', code);
console.log('Table view fixed');
