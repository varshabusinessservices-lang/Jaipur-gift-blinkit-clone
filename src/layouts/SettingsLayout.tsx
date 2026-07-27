import { Outlet, NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { PageHeader } from "../components/layout/PageHeader";
import { 
  Settings, Globe, Smartphone, Home, Shield, Mail, 
  CreditCard, Bell, Truck, Map, Gift, RefreshCcw, 
  Database, Search, FileText 
} from "lucide-react";

const settingsNavigation = [
  { name: "System", href: "/admin/settings/system", icon: Settings },
  { name: "Web", href: "/admin/settings/web", icon: Globe },
  { name: "App", href: "/admin/settings/app", icon: Smartphone },
  { name: "Home General Settings", href: "/admin/settings/home", icon: Home },
  { name: "Authentication", href: "/admin/settings/authentication", icon: Shield },
  { name: "Email", href: "/admin/settings/email", icon: Mail },
  { name: "Payment", href: "/admin/settings/payment", icon: CreditCard },
  { name: "Notification", href: "/admin/settings/notification", icon: Bell },
  { name: "Delivery Boy", href: "/admin/settings/delivery-boy", icon: Truck },
  { name: "Delivery Zones", href: "/admin/settings/delivery-zones", icon: Map },
];

export function SettingsLayout() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader 
        title="Settings" 
        description="Manage your store configuration and preferences."
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {settingsNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
             <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
