import { z } from 'zod';

export const PoemTypeSchema = z.enum(['QUICK', 'CUSTOM']);

export const OrderStatusSchema = z.enum(['PENDING', 'PAID', 'WRITING', 'DELIVERED', 'CANCELLED']);

export const QuickPoemSchema = z.object({
  type: z.literal('QUICK'),
  email: z.string()
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  currency: z.enum(['USD', 'KES']),
});

export const CustomPoemSchema = z.object({
  type: z.literal('CUSTOM'),
  email: z.string()
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  mood: z.string().min(1, 'Please select a mood'),
  instructions: z.string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .trim()
    .optional(),
  budget: z.number().positive().min(0.5).max(1000),
  currency: z.enum(['USD', 'KES']),
});

export const CommissionSchema = z.discriminatedUnion('type', [
  QuickPoemSchema,
  CustomPoemSchema,
]);

export const DeliverPoemSchema = z.object({
  orderId: z.string().uuid(),
  poemContent: z.string()
    .min(20, 'Poem must be at least 20 characters')
    .max(5000, 'Poem exceeds maximum length')
    .trim(),
});

export const SampleWorkSchema = z.object({
  title: z.string().min(3, 'Title required').max(100).trim(),
  content: z.string().min(20).max(5000).trim(),
  mood: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isVisible: z.boolean().default(true),
});

export const UpdateSampleWorkSchema = SampleWorkSchema.extend({
  id: z.string().uuid(),
});

export const ReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  name: z.string().max(50).trim().optional(),
  comment: z.string().min(10).max(500).trim(),
});

export type QuickPoemInput = z.infer<typeof QuickPoemSchema>;
export type CustomPoemInput = z.infer<typeof CustomPoemSchema>;
export type CommissionInput = z.infer<typeof CommissionSchema>;
export type DeliverPoemInput = z.infer<typeof DeliverPoemSchema>;
export type SampleWorkInput = z.infer<typeof SampleWorkSchema>;
export type UpdateSampleWorkInput = z.infer<typeof UpdateSampleWorkSchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;