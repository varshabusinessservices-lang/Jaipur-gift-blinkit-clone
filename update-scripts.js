const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = {
  ...pkg.scripts,
  "dev": "tsx server/src/server.ts",
  "dev:client": "vite --port=5173",
  "dev:server": "tsx server/src/server.ts",
  "build": "vite build && esbuild server/src/server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "build:client": "vite build",
  "build:server": "esbuild server/src/server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
  "start": "node dist/server.cjs",
  "typecheck": "tsc --noEmit",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "tsx prisma/seed.ts",
  "prisma:studio": "prisma studio"
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
