'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/admin';

interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
  };
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Welcome back, {admin.name}
        </p>
      </div>
      
      <Button
        variant="outline"
        onClick={handleLogout}
        className="font-nunito"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}