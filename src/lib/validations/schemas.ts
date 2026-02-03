import { z } from 'zod';

/**
 * Poem Type Enum
 */
export const PoemTypeSchema = z.enum(['QUICK', 'CUSTOM']);

/**
 * Order Status Enum
 */
export const OrderStatusSchema = z.enum(['PENDING', 'WRITING', 'DELIVERED', 'CANCELLED']);

/**
 * Quick Poem Commission Schema
 */
export const QuickPoemSchema = z.object({
  type: z.literal('QUICK'),
  email: z.string().email('Please enter a valid email address'),
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(100, 'Topic must be less than 100 characters'),
  paymentMethod: z.enum(['paypal', 'mpesa']),
  currency: z.enum(['USD', 'KES']),
});

/**
 * Custom Poem Commission Schema
 */
export const CustomPoemSchema = z.object({
  type: z.literal('CUSTOM'),
  email: z.string().email('Please enter a valid email address'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  topic: z
    .string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(500, 'Topic must be less than 500 characters'),
  mood: z.string().min(1, 'Please select a mood'),
  recipient: z.string().optional(),
  instructions: z.string().optional(),
  urgency: z.number().int().min(6).max(24), // 6, 12, or 24 hours
  paymentMethod: z.enum(['paypal', 'mpesa']),
  currency: z.enum(['USD', 'KES']),
});

/**
 * Union of both commission types
 */
export const CommissionSchema = z.discriminatedUnion('type', [
  QuickPoemSchema,
  CustomPoemSchema,
]);

/**
 * Order tracking by email
 */
export const OrderTrackingSchema = z.object({
  orderId: z.string().uuid(),
  email: z.string().email(),
});

/**
 * Admin - Deliver Poem Schema
 */
export const DeliverPoemSchema = z.object({
  orderId: z.string().uuid(),
  poemContent: z
    .string()
    .min(20, 'Poem must be at least 20 characters')
    .max(5000, 'Poem exceeds maximum length'),
});

/**
 * Admin - Update Order Status
 */
export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: OrderStatusSchema,
});

/**
 * Sample Work Schema (Admin CMS)
 */
export const SampleWorkSchema = z.object({
  title: z.string().min(3, 'Title required').max(100),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(20).max(5000),
  imageUrl: z.string().url('Invalid image URL'),
  mood: z.string().optional(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

/**
 * Update Sample Work Schema
 */
export const UpdateSampleWorkSchema = SampleWorkSchema.extend({
  id: z.string().uuid(),
});

/**
 * Price Validation Schema
 * Ensures client-side price matches server calculation
 */
export const PriceValidationSchema = z.object({
  type: PoemTypeSchema,
  urgency: z.number().int().optional(),
  clientPrice: z.number().positive(),
  currency: z.enum(['USD', 'KES']),
});

/**
 * Type exports for TypeScript
 */
export type QuickPoemInput = z.infer<typeof QuickPoemSchema>;
export type CustomPoemInput = z.infer<typeof CustomPoemSchema>;
export type CommissionInput = z.infer<typeof CommissionSchema>;
export type DeliverPoemInput = z.infer<typeof DeliverPoemSchema>;
export type SampleWorkInput = z.infer<typeof SampleWorkSchema>;
export type UpdateSampleWorkInput = z.infer<typeof UpdateSampleWorkSchema>;
