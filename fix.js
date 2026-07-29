const fs = require('fs');
let content = fs.readFileSync('server/src/modules/wallet/wallet.admin.controller.ts', 'utf-8');
content = content.replace("  }\n}\n  static async getSlabs", "  }\n  static async getSlabs");
content = content.replace("  }\r\n}\r\n  static async getSlabs", "  }\r\n  static async getSlabs");
fs.writeFileSync('server/src/modules/wallet/wallet.admin.controller.ts', content);
