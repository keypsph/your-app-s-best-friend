import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Receipt, FolderOpen, Target, PiggyBank, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transações', icon: Receipt },
  { path: '/categories', label: 'Categorias', icon: FolderOpen },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/savings', label: 'Poupança', icon: PiggyBank },
  { path: '/investments', label: 'Investimentos', icon: TrendingUp },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-6 px-3">
        <h1 className="gradient-text text-2xl font-bold">SLX Finance</h1>
        <p className="text-sm text-muted-foreground">Controle Financeiro</p>
      </div>
      
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-sidebar lg:block">
        <NavContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:hidden">
          <h1 className="gradient-text text-xl font-bold">SLX Finance</h1>
          
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
