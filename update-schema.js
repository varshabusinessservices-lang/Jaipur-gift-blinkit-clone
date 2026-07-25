const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const roleEnum = `
enum AdminRole {
  SUPER_ADMIN
  ADMIN
  STORE_MANAGER
  PRODUCTION_STAFF
  DELIVERY_BOY
}
`;

schema = schema.replace('model AdminUser {', roleEnum + '\nmodel AdminUser {\n  role                AdminRole @default(ADMIN)');
fs.writeFileSync('prisma/schema.prisma', schema);
