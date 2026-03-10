'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { logoutAdminAction } from '@/app/actions/admin';

interface AdminTopbarProps {
  admin: {
    name: string;
    email: string;
  };
}

export function AdminTopbar({ admin }: AdminTopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
  };

  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile: Extra left padding to avoid hamburger button overlap */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 pl-14 lg:pl-0">
        <div className="flex flex-1 items-center">
          <h2 className="text-sm font-semibold font-nunito text-muted-foreground">
            Welcome back, <span className="text-foreground">{admin.name}</span>
          </h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="font-nunito"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}