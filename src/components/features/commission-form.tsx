'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
import { z } from 'zod';
import { formatCurrency } from '@/lib/utils';
import { Zap, Sparkles } from 'lucide-react';
import { calculatePrice, calculateDeliveryHoursFromBudget, PRICING } from '@/lib/pricing';

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

// Simplified schemas
const QuickPoemFormSchema = z.object({
  type: z.literal('QUICK'),
  email: z.string().email('Please enter a valid email address'),
  currency: z.enum(['USD', 'KES']),
});

const CustomPoemFormSchema = z.object({
  type: z.literal('CUSTOM'),
  email: z.string().email('Please enter a valid email address'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  mood: z.string().min(1, 'Please select a mood'),
  instructions: z.string().optional(),
  budget: z.number().min(1.99).max(4.99),
  currency: z.enum(['USD', 'KES']),
});

type QuickPoemForm = z.infer<typeof QuickPoemFormSchema>;
type CustomPoemForm = z.infer<typeof CustomPoemFormSchema>;

export function CommissionForm() {
  const [poemType, setPoemType] = useState<PoemType>('CUSTOM');
  const [currency, setCurrency] = useState<'USD' | 'KES'>('USD');
  const [customBudget, setCustomBudget] = useState<number>(
    currency === 'USD' ? PRICING.CUSTOM.MIN_PRICE.USD : PRICING.CUSTOM.MIN_PRICE.KES
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate delivery time based on budget for custom poems
  const deliveryTime = poemType === 'CUSTOM' 
    ? calculateDeliveryHoursFromBudget(customBudget, currency) 
    : 24;
  const quickPrice = calculatePrice('QUICK', currency);

  // Quick Poem Form
  const quickForm = useForm<QuickPoemForm>({
    resolver: zodResolver(QuickPoemFormSchema),
    defaultValues: {
      type: 'QUICK',
      email: '',
      currency: 'USD',
    },
  });

  // Custom Poem Form
  const customForm = useForm<CustomPoemForm>({
    resolver: zodResolver(CustomPoemFormSchema),
    defaultValues: {
      type: 'CUSTOM',
      email: '',
      title: '',
      mood: '',
      instructions: '',
      budget: 1.99,
      currency: 'USD',
    },
  });

  const handleQuickSubmit = async (data: QuickPoemForm) => {
    setIsSubmitting(true);
    console.log('Quick Poem Submission:', data);
    alert('Quick poem commissioned! Payment integration coming soon.');
    setIsSubmitting(false);
  };

  const handleCustomSubmit = async (data: CustomPoemForm) => {
    setIsSubmitting(true);
    console.log('Custom Poem Submission:', { ...data, deliveryTime });
    alert('Custom poem commissioned! Payment integration coming soon.');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Type Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Quick Poem Card */}
        <motion.button
          type="button"
          onClick={() => setPoemType('QUICK')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`text-left p-8 rounded-2xl transition-all duration-300 ${
            poemType === 'QUICK'
              ? 'glass-light border-2 border-border'
              : 'glass-card border border-border glass-hover'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            {poemType === 'QUICK' && (
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-nunito font-bold">
                SELECTED
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Quick Poem</h3>
          <p className="font-nunito text-sm mb-4 text-muted-foreground">
            A poetic surprise—no details needed
          </p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(quickPrice, currency)}</span>
            <span className="font-nunito text-sm text-muted-foreground">• 24h delivery</span>
          </div>
        </motion.button>

        {/* Custom Poem Card */}
        <motion.button
          type="button"
          onClick={() => setPoemType('CUSTOM')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`text-left p-8 rounded-2xl transition-all duration-300 ${
            poemType === 'CUSTOM'
              ? 'glass-light border-2 border-border'
              : 'glass-card border border-border glass-hover'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1 glass-light rounded-full text-xs font-nunito">
                POPULAR
              </div>
              {poemType === 'CUSTOM' && (
                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-nunito font-bold">
                  SELECTED
                </div>
              )}
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Custom Poem</h3>
          <p className="font-nunito text-sm mb-4 text-muted-foreground">
            Personalized with your vision
          </p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatCurrency(calculatePrice('CUSTOM', currency, 24), currency)} - {formatCurrency(calculatePrice('CUSTOM', currency, 6), currency)}
            </span>
          </div>
          <p className="font-nunito text-sm mt-2 text-muted-foreground">
            6-24h delivery • You choose
          </p>
        </motion.button>
      </div>

      {/* Currency Toggle */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => {
            setCurrency('USD');
            setCustomBudget(PRICING.CUSTOM.MIN_PRICE.USD);
          }}
          className={`px-6 py-2 rounded-lg font-nunito transition-all ${
            currency === 'USD'
              ? 'bg-primary text-primary-foreground font-bold'
              : 'glass-card glass-hover'
          }`}
        >
          USD ($)
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrency('KES');
            setCustomBudget(PRICING.CUSTOM.MIN_PRICE.KES);
          }}
          className={`px-6 py-2 rounded-lg font-nunito transition-all ${
            currency === 'KES'
              ? 'bg-primary text-primary-foreground font-bold'
              : 'glass-card glass-hover'
          }`}
        >
          KES (Ksh)
        </button>
      </div>

      {/* Form Content */}
      <GlassCard className="p-8 md:p-10">
        {poemType === 'QUICK' ? (
          /* QUICK POEM FORM */
          <form onSubmit={quickForm.handleSubmit(handleQuickSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="quick-email" className="text-lg font-nunito">Email Address</Label>
              <p className="font-nunito text-sm mb-3 text-muted-foreground">
                We'll send your poetic surprise here
              </p>
              <Input
                id="quick-email"
                type="email"
                placeholder="your@email.com"
                className="h-12"
                {...quickForm.register('email')}
              />
              {quickForm.formState.errors.email && (
                <p className="text-destructive text-sm mt-2 font-nunito">
                  {quickForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="glass-light rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-nunito text-muted-foreground">Total Price:</span>
                <span className="text-3xl font-bold">{formatCurrency(quickPrice, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-nunito text-muted-foreground">Delivery:</span>
                <span className="font-nunito">Within 24 hours</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-nunito" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>

            <p className="text-center text-muted-foreground text-sm font-nunito">
              Your poem will be a delightful surprise—no topic needed!
            </p>
          </form>
        ) : (
          /* CUSTOM POEM FORM */
          <form onSubmit={customForm.handleSubmit(handleCustomSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="custom-email" className="text-lg font-nunito">Email Address</Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="your@email.com"
                className="h-12 mt-2"
                {...customForm.register('email')}
              />
              {customForm.formState.errors.email && (
                <p className="text-destructive text-sm mt-2 font-nunito">
                  {customForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="custom-title" className="text-lg font-nunito">Poem Title</Label>
                <Input
                  id="custom-title"
                  placeholder="e.g., Eternal Sunshine"
                  className="h-12 mt-2"
                  maxLength={100}
                  {...customForm.register('title')}
                />
                {customForm.formState.errors.title && (
                  <p className="text-destructive text-sm mt-2 font-nunito">
                    {customForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="custom-mood" className="text-lg font-nunito">Mood</Label>
                <Select
                  onValueChange={(value) => customForm.setValue('mood', value)}
                  defaultValue={customForm.watch('mood')}
                >
                  <SelectTrigger id="custom-mood" className="h-12 mt-2">
                    <SelectValue placeholder="Select mood" />
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
                  <p className="text-destructive text-sm mt-2 font-nunito">
                    {customForm.formState.errors.mood.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-instructions" className="text-lg font-nunito">
                Special Instructions <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="custom-instructions"
                placeholder="Any specific themes, references, or style preferences..."
                rows={4}
                className="mt-2"
                {...customForm.register('instructions')}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-budget" className="text-base mb-2 block font-nunito">
                  Your Budget
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-nunito text-lg">
                    {currency === 'USD' ? '$' : 'Ksh'}
                  </span>
                  <Input
                    id="custom-budget"
                    type="number"
                    step="0.01"
                    min={currency === 'USD' ? PRICING.CUSTOM.MIN_PRICE.USD : PRICING.CUSTOM.MIN_PRICE.KES}
                    max={currency === 'USD' ? PRICING.CUSTOM.MAX_PRICE.USD : PRICING.CUSTOM.MAX_PRICE.KES}
                    value={customBudget}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || PRICING.CUSTOM.MIN_PRICE[currency];
                      setCustomBudget(value);
                      customForm.setValue('budget', value);
                    }}
                    className="h-14 text-2xl font-bold pl-14 pr-4"
                    placeholder={PRICING.CUSTOM.MIN_PRICE[currency].toString()}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center text-sm font-nunito">
                  <span className="text-muted-foreground">
                    Range: {formatCurrency(PRICING.CUSTOM.MIN_PRICE[currency], currency)} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE[currency], currency)}
                  </span>
                  <span className="font-bold">
                    ≈ {deliveryTime} hours delivery
                  </span>
                </div>
              </div>

              {/* Info Guide */}
              <div className="p-4 rounded-lg glass-light border border-border">
                <p className="text-xs font-nunito text-muted-foreground mb-3">
                  💡 <strong className="text-foreground">Pricing Guide:</strong> Higher budget = Faster delivery
                </p>
                <div className="space-y-1.5 text-xs font-nunito text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{formatCurrency(PRICING.CUSTOM.MIN_PRICE[currency], currency)}</span>
                    <span>→ {PRICING.CUSTOM.MAX_HOURS} hours (Standard)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{formatCurrency(PRICING.CUSTOM.MAX_PRICE[currency], currency)}</span>
                    <span>→ {PRICING.CUSTOM.MIN_HOURS} hours (Priority)</span>
                  </div>
                  <p className="pt-2 italic opacity-80">
                    Feel free to choose any amount within the range
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-nunito" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}