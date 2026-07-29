const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryTreeView.tsx', 'utf8');

code = code.replace(/<button\s*onClick=\{\(\) => onAddSubcategory\(node\.id\)\}\s*className="p-1\.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"\s*title="Add Subcategory"\s*>/g, 
  `{node.level < 3 && (
          <button
            onClick={() => onAddSubcategory(node.id)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center"
            title={node.level === 1 ? 'Add Child Category' : 'Add Sub-Child Category'}
          >
            <Plus className="w-4 h-4" /> <span className="ml-1 text-xs hidden lg:inline">{node.level === 1 ? 'Add Child' : 'Add Sub-Child'}</span>
          </button>
          )}`);

code = code.replace(/<Plus className="w-4 h-4" \/>\n\s*<\/button>/, ''); // remove old icon since we put it in the replacement above

fs.writeFileSync('src/features/categories/components/CategoryTreeView.tsx', code);
console.log('CategoryTreeView updated');
