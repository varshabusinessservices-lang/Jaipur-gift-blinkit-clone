const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

code = code.replace("mobileBannerUrl: editingCategory.mobileBannerUrl || null,", 
`mobileBannerUrl: editingCategory.mobileBannerUrl || null,
        mobileImageFileId: (editingCategory as any).mobileImageFileId || null,
        mobileImageUrl: (editingCategory as any).mobileImageUrl || null,
        showInNavigation: (editingCategory as any).showInNavigation ?? true,
        showInSearch: (editingCategory as any).showInSearch ?? true,
        showOnDesktop: (editingCategory as any).showOnDesktop ?? true,
        showOnMobile: (editingCategory as any).showOnMobile ?? true,
        imageAltText: (editingCategory as any).imageAltText || '',
        bannerAltText: (editingCategory as any).bannerAltText || '',
        bgColour: (editingCategory as any).bgColour || '',
        textColour: (editingCategory as any).textColour || '',`);

code = code.replace("parentId: defaultParentId || null,", 
`parentId: defaultParentId || null,
        mobileImageFileId: null,
        mobileImageUrl: null,
        showInNavigation: true,
        showInSearch: true,
        showOnDesktop: true,
        showOnMobile: true,
        imageAltText: '',
        bannerAltText: '',
        bgColour: '',
        textColour: '',`);

fs.writeFileSync('src/features/categories/components/CategoryFormModal.tsx', code);
console.log('CategoryFormModal editing updated');
