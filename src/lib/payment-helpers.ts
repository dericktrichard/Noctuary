import { createPayPalOrderAction, initializePaystackPaymentAction } from '@/app/actions/orders';
import { toast } from 'sonner';

export async function processPayment({
  orderId,
  amount,
  email,
  method,
}: {
  orderId: string;
  amount: number;
  email: string;
  method: 'PAYPAL' | 'PAYSTACK';
}) {
  try {
    if (method === 'PAYPAL') {
      const result = await createPayPalOrderAction(orderId, amount);
      
      if (!result.success || !result.approvalUrl) {
        toast.error(result.error || 'Failed to create PayPal order');
        return { success: false };
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaypalOrderId', result.paypalOrderId || '');
      }

      window.location.href = result.approvalUrl;
      return { success: true };
      
    } else {
      const result = await initializePaystackPaymentAction(orderId, email, amount);
      
      if (!result.success || !result.authorizationUrl) {
        toast.error(result.error || 'Failed to initialize payment');
        return { success: false };
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaystackReference', result.reference || '');
      }

      window.location.href = result.authorizationUrl;
      return { success: true };
    }
  } catch (error) {
    console.error('[PAYMENT] Processing error:', error);
    toast.error('Failed to initialize payment. Please try again.');
    return { success: false };
  }
}