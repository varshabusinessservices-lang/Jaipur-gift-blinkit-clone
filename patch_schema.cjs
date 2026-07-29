const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('enum CategoryType')) {
  schema = schema.replace('enum CategoryStatus {', `enum CategoryType {\n  PARENT\n  CHILD\n  SUB_CHILD\n}\n\nenum CategoryStatus {`);
}

if (!schema.includes('categoryType')) {
  schema = schema.replace('  level               Int            @default(1)', 
  `  level               Int            @default(1)
  categoryType        CategoryType   @default(PARENT)
  mobileImageFileId   String?        @db.Char(36)
  showInNavigation    Boolean        @default(true)
  showInSearch        Boolean        @default(true)
  showOnDesktop       Boolean        @default(true)
  showOnMobile        Boolean        @default(true)
  imageAltText        String?        @db.Text
  bannerAltText       String?        @db.Text
  bgColour            String?        @db.VarChar(50)
  textColour          String?        @db.VarChar(50)`);
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('Schema updated.');
} else {
  console.log('Schema already updated.');
}
