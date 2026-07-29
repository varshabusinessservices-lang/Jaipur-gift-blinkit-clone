const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryTableView.tsx', 'utf8');

code = code.replace(/<button\s*onClick=\{\(\) => onAddSubcategory\(cat\.id\)\}\s*className="p-1\.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"\s*title="Add Subcategory"\s*>/g, 
  `{cat.level < 3 && (
                          <button
                            onClick={() => onAddSubcategory(cat.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={cat.level === 1 ? 'Add Child Category' : 'Add Sub-Child Category'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          )}`);

code = code.replace(/<Plus className="w-4 h-4" \/>\n\s*<\/button>/, ''); // remove old icon since we put it in the replacement above

fs.writeFileSync('src/features/categories/components/CategoryTableView.tsx', code);
console.log('CategoryTableView updated');
