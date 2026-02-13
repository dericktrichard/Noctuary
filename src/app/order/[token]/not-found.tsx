import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrderNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-8 font-nunito">
          The order you're looking for doesn't exist or the tracking link is invalid.
        </p>
        <Link href="/">
          <Button size="lg" className="font-nunito">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}