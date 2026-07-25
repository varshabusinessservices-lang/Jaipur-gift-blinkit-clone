const fs = require('fs');

let protectedRoute = fs.readFileSync('src/components/common/ProtectedRoute.tsx', 'utf8');
if (!protectedRoute.includes('import React from')) {
    protectedRoute = `import React from 'react';\n` + protectedRoute;
    fs.writeFileSync('src/components/common/ProtectedRoute.tsx', protectedRoute);
}

let searchInput = fs.readFileSync('src/components/forms/SearchInput.tsx', 'utf8');
if (!searchInput.includes('className?: string')) {
    searchInput = searchInput.replace('interface SearchInputProps {', 'interface SearchInputProps {\n  className?: string;');
    fs.writeFileSync('src/components/forms/SearchInput.tsx', searchInput);
}

let loginPage = fs.readFileSync('src/features/auth/pages/LoginPage.tsx', 'utf8');
loginPage = loginPage.replace('const loginSchema = z.object({', 'const loginSchema = z.object({\n  email: z.string().email("Invalid email address"),\n  password: z.string().min(6, "Password must be at least 6 characters"),\n  rememberMe: z.boolean().default(false),\n});\n/*').replace('type LoginFormValues = z.infer<typeof loginSchema>;', '*/\ntype LoginFormValues = z.infer<typeof loginSchema>;');
// I'll just rewrite LoginPage
