const fs = require('fs');
let code = fs.readFileSync('server/src/modules/categories/category.types.ts', 'utf8');

const additionalFields = `
  categoryType?: 'PARENT' | 'CHILD' | 'SUB_CHILD';
  mobileImageFileId?: string | null;
  showInNavigation?: boolean;
  showInSearch?: boolean;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  imageAltText?: string | null;
  bannerAltText?: string | null;
  bgColour?: string | null;
  textColour?: string | null;
`;

code = code.replace(/mobileBannerFileId\?: string \| null;/, `mobileBannerFileId?: string | null;${additionalFields}`);
fs.writeFileSync('server/src/modules/categories/category.types.ts', code);
console.log('Types updated');
