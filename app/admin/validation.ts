import { z } from 'zod';
import { PriceMode, ProductMediaType, ProductStatus, Role } from '@prisma/client';

export const categorySchema = z.object({
  slug: z.string().min(2).max(64),
  nameFa: z.string().min(1).max(128),
  nameEn: z.string().min(1).max(128),
});

const emojiCharacters = (value: string): boolean => {
  const normalized = value.trim();
  if (!normalized) return false;
  const chars = Array.from(normalized);
  return chars.every((char) => /\p{Extended_Pictographic}/u.test(char));
};

export const productMediaSchema = z
  .object({
    type: z.nativeEnum(ProductMediaType),
    url: z.string().url().optional().nullable(),
    emoji: z.string().max(24).optional().nullable(),
    altFa: z.string().max(256).optional().nullable(),
    altEn: z.string().max(256).optional().nullable(),
    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((value, ctx) => {
    if (value.type === ProductMediaType.IMAGE) {
      if (!value.url) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL is required.' });
      } else if (!value.url.startsWith('https://')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Image URL must be https.' });
      }
      if (value.emoji) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Emoji must be empty for images.' });
      }
    }

    if (value.type === ProductMediaType.EMOJI) {
      if (!value.emoji || !emojiCharacters(value.emoji)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Emoji media must contain valid emojis.' });
      }
      if (value.url) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL must be empty for emoji media.' });
      }
    }
  });

export const productSchema = z
  .object({
    slug: z.string().min(2).max(128).optional(),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
    categoryId: z.string().uuid().nullable().optional(),
    titleFa: z.string().min(1),
    titleEn: z.string().min(1),
    shortFa: z.string().min(1),
    shortEn: z.string().min(1),
    descFa: z.string().min(1),
    descEn: z.string().min(1),
    priceMode: z.nativeEnum(PriceMode).default(PriceMode.UNAVAILABLE),
    priceAmount: z.number().nonnegative().optional().nullable(),
    priceNoteFa: z.string().max(180).optional().nullable(),
    priceNoteEn: z.string().max(180).optional().nullable(),
    commentsEnabled: z.boolean().optional(),
    specs: z.record(z.string(), z.any()).optional().nullable(),
    seoTitleFa: z.string().max(180).optional().nullable(),
    seoTitleEn: z.string().max(180).optional().nullable(),
    seoDescFa: z.string().max(240).optional().nullable(),
    seoDescEn: z.string().max(240).optional().nullable(),
    media: z.array(productMediaSchema).default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.priceMode === PriceMode.FIXED && (value.priceAmount === null || value.priceAmount === undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Fixed pricing requires a price amount.' });
    }
    if (value.priceMode !== PriceMode.FIXED && value.priceAmount != null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Non-fixed pricing cannot include a price amount.' });
    }
  })
  ;

export const inboxStatusSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
  isSpam: z.boolean().optional(),
});

export const replySchema = z.object({
  body: z.string().min(1),
  sendEmail: z.boolean().optional(),
});

export const adminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(Role),
  password: z.string().min(8),
});
