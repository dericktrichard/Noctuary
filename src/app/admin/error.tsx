'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-lg border border-border">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard Error</h1>
        <p className="font-nunito text-muted-foreground mb-6">
          Something went wrong in the admin panel.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} size="lg" className="font-nunito">
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry
          </Button>
          <Link href="/admin/login">
            <Button variant="outline" size="lg" className="font-nunito">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}