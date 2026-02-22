import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-8">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-8 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto max-w-6xl px-4 space-y-24">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-64 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}