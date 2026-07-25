const fs = require('fs');

let layout = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');

// Add Profile Dropdown state and logic
const headerStart = `<header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">`;

const profileArea = `
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-full transition-all relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="relative">
            <button className="flex items-center gap-3 border-l border-slate-200 pl-4 sm:pl-6 text-left group">
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{user?.name}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{user?.role}</div>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-600 font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-slate-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
               <NavLink to="/admin/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Your Profile</NavLink>
               <button onClick={async () => {
                 try {
                   const { apiClient } = await import('../../lib/axios');
                   const { useAuthStore } = await import('../../store/authStore');
                   const token = useAuthStore.getState().refreshToken;
                   if (token) await apiClient.post('/auth/logout', { refreshToken: token });
                 } catch (e) {}
                 logout();
                 window.location.href = '/admin/login';
               }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
            </div>
          </div>
        </div>
`;

// It's a bit hard to replace complex JSX strings accurately with a simple replace.
// Let's create an edit script for the entire header section.
