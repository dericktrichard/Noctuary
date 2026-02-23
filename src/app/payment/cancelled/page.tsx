'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, Home } from 'lucide-react';

export default function PaymentCancelledPage() {
  useEffect(() => {
    // Try to get orderId from session storage and cancel it
    const orderId = sessionStorage.getItem('noctuaryOrderId');
    if (orderId) {
      sessionStorage.removeItem('noctuaryOrderId');
      sessionStorage.removeItem('noctuaryPaypalOrderId');
      sessionStorage.removeItem('noctuaryPaystackReference');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="font-nunito text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
          The order will remain as "Pending" and will not be processed.
        </p>
        <Link href="/">
          <Button size="lg" className="font-nunito">
            <Home className="w-5 h-5 mr-2" />
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}