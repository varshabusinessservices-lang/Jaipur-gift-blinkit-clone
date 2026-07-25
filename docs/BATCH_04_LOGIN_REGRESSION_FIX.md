# Batch 4 Login Regression Analysis & Resolution Report

## Executive Summary
After Batch 4, a login regression occurred where attempting to sign in on the admin login screen resulted in an `"Invalid credentials"` error despite using the displayed credentials. This report details the exact root cause, architectural fix, network behavior verification, and validation results.

---

## Exact Root Cause
1. **Direct API Call Bypassing Mock Mode**:
   `src/features/auth/pages/LoginPage.tsx` directly invoked `apiClient.post("/auth/login", data)` on form submit without checking whether mock mode (`VITE_ADMIN_USE_MOCK_API`) was enabled or using a unified `authService`.
2. **Credential & UI Mismatch**:
   `LoginPage.tsx` displayed static text proposing `Password: password123`, while mock mode and server expectations required `Admin@123`.
3. **Environment Variable Comparison**:
   `src/config/env.ts` used strict equality `import.meta.env.VITE_ADMIN_USE_MOCK_API === "true"` rather than robust string normalization (`String(...).toLowerCase() === 'true'`).

---

## Files Changed

1. **`src/config/env.ts`**:
   - Fixed `useMockApi` parsing using `String(import.meta.env.VITE_ADMIN_USE_MOCK_API).toLowerCase() === 'true'`.
   - Updated default `apiBaseUrl` to `http://localhost:3000/api/v1`.

2. **`src/services/authService.ts`** *(New)*:
   - Created `AuthService` interface with `mockAuthService` and `apiAuthService` implementations.
   - Evaluated `authService = useMockApi ? mockAuthService : apiAuthService` stably outside React render loops.
   - Implemented `mockAuthService.login` to validate `admin@example.com` / `Admin@123` with zero network calls to `/api/v1/auth/login`.
   - Implemented `apiAuthService.login` to invoke `apiClient.post("/auth/login")` and surface backend-unavailable errors if the server is offline.

3. **`src/features/auth/services/auth.service.ts`** *(New)*:
   - Re-exported `authService` for module compatibility.

4. **`src/features/auth/pages/LoginPage.tsx`**:
   - Replaced direct `apiClient` call with `authService.login`.
   - Restricted the Development Credentials panel to show **only** when `config.useMockApi` is `true`.
   - Updated displayed credentials to `Email: admin@example.com` and `Password: Admin@123`.
   - Added a **"Fill development credentials"** button that populates form fields without auto-submitting.
   - Added auto-clearing of auth error banners whenever the user modifies email or password fields.

5. **`src/features/auth/pages/ForgotPasswordPage.tsx` & `ResetPasswordPage.tsx`**:
   - Refactored to use `authService` methods.

6. **`prisma/seed.ts`**:
   - Updated seed script to hash `Admin@123` for consistent development environment credentials.

---

## Credentials Accepted in Mock Mode
- **Email:** `admin@example.com`
- **Password:** `Admin@123`

---

## Network Verification
- **Mock Mode (`VITE_ADMIN_USE_MOCK_API=true`)**:
  Clicking "Sign in" delegates directly to `mockAuthService.login`. Exactly **0 requests** are sent to `/api/v1/auth/login`. Session is persisted locally via `useAuthStore` across page refreshes.
- **Real Mode (`VITE_ADMIN_USE_MOCK_API=false`)**:
  Development credential box is hidden. Form submits send exactly **1 request** to `/api/v1/auth/login`.

---

## Typecheck and Build Results
- `npm run lint` (`tsc --noEmit`): **PASSED (0 errors)**
- `compile_applet`: **PASSED (0 errors)**
