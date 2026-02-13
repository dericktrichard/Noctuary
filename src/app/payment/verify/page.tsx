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
      const orderId = searchParams.get('orderId');

      if (!reference || !orderId) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }

      const result = await verifyPaystackPaymentAction(orderId, reference);

      if (result.success) {
        setStatus('success');
        setMessage('Payment verified successfully!');
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
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
            <p className="text-muted-foreground">{message}</p>
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