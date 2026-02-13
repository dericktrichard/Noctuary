import { redirect } from 'next/navigation';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  
  // Redirect to order tracking page
  if (params.token) {
    redirect(`/order/${params.token}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Redirecting you to your order...
        </p>
      </div>
    </div>
  );
}