'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Zap, Sparkles, CreditCard, Smartphone } from 'lucide-react';
import { calculatePrice, calculateDeliveryHoursFromBudget, PRICING } from '@/lib/pricing';
import { createOrderAction, initializePaystackPaymentAction, createPayPalOrderAction } from '@/app/actions/orders';

type PoemType = 'QUICK' | 'CUSTOM' | null;
type PaymentMethod = 'PAYPAL' | 'PAYSTACK';

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
  // Detect user region and set default currency
  const getDefaultCurrency = (): 'USD' | 'KES' => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Kenya timezones: Africa/Nairobi
      if (timezone === 'Africa/Nairobi') {
        return 'KES';
      }
    } catch (e) {
      // Fallback
    }
    return 'USD'; // Default to USD for international
  };

  const [poemType, setPoemType] = useState<PoemType>(null);
  const [currency, setCurrency] = useState<'USD' | 'KES'>(getDefaultCurrency());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYSTACK');
  const [customBudget, setCustomBudget] = useState<number>(
    currency === 'USD' ? PRICING.CUSTOM.MIN_PRICE.USD : PRICING.CUSTOM.MIN_PRICE.KES
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryTime = poemType === 'CUSTOM' 
    ? calculateDeliveryHoursFromBudget(customBudget, currency) 
    : 24;
  const quickPrice = calculatePrice('QUICK', currency);

  const quickForm = useForm<QuickPoemForm>({
    resolver: zodResolver(QuickPoemFormSchema),
    defaultValues: {
      type: 'QUICK',
      email: '',
      currency: currency,
    },
  });

  const customForm = useForm<CustomPoemForm>({
    resolver: zodResolver(CustomPoemFormSchema),
    defaultValues: {
      type: 'CUSTOM',
      email: '',
      title: '',
      mood: '',
      instructions: '',
      budget: currency === 'USD' ? PRICING.CUSTOM.MIN_PRICE.USD : PRICING.CUSTOM.MIN_PRICE.KES,
      currency: currency,
    },
  });

  const initiatePayPalPayment = async (orderId: string, amount: number) => {
    try {
      const result = await createPayPalOrderAction(orderId, amount);
      
      if (!result.success || !result.paypalOrderId) {
        alert(result.error || 'Failed to create PayPal order');
        setIsSubmitting(false);
        return;
      }

      const approveUrl = `https://www.${process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live' ? '' : 'sandbox.'}paypal.com/checkoutnow?token=${result.paypalOrderId}`;
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaypalOrderId', result.paypalOrderId);
      }

      window.location.href = approveUrl;
    } catch (error) {
      console.error('PayPal error:', error);
      alert('Failed to initialize PayPal. Please try again.');
      setIsSubmitting(false);
    }
  };

  const initiatePaystackPayment = async (orderId: string, email: string, amount: number) => {
    try {
      const result = await initializePaystackPaymentAction(orderId, email, amount);
      
      if (!result.success || !result.authorizationUrl) {
        alert(result.error || 'Failed to initialize payment');
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaystackReference', result.reference || '');
      }

      window.location.href = result.authorizationUrl;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuickSubmit = async (data: QuickPoemForm) => {
    setIsSubmitting(true);
    
    try {
      const result = await createOrderAction({
        type: 'QUICK',
        email: data.email,
        currency,
      });

      if (!result.success || !result.orderId) {
        alert(result.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'PAYPAL') {
        await initiatePayPalPayment(result.orderId, result.amount);
      } else {
        await initiatePaystackPayment(result.orderId, data.email, result.amount);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (data: CustomPoemForm) => {
    setIsSubmitting(true);
    
    try {
      const result = await createOrderAction({
        type: 'CUSTOM',
        email: data.email,
        title: data.title,
        mood: data.mood,
        instructions: data.instructions,
        budget: customBudget,
        currency,
      });

      if (!result.success || !result.orderId) {
        alert(result.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'PAYPAL') {
        await initiatePayPalPayment(result.orderId, result.amount);
      } else {
        await initiatePaystackPayment(result.orderId, data.email, result.amount);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step 1: Choose Poem Type */}
      {!poemType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <motion.button
            type="button"
            onClick={() => setPoemType('QUICK')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-left p-8 rounded-2xl glass-card border border-border glass-hover transition-all"
          >
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Quick Poem</h3>
            <p className="font-nunito text-sm mb-4 text-muted-foreground">
              A poetic surprise—no details needed
            </p>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {formatCurrency(calculatePrice('QUICK', 'USD'), 'USD')}
                </span>
                <span className="font-nunito text-sm text-muted-foreground">
                  / {formatCurrency(calculatePrice('QUICK', 'KES'), 'KES')}
                </span>
              </div>
              <p className="font-nunito text-sm text-muted-foreground">24h delivery</p>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setPoemType('CUSTOM')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-left p-8 rounded-2xl glass-card border border-border glass-hover transition-all relative"
          >
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-nunito font-bold">
                POPULAR
              </div>
            </div>

            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Custom Poem</h3>
            <p className="font-nunito text-sm mb-4 text-muted-foreground">
              Personalized with your vision
            </p>
            
            <div className="space-y-1">
              <div className="text-xl font-bold">
                {formatCurrency(PRICING.CUSTOM.MIN_PRICE.USD, 'USD')} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE.USD, 'USD')}
              </div>
              <div className="font-nunito text-sm text-muted-foreground">
                {formatCurrency(PRICING.CUSTOM.MIN_PRICE.KES, 'KES')} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE.KES, 'KES')}
              </div>
              <p className="font-nunito text-sm text-muted-foreground mt-2">
                6-12h delivery • You choose
              </p>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Step 2: Show Form Based on Selection */}
      <AnimatePresence mode="wait">
        {poemType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header with selection */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {poemType === 'QUICK' ? 'Quick Poem' : 'Custom Poem'}
                </h3>
                <p className="font-nunito text-sm text-muted-foreground">
                  Fill in the details below
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPoemType(null)}
                className="font-nunito"
              >
                Change Type
              </Button>
            </div>

            <GlassCard className="p-8">
              {poemType === 'QUICK' ? (
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

                  {/* Currency & Payment Selection */}
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                      <Label className="text-base font-nunito mb-3 block">Select Currency</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrency('KES')}
                          className={`p-4 rounded-lg font-nunito transition-all border ${
                            currency === 'KES'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <div className="font-bold">KES (Ksh)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(calculatePrice('QUICK', 'KES'), 'KES')}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency('USD')}
                          className={`p-4 rounded-lg font-nunito transition-all border ${
                            currency === 'USD'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <div className="font-bold">USD ($)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(calculatePrice('QUICK', 'USD'), 'USD')}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-nunito mb-3 block">Payment Method</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAYSTACK')}
                          className={`p-4 rounded-lg font-nunito transition-all border flex items-center gap-3 ${
                            paymentMethod === 'PAYSTACK'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-bold text-sm">M-Pesa / Card</div>
                            <div className="text-xs opacity-80">Via Paystack</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAYPAL')}
                          className={`p-4 rounded-lg font-nunito transition-all border flex items-center gap-3 ${
                            paymentMethod === 'PAYPAL'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <CreditCard className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-bold text-sm">PayPal</div>
                            <div className="text-xs opacity-80">Secure payment</div>
                          </div>
                        </button>
                      </div>
                    </div>
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
                </form>
              ) : (
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

                  {/* Currency & Payment Selection */}
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                      <Label className="text-base font-nunito mb-3 block">Select Currency</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrency('KES');
                            setCustomBudget(PRICING.CUSTOM.MIN_PRICE.KES);
                          }}
                          className={`p-4 rounded-lg font-nunito transition-all border ${
                            currency === 'KES'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <div className="font-bold">KES (Ksh)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(PRICING.CUSTOM.MIN_PRICE.KES, 'KES')} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE.KES, 'KES')}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrency('USD');
                            setCustomBudget(PRICING.CUSTOM.MIN_PRICE.USD);
                          }}
                          className={`p-4 rounded-lg font-nunito transition-all border ${
                            currency === 'USD'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <div className="font-bold">USD ($)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(PRICING.CUSTOM.MIN_PRICE.USD, 'USD')} - {formatCurrency(PRICING.CUSTOM.MAX_PRICE.USD, 'USD')}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-nunito mb-3 block">Payment Method</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAYSTACK')}
                          className={`p-4 rounded-lg font-nunito transition-all border flex items-center gap-3 ${
                            paymentMethod === 'PAYSTACK'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-bold text-sm">M-Pesa / Card</div>
                            <div className="text-xs opacity-80">Via Paystack</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAYPAL')}
                          className={`p-4 rounded-lg font-nunito transition-all border flex items-center gap-3 ${
                            paymentMethod === 'PAYPAL'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'glass-card border-border glass-hover'
                          }`}
                        >
                          <CreditCard className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-bold text-sm">PayPal</div>
                            <div className="text-xs opacity-80">Secure payment</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg font-nunito" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}