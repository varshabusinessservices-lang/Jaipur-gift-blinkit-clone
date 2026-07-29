const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

code = code.replace(/} else if \(role === 'SEO_IMAGE'\) {/, 
`} else if (role === 'CATEGORY_MOBILE_IMAGE') {
        setFormData(prev => ({ ...prev, mobileImageFileId: res.fileAssetId, mobileImageUrl: res.url }));
      } else if (role === 'SEO_IMAGE') {`);

fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal handleFileUpload updated');
