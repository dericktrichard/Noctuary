'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated 404 */}
          <motion.h1 
            className="text-9xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/70 to-primary/50 bg-clip-text text-transparent"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            404
          </motion.h1>
          
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="font-nunito text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Perhaps you'd like to commission a poem about lost pages?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="font-nunito w-full sm:w-auto">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.back()}
              className="font-nunito w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm font-nunito text-muted-foreground mb-4">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/#commission">
                <Button variant="ghost" size="sm" className="font-nunito">
                  Commission a Poem
                </Button>
              </Link>
              <Link href="/#samples">
                <Button variant="ghost" size="sm" className="font-nunito">
                  Sample Works
                </Button>
              </Link>
              <Link href="/#about">
                <Button variant="ghost" size="sm" className="font-nunito">
                  About
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}