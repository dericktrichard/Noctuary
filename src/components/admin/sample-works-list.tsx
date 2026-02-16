'use client';

import { SampleWork } from '@prisma/client';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

interface SampleWorksListProps {
  samples: SampleWork[];
}

export function SampleWorksList({ samples }: SampleWorksListProps) {
  if (samples.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="font-nunito text-muted-foreground">No sample works yet</p>
      </GlassCard>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {samples.map((sample) => (
        <GlassCard key={sample.id} className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg">{sample.title}</h3>
            <Badge variant={sample.isVisible ? 'default' : 'outline'}>
              {sample.isVisible ? 'Visible' : 'Hidden'}
            </Badge>
          </div>

          <p className="font-nunito text-sm text-muted-foreground line-clamp-3 mb-4">
            {sample.content}
          </p>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 font-nunito">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-nunito"
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
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}