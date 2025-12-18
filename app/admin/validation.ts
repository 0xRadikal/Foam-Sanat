import { z } from 'zod';
import { ProductStatus, Role } from '@prisma/client';

export const categorySchema = z.object({
  slug: z.string().min(2).max(64),
  nameFa: z.string().min(1).max(128),
  nameEn: z.string().min(1).max(128),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  altFa: z.string().max(256).optional().nullable(),
  altEn: z.string().max(256).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  slug: z.string().min(2).max(128).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  categoryId: z.string().uuid().nullable().optional(),
  titleFa: z.string().min(1),
  titleEn: z.string().min(1),
  shortFa: z.string().min(1),
  shortEn: z.string().min(1),
  descFa: z.string().min(1),
  descEn: z.string().min(1),
  price: z
    .number()
    .nonnegative()
    .optional()
    .nullable(),
  specs: z.record(z.string(), z.any()).optional().nullable(),
  seoTitleFa: z.string().max(180).optional().nullable(),
  seoTitleEn: z.string().max(180).optional().nullable(),
  seoDescFa: z.string().max(240).optional().nullable(),
  seoDescEn: z.string().max(240).optional().nullable(),
  images: z.array(productImageSchema).default([]),
  publishedAt: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

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
