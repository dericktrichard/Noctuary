import { redirect } from 'next/navigation';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; PayerID?: string }>;
}) {
  const params = await searchParams;
  
  // PayPal returns with token (PayPal Order ID) and PayerID
  if (params.token) {
    // Redirect to verification page
    redirect(`/payment/verify-paypal?token=${params.token}&payerId=${params.PayerID || ''}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
        <p className="text-muted-foreground">
          Please wait while we verify your payment.
        </p>
      </div>
    </div>
  );
}