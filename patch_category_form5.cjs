const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

const parentSelect = `
              {/* Manual Parent Category Selection */}
              {categoryFormMode !== 'PARENT' && (
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    Select {categoryFormMode === 'CHILD' ? 'Parent' : 'Child'} Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>-- Select Category --</option>
                    {flatCategoriesList
                      .filter(c => c.level === (categoryFormMode === 'CHILD' ? 1 : 2))
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
`;

code = code.replace(/<div className="space-y-4">/, '<div className="space-y-4">\n' + parentSelect);
fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal parent select added');
