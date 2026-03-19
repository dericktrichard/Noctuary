'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, Home } from 'lucide-react';
import { cancelOrderAction } from '@/app/actions/orders';

export default function PaymentCancelledPage() {
  useEffect(() => {
    const orderId = sessionStorage.getItem('noctuaryOrderId');
    if (orderId) {
      cancelOrderAction(orderId).then((result) => {
        if (result.success) {
          console.log('[ORDER] Cancelled successfully');
        } else {
          console.error('[ORDER] Cancel failed:', result.error);
        }
      });

      sessionStorage.removeItem('noctuaryOrderId');
      sessionStorage.removeItem('noctuaryPaypalOrderId');
      sessionStorage.removeItem('noctuaryPaystackReference');
      sessionStorage.removeItem('noctuaryStripeSessionId');
      sessionStorage.removeItem(`noctuary_pending_${orderId}`); 
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-2xl border border-border">
        <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="font-nunito text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <Link href="/">
          <Button size="lg" className="font-nunito gap-2">
            <Home className="w-5 h-5" />
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}