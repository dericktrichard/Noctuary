'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPayPalPaymentAction, verifyStripePaymentAction } from '@/app/actions/orders';
import { Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const stripeSessionId = searchParams.get('session_id');
        const paypalToken = searchParams.get('token');

        if (stripeSessionId) {
          // Verify Stripe payment
          const result = await verifyStripePaymentAction(stripeSessionId);
          
          if (result.success) {
            setStatus('success');
            setMessage('Payment verified! Redirecting...');
            
            // Clear session storage
            sessionStorage.removeItem('noctuaryOrderId');
            sessionStorage.removeItem('noctuaryStripeSessionId');
            
            setTimeout(() => {
              router.push(`/order/${result.accessToken}`);
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.error || 'Payment verification failed');
          }
        } else if (paypalToken) {
          // Existing PayPal verification
          const orderId = sessionStorage.getItem('noctuaryOrderId');
          const payerId = searchParams.get('PayerID');

          if (!orderId || !payerId) {
            setStatus('error');
            setMessage('Missing payment information');
            return;
          }

          const result = await verifyPayPalPaymentAction(orderId, paypalToken);
          
          if (result.success) {
            setStatus('success');
            setMessage('Payment verified! Redirecting...');
            
            sessionStorage.removeItem('noctuaryOrderId');
            sessionStorage.removeItem('noctuaryPaypalOrderId');
            
            setTimeout(() => {
              router.push(`/order/${result.accessToken}`);
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.error || 'Payment verification failed');
          }
        } else {
          setStatus('error');
          setMessage('Invalid payment callback');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-lg border border-border">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="font-nunito text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2 text-green-500">Payment Successful!</h1>
            <p className="font-nunito text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2 text-red-500">Payment Failed</h1>
            <p className="font-nunito text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}