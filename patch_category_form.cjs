const fs = require('fs');
let code = fs.readFileSync('src/features/categories/components/CategoryFormModal.tsx', 'utf8');

code = code.replace("mobileBannerUrl: null,", 
`mobileBannerUrl: null,
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
console.log('CategoryFormModal updated');
