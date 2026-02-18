'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/card';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import {
  createSampleWorkAction,
  updateSampleWorkAction,
} from '@/app/actions/sample-works';

interface SampleWorkModalProps {
  sampleWork?: {
    id: string;
    title: string;
    content: string;
    mood?: string | null;
    imageUrl?: string;
  };
  onClose: () => void;
}

export function SampleWorkModal({ sampleWork, onClose }: SampleWorkModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: sampleWork?.title || '',
    content: sampleWork?.content || '',
    mood: sampleWork?.mood || '',
    imageUrl: sampleWork?.imageUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      
      if (sampleWork) {
        // Update existing
        result = await updateSampleWorkAction(sampleWork.id, formData);
      } else {
        // Create new
        result = await createSampleWorkAction(formData);
      }

      if (result.success) {
        toast.success(sampleWork ? 'Sample updated successfully' : 'Sample created successfully');
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Failed to save sample work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {sampleWork ? 'Edit Sample Work' : 'Add Sample Work'}
            </h2>
            <p className="font-nunito text-sm text-muted-foreground mt-1">
              {sampleWork ? 'Update your portfolio piece' : 'Add a new piece to your portfolio'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg glass-hover"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-base font-nunito">
              Poem Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Whispers of Dawn"
              className="h-12 mt-2"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="mood" className="text-base font-nunito">
              Mood <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="mood"
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              placeholder="e.g., Melancholic, Romantic, Hopeful"
              className="h-12 mt-2"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-base font-nunito">
              Poem Content
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your poem here..."
              rows={12}
              className="mt-2 font-serif text-base leading-relaxed"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="imageUrl" className="text-base font-nunito">
              Image URL <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="h-12 mt-2"
              disabled={isSubmitting}
            />
            <p className="text-xs font-nunito text-muted-foreground mt-2">
              Paste an image URL from Unsplash, Pexels, or any other source
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
              <p className="text-sm font-nunito text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-nunito"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-nunito"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : sampleWork ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}