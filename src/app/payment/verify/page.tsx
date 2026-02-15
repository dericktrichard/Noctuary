'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPaystackPaymentAction } from '@/app/actions/orders';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get('reference');
      const orderId = typeof window !== 'undefined' ? sessionStorage.getItem('noctuaryOrderId') : null;

      console.log('[VERIFY] Starting verification:', { reference, orderId });

      if (!reference) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }

      if (!orderId) {
        setStatus('error');
        setMessage('Order information missing. Please contact support.');
        return;
      }

      const result = await verifyPaystackPaymentAction(orderId, reference);

      console.log('[VERIFY] Verification result:', result);

      if (result.success && result.accessToken) {
        setStatus('success');
        setMessage('Payment verified successfully!');
        
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('noctuaryOrderId');
          sessionStorage.removeItem('noctuaryPaystackReference');
        }

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
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground font-nunito">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4 text-green-500">✓</div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground font-nunito">{message}</p>
            <p className="text-sm text-muted-foreground font-nunito mt-4">
              Redirecting you to your order...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4 text-red-500">✗</div>
            <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
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

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}