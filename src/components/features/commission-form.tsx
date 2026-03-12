'use client';

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
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
import { Zap, Sparkles, CreditCard, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { calculateDeliveryHoursFromBudget } from '@/lib/pricing';
import { 
  createOrderAction, 
  initializePaystackPaymentAction, 
  createPayPalOrderAction,
  createStripeSessionAction, 
} from '@/app/actions/orders';
import { toast } from 'sonner';
import type { DynamicPricing } from '@/app/actions/pricing';

type PoemType = 'QUICK' | 'CUSTOM' | null;
type PaymentMethod = 'PAYPAL' | 'PAYSTACK' | 'STRIPE';
type Currency = 'USD' | 'KES';

const MOODS = [
  'Happy',
  'Sad',
  'Romantic',
  'Motivational',
  'Nostalgic',
  'Peaceful',
  'Energetic',
  'Melancholic',
] as const;

const QuickPoemFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const CustomPoemFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  mood: z.string().min(1, 'Please select a mood'),
  instructions: z.string().max(1000).optional(),
});

type QuickPoemForm = z.infer<typeof QuickPoemFormSchema>;
type CustomPoemForm = z.infer<typeof CustomPoemFormSchema>;

interface CommissionFormProps {
  pricing: DynamicPricing;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
  exit: { opacity: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  tap: { scale: 0.98 }
};

const smoothEasing = [0.4, 0, 0.2, 1];

export function CommissionForm({ pricing }: CommissionFormProps) {
  const getDefaultCurrency = useCallback((): Currency => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone === 'Africa/Nairobi') return 'KES';
    } catch {
      // Fallback
    }
    return 'USD';
  }, []);

  const [poemType, setPoemType] = useState<PoemType>(null);
  const [currency, setCurrency] = useState<Currency>(getDefaultCurrency());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYSTACK');
  const [customBudget, setCustomBudget] = useState<number>(
    currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCurrencyChange = useCallback((newCurrency: Currency) => {
    startTransition(() => {
      setCurrency(newCurrency);
      setPaymentMethod(newCurrency === 'KES' ? 'PAYSTACK' : 'STRIPE');
      
      const min = newCurrency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
      const max = newCurrency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
      
      if (customBudget < min || customBudget > max) {
        setCustomBudget(min);
      }
    });
  }, [customBudget, pricing.custom]);

  const deliveryTime = useMemo(() => 
    poemType === 'CUSTOM' ? calculateDeliveryHoursFromBudget(customBudget, currency) : 24,
    [poemType, customBudget, currency]
  );

  const quickForm = useForm<QuickPoemForm>({
    resolver: zodResolver(QuickPoemFormSchema),
    defaultValues: { email: '' },
    mode: 'onBlur'
  });

  const customForm = useForm<CustomPoemForm>({
    resolver: zodResolver(CustomPoemFormSchema),
    defaultValues: { email: '', title: '', mood: '', instructions: '' },
    mode: 'onBlur'
  });

  const getFinalPaymentDetails = useCallback((
    selectedCurrency: Currency, 
    amount: number, 
    provider: PaymentMethod
  ) => {
    if (provider === 'PAYPAL') {
      return {
        amount: selectedCurrency === 'KES' ? amount / pricing.exchangeRate : amount,
        currency: 'USD' as const,
      };
    }
    
    if (provider === 'PAYSTACK') {
      return {
        amount: selectedCurrency === 'USD' ? amount * pricing.exchangeRate : amount,
        currency: 'KES' as const,
      };
    }

    return { amount, currency: selectedCurrency };
  }, [pricing.exchangeRate]);

  const initiatePayPalPayment = useCallback(async (orderId: string, amount: number) => {
    try {
      const result = await createPayPalOrderAction(orderId, amount);
      
      if (!result.success || !result.paypalOrderId) {
        toast.error(result.error || 'Failed to create PayPal order');
        setIsSubmitting(false);
        return;
      }

      const isLive = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live';
      const approveUrl = `https://www.${isLive ? '' : 'sandbox.'}paypal.com/checkoutnow?token=${result.paypalOrderId}`;
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('noctuaryOrderId', orderId);
        sessionStorage.setItem('noctuaryPaypalOrderId', result.paypalOrderId);
      }

      window.location.href = approveUrl;
    } catch (error) {
      console.error('PayPal error:', error);
      toast.error('Failed to initialize PayPal. Please try again.');
      setIsSubmitting(false);
    }
  }, []);

  const initiatePaystackPayment = useCallback(async (orderId: string, email: string, amount: number) => {
    try {
      const result = await initializePaystackPaymentAction(orderId, email, amount);
      
      if (!result.success || !result.authorizationUrl) {
        toast.error(result.error || 'Failed to initialize payment');
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
      toast.error('Failed to initialize payment. Please try again.');
      setIsSubmitting(false);
    }
  }, []);

  const handleQuickSubmit = useCallback(async (data: QuickPoemForm) => {
    setIsSubmitting(true);
    
    try {
      const quickPrice = currency === 'USD' ? pricing.quick.usd : pricing.quick.kes;
      const paymentDetails = getFinalPaymentDetails(currency, quickPrice, paymentMethod);

      const result = await createOrderAction({
        type: 'QUICK',
        email: data.email, 
        currency: paymentDetails.currency,
      });

      if (!result.success || !result.orderId) {
        toast.error(result.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'PAYPAL') {
        await initiatePayPalPayment(result.orderId, paymentDetails.amount);
      } else if (paymentMethod === 'PAYSTACK') {
        await initiatePaystackPayment(result.orderId, data.email, paymentDetails.amount);
      } else if (paymentMethod === 'STRIPE') {
        const stripeResult = await createStripeSessionAction(
          result.orderId,
          data.email, 
          result.amount
        );

        if (!stripeResult.success || !stripeResult.url) {
          toast.error(stripeResult.error || 'Failed to initialize Stripe payment');
          setIsSubmitting(false);
          return;
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('noctuaryOrderId', result.orderId);
          sessionStorage.setItem('noctuaryStripeSessionId', stripeResult.sessionId || '');
        }

        window.location.href = stripeResult.url;
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }, [currency, paymentMethod, pricing.quick, getFinalPaymentDetails, initiatePayPalPayment, initiatePaystackPayment]);

  const handleCustomSubmit = useCallback(async (data: CustomPoemForm) => {
    setIsSubmitting(true);
    
    try {
      const paymentDetails = getFinalPaymentDetails(currency, customBudget, paymentMethod);

      const result = await createOrderAction({
        type: 'CUSTOM',
        email: data.email, 
        title: data.title,
        mood: data.mood,
        instructions: data.instructions,
        budget: paymentDetails.amount,
        currency: paymentDetails.currency,
      });

      if (!result.success || !result.orderId) {
        toast.error(result.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'PAYPAL') {
        await initiatePayPalPayment(result.orderId, paymentDetails.amount);
      } else if (paymentMethod === 'PAYSTACK') {
        await initiatePaystackPayment(result.orderId, data.email, paymentDetails.amount);
      } else if (paymentMethod === 'STRIPE') {
        const stripeResult = await createStripeSessionAction(
          result.orderId,
          data.email, 
          result.amount
        );

        if (!stripeResult.success || !stripeResult.url) {
          toast.error(stripeResult.error || 'Failed to initialize Stripe payment');
          setIsSubmitting(false);
          return;
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('noctuaryOrderId', result.orderId);
          sessionStorage.setItem('noctuaryStripeSessionId', stripeResult.sessionId || '');
        }

        window.location.href = stripeResult.url;
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }, [currency, customBudget, paymentMethod, getFinalPaymentDetails, initiatePayPalPayment, initiatePaystackPayment]);

  const getDisplayPrice = useCallback(() => {
    if (poemType === 'QUICK') {
      return formatCurrency(currency === 'USD' ? pricing.quick.usd : pricing.quick.kes, currency);
    }
    return formatCurrency(customBudget, currency);
  }, [poemType, currency, customBudget, pricing.quick]);

  const handleBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setCustomBudget(0);
      return;
    }
    
    if (!/^\d*\.?\d*$/.test(value)) return;
    
    const parts = value.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    
    const numValue = parseFloat(value) || 0;
    setCustomBudget(numValue);
  }, []);

  const handleBudgetBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || (currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes);
    const min = currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
    const max = currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
    
    if (value < min) value = min;
    if (value > max) value = max;
    
    setCustomBudget(value);
  }, [currency, pricing.custom]);

  const setBudgetToMin = useCallback(() => {
    setCustomBudget(currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes);
  }, [currency, pricing.custom]);

  const setBudgetToMax = useCallback(() => {
    setCustomBudget(currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes);
  }, [currency, pricing.custom]);

  const setBudgetToMid = useCallback(() => {
    const min = currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
    const max = currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
    const mid = (min + max) / 2;
    setCustomBudget(currency === 'USD' ? Math.round(mid * 100) / 100 : Math.round(mid));
  }, [currency, pricing.custom]);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: smoothEasing }}
        className="mb-2 text-center"
      >
        <p className="text-xs font-nunito text-muted-foreground">
          The USD; PayPal and Stripe Payment Options are currently Unavailable
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!poemType && (
          <motion.div
            key="selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.button
              type="button"
              onClick={() => setPoemType('QUICK')}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="text-left p-8 rounded-2xl glass-card border border-border glass-hover transition-all"
            >
              <motion.div 
                className="w-12 h-12 glass-card rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-6 h-6" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">Quick Poem</h3>
              <p className="font-nunito text-sm mb-4 text-muted-foreground">
                A poetic surprise ; no details needed
              </p>
              
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(pricing.quick.usd, 'USD')}
                  </span>
                  <span className="font-nunito text-sm text-muted-foreground">
                    / {formatCurrency(pricing.quick.kes, 'KES')}
                  </span>
                </div>
                <p className="font-nunito text-sm text-muted-foreground">24h delivery</p>
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setPoemType('CUSTOM')}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="text-left p-8 rounded-2xl glass-card border border-border glass-hover transition-all relative"
            >
              <motion.div 
                className="absolute top-4 right-4"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: smoothEasing }}
              >
                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-nunito font-bold">
                  Most Preferred
                </div>
              </motion.div>

              <motion.div 
                className="w-12 h-12 glass-card rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">Custom Poem</h3>
              <p className="font-nunito text-sm mb-4 text-muted-foreground">
                Personalized with your vision
              </p>
              
              <div className="space-y-1">
                <div className="text-xl font-bold">
                  {formatCurrency(pricing.custom.minUsd, 'USD')} - {formatCurrency(pricing.custom.maxUsd, 'USD')}
                </div>
                <div className="font-nunito text-sm text-muted-foreground">
                  {formatCurrency(pricing.custom.minKes, 'KES')} - {formatCurrency(pricing.custom.maxKes, 'KES')}
                </div>
                <p className="font-nunito text-sm text-muted-foreground mt-2">
                  6-12h delivery • You choose
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {poemType && (
          <motion.div
            key="form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: smoothEasing }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: smoothEasing }}
              className="mb-6 flex items-center justify-between"
            >
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
                className="font-nunito hover:scale-105 transition-transform duration-200"
              >
                Change Type
              </Button>
            </motion.div>

            <GlassCard className="p-8">
              {poemType === 'QUICK' ? (
                <form
                  onSubmit={quickForm.handleSubmit(handleQuickSubmit)}
                  className="space-y-6"
                >
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

                  <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                      <Label className="text-base font-nunito mb-3 block">Select Currency</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('KES')}
                          className={`p-4 rounded-lg font-nunito transition-all duration-300 border ${
                            currency === 'KES'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'glass-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-bold">KES (Ksh)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(pricing.quick.kes, 'KES')}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('USD')}
                          className={`p-4 rounded-lg font-nunito transition-all duration-300 border ${
                            currency === 'USD'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'glass-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-bold">USD ($)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(pricing.quick.usd, 'USD')}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-nunito mb-3 block">Payment Method</Label>
                      
                      {currency === 'KES' ? (
                        <div className="p-4 rounded-lg glass-card border border-primary bg-primary/5">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="font-bold">M-Pesa / Debit Card / Credit Card</div>
                              <div className="text-xs text-muted-foreground font-nunito">
                                Secure payment via Paystack
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('STRIPE')}
                            className={`p-4 rounded-lg font-nunito transition-all duration-300 border flex items-center gap-3 ${
                              paymentMethod === 'STRIPE'
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                : 'glass-card border-border hover:border-primary/50'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <div className="text-left flex-1">
                              <div className="font-bold text-sm">Credit / Debit Card</div>
                              <div className="text-xs opacity-80">Stripe</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('PAYPAL')}
                            className={`p-4 rounded-lg font-nunito transition-all duration-300 border flex items-center gap-3 ${
                              paymentMethod === 'PAYPAL'
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                : 'glass-card border-border hover:border-primary/50'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <div className="text-left flex-1">
                              <div className="font-bold text-sm">PayPal</div>
                              <div className="text-xs opacity-80">USD</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {((currency === 'KES' && paymentMethod === 'PAYPAL') || 
                      (currency === 'USD' && paymentMethod === 'PAYSTACK')) && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-nunito text-blue-200">
                          Your payment will be converted to {paymentMethod === 'PAYPAL' ? 'USD' : 'KES'} at checkout
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="glass-light rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-nunito text-muted-foreground">Your Price:</span>
                      <span className="text-3xl font-bold">
                        {getDisplayPrice()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-nunito text-muted-foreground">Delivery:</span>
                      <span className="font-nunito">Within 24 hours</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-nunito" 
                    size="lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={customForm.handleSubmit(handleCustomSubmit)}
                  className="space-y-6"
                >
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
                        onValueChange={(value) => {
                          customForm.setValue('mood', value);
                          setIsMoodOpen(false);
                        }}
                        onOpenChange={setIsMoodOpen}
                        open={isMoodOpen}
                      >
                        <SelectTrigger 
                          id="custom-mood" 
                          className="h-12 mt-2"
                        >
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
                      maxLength={1000}
                      className="mt-2 resize-none"
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
                        type="text"
                        inputMode="decimal"
                        value={customBudget}
                        onChange={handleBudgetChange}
                        onBlur={handleBudgetBlur}
                        className="h-14 text-2xl font-bold pl-14 pr-4"
                        placeholder={(currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes).toString()}
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center text-sm font-nunito">
                      <span className="text-muted-foreground">
                        Range: {formatCurrency(currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes, currency)} - {formatCurrency(currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes, currency)}
                      </span>
                      <span className="font-bold text-primary">
                        ≈ {deliveryTime} hours delivery
                      </span>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={setBudgetToMin}
                        className="px-3 py-1 text-xs rounded-lg glass-card font-nunito"
                      >
                        Min ({formatCurrency(currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes, currency)})
                      </button>
                      <button
                        type="button"
                        onClick={setBudgetToMid}
                        className="px-3 py-1 text-xs rounded-lg glass-card font-nunito"
                      >
                        Mid
                      </button>
                      <button
                        type="button"
                        onClick={setBudgetToMax}
                        className="px-3 py-1 text-xs rounded-lg glass-card font-nunito"
                      >
                        Max ({formatCurrency(currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes, currency)})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                      <Label className="text-base font-nunito mb-3 block">Select Currency</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('KES')}
                          className={`p-4 rounded-lg font-nunito transition-all duration-300 border ${
                            currency === 'KES'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'glass-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-bold">KES (Ksh)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(pricing.custom.minKes, 'KES')} - {formatCurrency(pricing.custom.maxKes, 'KES')}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange('USD')}
                          className={`p-4 rounded-lg font-nunito transition-all duration-300 border ${
                            currency === 'USD'
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                              : 'glass-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-bold">USD ($)</div>
                          <div className="text-sm opacity-80">
                            {formatCurrency(pricing.custom.minUsd, 'USD')} - {formatCurrency(pricing.custom.maxUsd, 'USD')}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-nunito mb-3 block">Payment Method</Label>
                      
                      {currency === 'KES' ? (
                        <div className="p-4 rounded-lg glass-card border border-primary bg-primary/5">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="font-bold">M-Pesa / Debit Card / Credit Card</div>
                              <div className="text-xs text-muted-foreground font-nunito">
                                Secure payment via Paystack
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('STRIPE')}
                            className={`p-4 rounded-lg font-nunito transition-all duration-300 border flex items-center gap-3 ${
                              paymentMethod === 'STRIPE'
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                : 'glass-card border-border hover:border-primary/50'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <div className="text-left flex-1">
                              <div className="font-bold text-sm">Credit / Debit Card</div>
                              <div className="text-xs opacity-80">Stripe</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('PAYPAL')}
                            className={`p-4 rounded-lg font-nunito transition-all duration-300 border flex items-center gap-3 ${
                              paymentMethod === 'PAYPAL'
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                : 'glass-card border-border hover:border-primary/50'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <div className="text-left flex-1">
                              <div className="font-bold text-sm">PayPal</div>
                              <div className="text-xs opacity-80">USD</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {((currency === 'KES' && paymentMethod === 'PAYPAL') || 
                      (currency === 'USD' && paymentMethod === 'PAYSTACK')) && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-nunito text-blue-200">
                          Your payment will be converted to {paymentMethod === 'PAYPAL' ? 'USD' : 'KES'} at checkout
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="glass-light rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-nunito text-muted-foreground">Your Price:</span>
                      <span className="text-3xl font-bold">
                        {currency === 'KES' 
                          ? `KES ${Math.round(customBudget)}` 
                          : `$${customBudget.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-nunito text-muted-foreground">Delivery:</span>
                      <span className="font-nunito">
                        ≈ {deliveryTime} hours
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-nunito" 
                    size="lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      'Proceed to Payment'
                    )}
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