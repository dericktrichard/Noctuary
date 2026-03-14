'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayPalPaymentAction } from '@/app/actions/orders';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your PayPal payment...');

  useEffect(() => {
    const verify = async () => {
      const paypalOrderId = searchParams.get('token');
      const orderId = sessionStorage.getItem('noctuaryOrderId');

      if (!paypalOrderId || !orderId) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }

      const result = await verifyPayPalPaymentAction(orderId, paypalOrderId);

      if (result.success && result.accessToken) {
        setStatus('success');
        setMessage('Payment verified successfully!');
        
        sessionStorage.removeItem('noctuaryOrderId');
        sessionStorage.removeItem('noctuaryPaypalOrderId');

        setTimeout(() => {
          router.push(`/order/${result.accessToken}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Payment verification failed');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-2xl border border-border">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground font-nunito">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2 text-green-500">Payment Successful!</h1>
            <p className="text-muted-foreground font-nunito mb-2">{message}</p>
            <p className="text-sm text-muted-foreground font-nunito">
              Redirecting you to your order...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2 text-red-500">Payment Failed</h1>
            <p className="text-muted-foreground font-nunito mb-6">{message}</p>
            
            <a href="/"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-nunito hover:opacity-90 transition"
            >
              Return to Homepage
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPayPalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}