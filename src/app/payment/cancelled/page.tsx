import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made.
        </p>
        <Link href="/#commission">
          <Button size="lg">Return to Commission Form</Button>
        </Link>
      </div>
    </div>
  );
}