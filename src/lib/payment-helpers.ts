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
      
      // Check if the server successfully returned an approvalUrl
      if (!result.success || !result.approvalUrl) {
        toast.error(result.error || 'Failed to create PayPal order');
        return { success: false };
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaypalOrderId', result.paypalOrderId || '');
      }

      // REDIRECT: Use the official URL from the PayPal API
      window.location.href = result.approvalUrl;
      return { success: true };
      
    } else {
      // Paystack logic remains the same
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
    console.error('Payment processing error:', error);
    toast.error('Failed to initialize payment. Please try again.');
    return { success: false };
  }
}