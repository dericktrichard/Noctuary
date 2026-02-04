'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { QuickPoemSchema, CustomPoemSchema } from '@/lib/validations/schemas';
import { calculatePrice, getDeliveryHours } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';
import type { QuickPoemInput, CustomPoemInput } from '@/lib/validations/schemas';

type PoemType = 'QUICK' | 'CUSTOM';

const MOODS = [
  'Happy',
  'Sad',
  'Romantic',
  'Motivational',
  'Nostalgic',
  'Peaceful',
  'Energetic',
  'Melancholic',
];

export function CommissionForm() {
  const [poemType, setPoemType] = useState<PoemType>('CUSTOM');
  const [currency, setCurrency] = useState<'USD' | 'KES'>('USD');
  const [urgency, setUrgency] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate price in real-time
  const price = calculatePrice(poemType, currency, poemType === 'CUSTOM' ? urgency : undefined);
  const deliveryHours = getDeliveryHours(poemType, poemType === 'CUSTOM' ? urgency : undefined);

  // Form for Quick Poem
  const quickForm = useForm<QuickPoemInput>({
    resolver: zodResolver(QuickPoemSchema),
    defaultValues: {
      type: 'QUICK',
      email: '',
      topic: '',
      paymentMethod: 'paypal',
      currency: 'USD',
    },
  });

  // Form for Custom Poem
  const customForm = useForm<CustomPoemInput>({
    resolver: zodResolver(CustomPoemSchema),
    defaultValues: {
      type: 'CUSTOM',
      email: '',
      title: '',
      topic: '',
      mood: '',
      recipient: '',
      instructions: '',
      urgency: 24,
      paymentMethod: 'paypal',
      currency: 'USD',
    },
  });

  const handleQuickSubmit = async (data: QuickPoemInput) => {
    setIsSubmitting(true);
    console.log('Quick Poem Submission:', data);
    // TODO: Implement payment and order creation
    alert('Quick poem form submitted! Payment integration coming next.');
    setIsSubmitting(false);
  };

  const handleCustomSubmit = async (data: CustomPoemInput) => {
    setIsSubmitting(true);
    console.log('Custom Poem Submission:', data);
    // TODO: Implement payment and order creation
    alert('Custom poem form submitted! Payment integration coming next.');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Type Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setPoemType('QUICK')}
          className={`glass-card p-6 rounded-xl transition-all duration-300 text-left ${
            poemType === 'QUICK' ? 'border-2 border-white/40 bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          <h3 className="font-serif text-2xl font-bold mb-2">Quick Poem</h3>
          <p className="text-white/60 mb-4">24-hour delivery</p>
          <p className="text-3xl font-bold">{formatCurrency(calculatePrice('QUICK', currency), currency)}</p>
        </button>

        <button
          type="button"
          onClick={() => setPoemType('CUSTOM')}
          className={`glass-card p-6 rounded-xl transition-all duration-300 text-left ${
            poemType === 'CUSTOM' ? 'border-2 border-white/40 bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          <div className="inline-block px-2 py-1 bg-white/10 rounded-full text-xs mb-2">
            Most Popular
          </div>
          <h3 className="font-serif text-2xl font-bold mb-2">Custom Poem</h3>
          <p className="text-white/60 mb-4">6-24 hour delivery</p>
          <p className="text-3xl font-bold">
            {formatCurrency(calculatePrice('CUSTOM', currency, 24), currency)} - {formatCurrency(calculatePrice('CUSTOM', currency, 6), currency)}
          </p>
        </button>
      </div>

      {/* Currency Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            currency === 'USD' ? 'bg-white text-black' : 'glass-card'
          }`}
        >
          USD ($)
        </button>
        <button
          type="button"
          onClick={() => setCurrency('KES')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            currency === 'KES' ? 'bg-white text-black' : 'glass-card'
          }`}
        >
          KES (Ksh)
        </button>
      </div>

      {/* Form Content */}
      <GlassCard className="p-8">
        {poemType === 'QUICK' ? (
          <form onSubmit={quickForm.handleSubmit(handleQuickSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="quick-email">Email Address</Label>
              <Input
                id="quick-email"
                type="email"
                placeholder="your@email.com"
                {...quickForm.register('email')}
              />
              {quickForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">{quickForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quick-topic">Poem Topic</Label>
              <Input
                id="quick-topic"
                placeholder="e.g., Birthday wishes for my mom"
                maxLength={100}
                {...quickForm.register('topic')}
              />
              {quickForm.formState.errors.topic && (
                <p className="text-red-400 text-sm mt-1">{quickForm.formState.errors.topic.message}</p>
              )}
              <p className="text-white/40 text-sm mt-1 font-caption">
                {quickForm.watch('topic')?.length || 0}/100 characters
              </p>
            </div>

            <div className="glass-light rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Total:</span>
                <span className="text-3xl font-bold">{formatCurrency(price, currency)}</span>
              </div>
              <p className="text-white/60 text-sm font-caption">Delivery in {deliveryHours} hours</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        ) : (
          <form onSubmit={customForm.handleSubmit(handleCustomSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="custom-email">Email Address</Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="your@email.com"
                {...customForm.register('email')}
              />
              {customForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">{customForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="custom-title">Poem Title</Label>
              <Input
                id="custom-title"
                placeholder="e.g., A Mother's Love"
                maxLength={100}
                {...customForm.register('title')}
              />
              {customForm.formState.errors.title && (
                <p className="text-red-400 text-sm mt-1">{customForm.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="custom-topic">Poem Topic / Details</Label>
              <Textarea
                id="custom-topic"
                placeholder="Tell us what the poem should be about..."
                rows={4}
                maxLength={500}
                {...customForm.register('topic')}
              />
              {customForm.formState.errors.topic && (
                <p className="text-red-400 text-sm mt-1">{customForm.formState.errors.topic.message}</p>
              )}
              <p className="text-white/40 text-sm mt-1 font-caption">
                {customForm.watch('topic')?.length || 0}/500 characters
              </p>
            </div>

            <div>
              <Label htmlFor="custom-mood">Mood</Label>
              <Select
                onValueChange={(value) => customForm.setValue('mood', value)}
                defaultValue={customForm.watch('mood')}
              >
                <SelectTrigger id="custom-mood">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customForm.formState.errors.mood && (
                <p className="text-red-400 text-sm mt-1">{customForm.formState.errors.mood.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="custom-recipient">Recipient (Optional)</Label>
              <Input
                id="custom-recipient"
                placeholder="e.g., Sarah"
                {...customForm.register('recipient')}
              />
            </div>

            <div>
              <Label htmlFor="custom-instructions">Special Instructions (Optional)</Label>
              <Textarea
                id="custom-instructions"
                placeholder="Any specific style, references, or requirements..."
                rows={3}
                {...customForm.register('instructions')}
              />
            </div>

            <div>
              <Label>Delivery Speed</Label>
              <div className="mt-4 mb-2">
                <Slider
                  min={6}
                  max={24}
                  step={6}
                  value={[urgency]}
                  onValueChange={(value) => {
                    setUrgency(value[0]);
                    customForm.setValue('urgency', value[0]);
                  }}
                />
              </div>
              <div className="flex justify-between text-sm font-caption">
                <span className={urgency === 6 ? 'text-white font-bold' : 'text-white/60'}>
                  6h - Priority
                </span>
                <span className={urgency === 12 ? 'text-white font-bold' : 'text-white/60'}>
                  12h - Fast
                </span>
                <span className={urgency === 24 ? 'text-white font-bold' : 'text-white/60'}>
                  24h - Standard
                </span>
              </div>
            </div>

            <div className="glass-light rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Total:</span>
                <span className="text-3xl font-bold">{formatCurrency(price, currency)}</span>
              </div>
              <p className="text-white/60 text-sm font-caption">Delivery in {urgency} hours</p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
