const fs = require('fs');
let code = fs.readFileSync('server/src/modules/categories/category.repository.ts', 'utf8');

const updateFields = `
          ...(data.categoryType !== undefined ? { categoryType: data.categoryType } : {}),
          ...(data.mobileImageFileId !== undefined ? { mobileImageFileId: data.mobileImageFileId } : {}),
          ...(data.showInNavigation !== undefined ? { showInNavigation: data.showInNavigation } : {}),
          ...(data.showInSearch !== undefined ? { showInSearch: data.showInSearch } : {}),
          ...(data.showOnDesktop !== undefined ? { showOnDesktop: data.showOnDesktop } : {}),
          ...(data.showOnMobile !== undefined ? { showOnMobile: data.showOnMobile } : {}),
          ...(data.imageAltText !== undefined ? { imageAltText: data.imageAltText } : {}),
          ...(data.bannerAltText !== undefined ? { bannerAltText: data.bannerAltText } : {}),
          ...(data.bgColour !== undefined ? { bgColour: data.bgColour } : {}),
          ...(data.textColour !== undefined ? { textColour: data.textColour } : {}),
`;
code = code.replace(/...\(data.mobileBannerFileId \!== undefined \? \{ mobileBannerFileId: data.mobileBannerFileId \} : \{\}\),/, 
`...(data.mobileBannerFileId !== undefined ? { mobileBannerFileId: data.mobileBannerFileId } : {}),${updateFields}`);
fs.writeFileSync('server/src/modules/categories/category.repository.ts', code);
console.log('Repo updated');
