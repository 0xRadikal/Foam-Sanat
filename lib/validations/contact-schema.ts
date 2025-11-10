import { z } from 'zod';

const phoneMessage = 'Phone number must be at least 7 characters long.';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Please provide a valid email address.'),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine((value) => !value || value.length >= 7, phoneMessage),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  turnstileToken: z.string().min(1, 'Turnstile token is required.'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const contactApiSchema = contactFormSchema.extend({
  phone: z.string().min(7, phoneMessage).optional(),
});

export type ContactApiPayload = z.infer<typeof contactApiSchema>;
