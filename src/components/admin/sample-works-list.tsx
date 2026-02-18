'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SampleWork } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteSampleWorkAction,
  toggleSampleWorkVisibilityAction,
} from '@/app/actions/sample-works';

interface SampleWorksListProps {
  samples: SampleWork[];
  onEdit: (sample: SampleWork) => void;
}

export function SampleWorksList({ samples, onEdit }: SampleWorksListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleVisibility = async (id: string) => {
    setLoading(id);
    const result = await toggleSampleWorkVisibilityAction(id);
    if (!result.success) {
      toast.error(result.error || 'Failed to toggle visibility');
    }
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sample work?')) {
      return;
    }

    setLoading(id);
    const result = await deleteSampleWorkAction(id);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete sample');
    } else {
      toast.success('Sample work deleted successfully');
    }
    setLoading(null);
    router.refresh();
  };

  if (samples.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
        <p className="font-nunito text-muted-foreground">
          No sample works yet. Click "Add Sample" to create your first portfolio piece.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {samples.map((sample) => (
        <div key={sample.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg line-clamp-1">{sample.title}</h3>
            <Badge 
              className={sample.isVisible 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
              }
            >
              {sample.isVisible ? 'Visible' : 'Hidden'}
            </Badge>
          </div>

          {sample.mood && (
            <p className="font-nunito text-xs text-muted-foreground mb-2 italic">
              Mood: {sample.mood}
            </p>
          )}

          <p className="font-nunito text-sm text-muted-foreground line-clamp-4 mb-4 font-serif">
            {sample.content}
          </p>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 font-nunito"
              disabled={loading === sample.id}
              onClick={() => onEdit(sample)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-nunito"
              onClick={() => handleToggleVisibility(sample.id)}
              disabled={loading === sample.id}
            >
              {sample.isVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-nunito text-destructive hover:text-destructive"
              onClick={() => handleDelete(sample.id)}
              disabled={loading === sample.id}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}