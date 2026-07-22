import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  Clock, 
  BarChart3, 
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { UserRole } from '@workspace/api-client-react';

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuthStore();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: PackageSearch },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/executives', label: 'Executives', icon: Users },
    { href: '/admin/timeslots', label: 'Time Slots', icon: Clock },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border/50 h-screen sticky top-0 flex flex-col hidden lg:flex shrink-0 z-40">
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <span className="font-serif text-xl font-bold">
          Royal <span className="text-primary italic">Admin</span>
        </span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <Link key={link.href} href={link.href}>
            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              location === link.href 
                ? 'bg-primary/10 text-primary border border-primary/20 font-medium' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </span>
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-border/50">
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
