const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

code = code.replace(/if \(!formData\.name\.trim\(\)\) \{/, 
`if (categoryFormMode !== 'PARENT' && !formData.parentId) {
      setErrorMessage('Parent Category selection is required.');
      setActiveTab('basic');
      return;
    }
    if (!formData.name.trim()) {`);

fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal validate parentId');
