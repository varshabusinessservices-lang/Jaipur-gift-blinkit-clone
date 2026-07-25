# Runtime Error 185 Fix Report

## 1. Exact root cause
The infinite loop was caused by returning a new object from the `useUIStore` Zustand selector in `AdminLayout.tsx` combined with including a function from that object in a `useEffect` dependency array.

## 2. Files changed
- `src/layouts/AdminLayout.tsx`
- `src/app/router/index.tsx`
- `src/components/common/RouteErrorBoundary.tsx` (created)

## 3. Why the loop occurred
In `AdminLayout.tsx`, the UI store was consumed like this:
```typescript
const { sidebarOpen, setSidebarOpen, closeSidebar } = useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  setSidebarOpen: state.toggleSidebar,
  closeSidebar: state.closeSidebar,
}));
```
Because this selector returned a new object literal on every call, `useUIStore` perceived a state change on every render, returning a new object reference. The `useEffect` intended to close the sidebar on route changes included `closeSidebar` in its dependency array:
```typescript
useEffect(() => {
  closeSidebar();
}, [location.pathname, closeSidebar]);
```
Since `closeSidebar` was a new reference on every render, the effect ran on every render. The effect called `closeSidebar()`, which invoked `set({ sidebarOpen: false })` in Zustand. This created a new state object in the store, triggering another re-render of `AdminLayout`, which produced yet another new `closeSidebar` reference, causing the `useEffect` to fire infinitely.

## 4. Fix applied
Separated the Zustand selector calls into individual primitive/stable references in `AdminLayout.tsx` to prevent returning a new object on every render:
```typescript
const sidebarOpen = useUIStore((state) => state.sidebarOpen);
const setSidebarOpen = useUIStore((state) => state.toggleSidebar);
const closeSidebar = useUIStore((state) => state.closeSidebar);

// Also fixed useAuthStore:
const logout = useAuthStore((state) => state.logout);
const user = useAuthStore((state) => state.user);
```
This ensures the selectors return stable references, preventing the infinite loop.

## 5. Error-boundary changes
Created `src/components/common/RouteErrorBoundary.tsx` with a user-friendly UI (displaying "Something went wrong", a retry button, a dashboard link, and developer-only error details). Attached it as the `errorElement` for all main routes in `src/app/router/index.tsx`.

## 6. Verification commands
- `npm run typecheck`
- `npm run build`

## 7. Build result
- `npm run typecheck` completed successfully with 0 errors.
- `npm run build` successfully bundled both the Vite client and the Express backend without syntax or type errors.

## 8. Runtime verification result
- The `/admin/login` page loads successfully and mock login works correctly.
- The `/admin/dashboard` page now loads instantly without throwing the `Minified React error #185` (Maximum update depth exceeded).
- Navigation between routes does not cause crashes.
- Refreshing the dashboard works flawlessly.
- Mock API status displays properly without repeated re-fetching.
