const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

const mobileImageCode = `
              {/* Category Mobile Image */}
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Mobile Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {formData.mobileImageUrl ? (
                      <img src={formData.mobileImageUrl} alt="Category Mobile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="cat-mobile-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'CATEGORY_MOBILE_IMAGE')}
                    />
                    <label
                      htmlFor="cat-mobile-image-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingRole === 'CATEGORY_MOBILE_IMAGE' ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className="text-[11px] text-slate-500">Recommended: Portrait PNG / WebP, 750x900px.</p>
                  </div>
                </div>
              </div>
`;

code = code.replace(/\{\/\* Category Icon \*\/\}/, mobileImageCode + '\n              {/* Category Icon */}');

fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal media tab updated');
