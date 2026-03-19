'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPayPalPaymentAction, verifyStripePaymentAction } from '@/app/actions/orders';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

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
        const orderId = searchParams.get('orderId');

        // ✅ CLEAR AUTO-CANCEL SESSION STORAGE
        if (orderId) {
          sessionStorage.removeItem(`noctuary_pending_${orderId}`);
        }

        if (stripeSessionId) {
          const result = await verifyStripePaymentAction(stripeSessionId);
          
          if (result.success && result.accessToken) {
            setStatus('success');
            setMessage('Payment verified! Redirecting...');
            
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
          const storedOrderId = sessionStorage.getItem('noctuaryOrderId');
          const payerId = searchParams.get('PayerID');

          if (!storedOrderId || !payerId) {
            setStatus('error');
            setMessage('Missing payment information');
            return;
          }

          const result = await verifyPayPalPaymentAction(storedOrderId, paypalToken);
          
          if (result.success && result.accessToken) {
            setStatus('success');
            setMessage('Payment verified! Redirecting...');
            
            sessionStorage.removeItem('noctuaryOrderId');
            sessionStorage.removeItem('noctuaryPaypalOrderId');
            // ✅ ALSO CLEAR AUTO-CANCEL FOR STORED ORDER ID
            sessionStorage.removeItem(`noctuary_pending_${storedOrderId}`);
            
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
        console.error('[PAYMENT] Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-card p-8 rounded-2xl border border-border">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="font-nunito text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold mb-2 text-green-500">Payment Successful!</h1>
            <p className="font-nunito text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2 text-red-500">Payment Failed</h1>
            <p className="font-nunito text-muted-foreground mb-4">{message}</p>
            <a 
              href="/" 
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