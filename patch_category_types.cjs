const fs = require('fs');
let code = fs.readFileSync('src/features/categories/types/category.ts', 'utf8');

code = code.replace("mobileBannerUrl: string | null;", 
`mobileBannerUrl: string | null;
  categoryType?: 'PARENT' | 'CHILD' | 'SUB_CHILD';
  mobileImageFileId?: string | null;
  mobileImageUrl?: string | null;
  showInNavigation?: boolean;
  showInSearch?: boolean;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  imageAltText?: string | null;
  bannerAltText?: string | null;
  bgColour?: string | null;
  textColour?: string | null;`);

fs.writeFileSync('src/features/categories/types/category.ts', code);
console.log('Frontend types updated');
