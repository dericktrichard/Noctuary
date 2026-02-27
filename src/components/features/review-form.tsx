'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { submitReviewAction } from '@/app/actions/reviews';
import { toast } from 'sonner';

interface ReviewFormProps {
  orderId: string;
  email: string;
}

export function ReviewForm({ orderId, email }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    const result = await submitReviewAction({
      orderId,
      email,
      name: name.trim() || null,
      rating,
      comment: comment.trim(),
    });

    if (result.success) {
      toast.success('Thank you for your feedback!');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-lg border border-border space-y-6">
      {/* Rating */}
      <div>
        <Label className="font-nunito mb-3 block">How was your experience?</Label>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name (Optional) */}
      <div>
        <Label htmlFor="name" className="font-nunito">
          Your Name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          maxLength={50}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1 font-nunito">
          Leave blank to remain anonymous
        </p>
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment" className="font-nunito">
          Your Feedback
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about your custom poem..."
          rows={5}
          maxLength={500}
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1 font-nunito">
          {comment.length}/500 characters
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full font-nunito"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>

      <p className="text-xs text-center text-muted-foreground font-nunito">
        Your review will be visible soon. We appreciate your feedback!
      </p>
    </form>
  );
}