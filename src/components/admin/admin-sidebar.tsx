'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  PenLine
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Sample Works', href: '/admin/dashboard/samples', icon: FileText },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update content padding when sidebar collapses
  useEffect(() => {
    const content = document.getElementById('admin-content');
    if (content) {
      if (isCollapsed) {
        content.style.paddingLeft = '5rem'; // 80px = 20 * 4
      } else {
        content.style.paddingLeft = '16rem'; // 256px = 64 * 4
      }
    }
  }, [isCollapsed]);

  // Set initial padding on mount
  useEffect(() => {
    const content = document.getElementById('admin-content');
    if (content && window.innerWidth >= 1024) {
      content.style.paddingLeft = '16rem';
    }
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          <div className={cn(
            "flex h-16 shrink-0 items-center gap-3 border-b border-border",
            isCollapsed && "justify-center"
          )}>
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">N</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">N</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Noctuary</h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </>
            )}
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {/* Home Link */}
                  <li>
                    <Link
                      href="/"
                      className={cn(
                        'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors font-nunito text-muted-foreground hover:text-foreground hover:bg-accent',
                        isCollapsed && 'justify-center'
                      )}
                      title="Go to Homepage"
                    >
                      <Home className="h-5 w-5 shrink-0" />
                      {!isCollapsed && 'Homepage'}
                    </Link>
                  </li>

                  {/* Navigation Items */}
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors font-nunito',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                            isCollapsed && 'justify-center'
                          )}
                          title={item.name}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {!isCollapsed && item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* Collapse Toggle at Bottom */}
              <li className="mt-auto">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={cn(
                    "w-full flex items-center gap-x-3 rounded-md p-3 text-sm font-semibold transition-colors font-nunito text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5" />
                      Collapse
                    </>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}