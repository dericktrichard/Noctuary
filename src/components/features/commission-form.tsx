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
              ? 'glass-light border-2 border-white/30'
              : 'glass-card border border-white/10 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            {poemType === 'QUICK' && (
              <div className="px-3 py-1 bg-white text-black rounded-full text-xs font-caption font-bold">
                SELECTED
              </div>
            )}
          </div>
          
          <h3 className="font-serif text-2xl font-bold mb-2">Quick Poem</h3>
          <p className="text-white/60 font-caption text-sm mb-4">
            A poetic surprise—no details needed
          </p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(quickPrice, currency)}</span>
            <span className="text-white/50 font-caption text-sm">• 24h delivery</span>
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
              ? 'glass-light border-2 border-white/30'
              : 'glass-card border border-white/10 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-caption">
                POPULAR
              </div>
              {poemType === 'CUSTOM' && (
                <div className="px-3 py-1 bg-white text-black rounded-full text-xs font-caption font-bold">
                  SELECTED
                </div>
              )}
            </div>
          </div>
          
          <h3 className="font-serif text-2xl font-bold mb-2">Custom Poem</h3>
          <p className="text-white/60 font-caption text-sm mb-4">
            Personalized with your vision
          </p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatCurrency(calculatePrice('CUSTOM', currency, 24), currency)} - {formatCurrency(calculatePrice('CUSTOM', currency, 6), currency)}
            </span>
          </div>
          <p className="text-white/50 font-caption text-sm mt-2">
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
          className={`px-6 py-2 rounded-lg font-caption transition-all ${
            currency === 'USD'
              ? 'bg-white text-black font-bold'
              : 'glass-card hover:bg-white/10'
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
          className={`px-6 py-2 rounded-lg font-caption transition-all ${
            currency === 'KES'
              ? 'bg-white text-black font-bold'
              : 'glass-card hover:bg-white/10'
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
              <Label htmlFor="quick-email" className="text-lg font-caption">Email Address</Label>
              <p className="text-white/50 text-sm font-caption mb-3">
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
                <p className="text-red-400 text-sm mt-2 font-caption">
                  {quickForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="glass-light rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-caption text-white/70">Total Price:</span>
                <span className="text-3xl font-bold">{formatCurrency(quickPrice, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-caption text-white/50">Delivery:</span>
                <span className="font-caption text-white/70">Within 24 hours</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>

            <p className="text-center text-white/40 text-sm font-caption">
              Your poem will be a delightful surprise—no topic needed!
            </p>
          </form>
        ) : (
          /* CUSTOM POEM FORM */
          <form onSubmit={customForm.handleSubmit(handleCustomSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="custom-email" className="text-lg font-caption">Email Address</Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="your@email.com"
                className="h-12 mt-2"
                {...customForm.register('email')}
              />
              {customForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-2 font-caption">
                  {customForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="custom-title" className="text-lg font-caption">Poem Title</Label>
                <Input
                  id="custom-title"
                  placeholder="e.g., Eternal Sunshine"
                  className="h-12 mt-2"
                  maxLength={100}
                  {...customForm.register('title')}
                />
                {customForm.formState.errors.title && (
                  <p className="text-red-400 text-sm mt-2 font-caption">
                    {customForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="custom-mood" className="text-lg font-caption">Mood</Label>
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
                  <p className="text-red-400 text-sm mt-2 font-caption">
                    {customForm.formState.errors.mood.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-instructions" className="text-lg font-caption">
                Special Instructions <span className="text-white/50 text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="custom-instructions"
                placeholder="Any specific themes, references, or style preferences..."
                rows={4}
                className="mt-2"
                {...customForm.register('instructions')}
              />
            </div>

            <div className="glass-light rounded-xl p-6 space-y-4">
              <div className="glass-light rounded-xl p-6 space-y-4">
              <div>
                <Label htmlFor="custom-budget" className="text-lg font-caption">Your Budget</Label>
                <p className="text-white/50 text-sm font-caption mb-3">
                  Higher budget = Faster delivery (Default: {formatCurrency(PRICING.CUSTOM.MIN_PRICE[currency], currency)})
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-caption text-lg">
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
                    className="h-14 text-2xl font-bold pl-12"
                    placeholder={PRICING.CUSTOM.MIN_PRICE[currency].toString()}
                  />
                </div>
                <p className="text-white/40 text-xs font-caption mt-2">
                  Enter amount between {formatCurrency(PRICING.CUSTOM.MIN_PRICE[currency], currency)} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE[currency], currency)}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="font-caption text-white/70">Estimated Delivery:</span>
                <span className="text-2xl font-bold">{deliveryTime} hours</span>
              </div>

              <div className="text-sm font-caption text-white/50 space-y-1">
                <p>💡 Pricing Guide:</p>
                <p>• {formatCurrency(PRICING.CUSTOM.MIN_PRICE[currency], currency)}: {PRICING.CUSTOM.MAX_HOURS} hours delivery</p>
                <p>• {formatCurrency(PRICING.CUSTOM.MAX_PRICE[currency], currency)}: {PRICING.CUSTOM.MIN_HOURS} hours delivery</p>
              </div>
            </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}