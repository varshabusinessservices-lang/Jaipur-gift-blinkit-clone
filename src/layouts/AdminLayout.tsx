import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ApiStatus } from "../components/common/ApiStatus";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { cn } from "../lib/utils";
import { 
  LayoutDashboard, ShoppingCart, Settings, Users, LogOut, 
  Menu, X, Search, Bell, Package, Tag, Truck, RefreshCcw, 
  Gift, Layers, Percent, FileText, Image as ImageIcon,
  UserCheck, DollarSign, Building2, ShieldCheck, Palette, LayoutTemplate
} from "lucide-react";
import { useEffect } from "react";
import { config } from "../config/env";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Production", href: "/admin/production", icon: Package },
      { name: "Customer Uploads", href: "/admin/customer-uploads", icon: ImageIcon },
      { name: "Dispatch Management", href: "/admin/dispatch", icon: Truck },
      { name: "Return & Replacement", href: "/admin/returns", icon: RefreshCcw },
    ]
  },
  {
    title: "Catalog",
    items: [
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Brands", href: "/admin/brands", icon: Tag },
      { name: "Tax Rates", href: "/admin/tax-rates", icon: Percent },
      { name: "Product Attributes", href: "/admin/product-attributes", icon: FileText },
      { name: "Product Add-ons", href: "/admin/product-addons", icon: Gift },
      { name: "Add-on Groups", href: "/admin/addon-groups", icon: Layers },
      { name: "Products", href: "/admin/products", icon: Gift },
      { name: "Personalisation Forms", href: "/admin/personalisation-forms", icon: ImageIcon },
    ]
  },
  {
    title: "People",
    items: [
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Delivery Boys", href: "/admin/delivery-boys", icon: UserCheck },
    ]
  },
  {
    title: "Marketing",
    items: [
      { name: "Banners", href: "/admin/banners", icon: ImageIcon },
      { name: "Featured Sections", href: "/admin/featured-sections", icon: Layers },
      { name: "Coupons", href: "/admin/coupons", icon: Percent },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
    ]
  },
  {
    title: "Delivery",
    items: [
      { name: "Delivery Zones", href: "/admin/delivery-zones", icon: Truck },
    ]
  },
  {
    title: "Financial Management",
    items: [
      { name: "Wallet", href: "/admin/wallet", icon: DollarSign },
      { name: "Rewards", href: "/admin/rewards", icon: Gift },
      { name: "Referrals", href: "/admin/referrals", icon: Users },
    ]
  },
  {
    title: "Analytics",
    items: [
      { name: "Finance & BI", href: "/admin/finance", icon: DollarSign },
      { name: "Enterprise Stores", href: "/admin/enterprise", icon: Building2 },
      { name: "Production Readiness", href: "/admin/production", icon: ShieldCheck },
      { name: "Reports", href: "/admin/reports", icon: FileText },
    ]
  },
  {
    title: "Appearance",
    items: [
      { name: "Theme Dashboard", href: "/admin/theme/dashboard", icon: LayoutDashboard },
      { name: "Global Styles", href: "/admin/theme/global", icon: Palette },
      { name: "Home Page Builder", href: "/admin/theme/home", icon: LayoutTemplate },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings/system", icon: Settings },
    ]
  }
];

export function AdminLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.toggleSidebar);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 flex-shrink-0 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col h-full overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Gift className="text-white h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight uppercase tracking-wider truncate">
              {config.appName.split(" ")[0]} Admin
            </span>
            <span className="text-slate-400 text-[10px] uppercase font-medium">Admin Panel</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden ml-auto text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-6">
          {navigation.map((group) => (
            <section key={group.title}>
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )
                    }
                  >
                    <item.icon
                      className="h-[18px] w-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>
        
        <div className="mt-auto p-4 border-t border-slate-800">
          <button
              onClick={() => {
                  logout();
                  window.location.href = "/admin/login";
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-md"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={setSidebarOpen}
              className="text-slate-500 hover:text-slate-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="text-xs hidden sm:flex items-center gap-2 text-slate-400 font-medium">
               <span className="hover:text-slate-600 cursor-pointer">Admin</span>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
               <span className="text-slate-900 capitalize">{location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</span>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <ApiStatus />
            <div className="relative">
              <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-3 border-l border-slate-200 pl-6 text-left cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || "Admin"}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{user?.email || ""}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-700 font-bold">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "A"
                  )}
                </div>
              </button>
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <NavLink to="/admin/profile" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}>
                  My Profile
                </NavLink>
                <NavLink to="/admin/profile/security/password" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}>
                  Security
                </NavLink>
                <NavLink to="/admin/profile/sessions" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}>
                  Active Sessions
                </NavLink>
                <button 
                  onClick={async () => {
                    logout();
                    window.location.href = "/admin/login";
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
