-- Create enums
CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE', 'EMOJI');
CREATE TYPE "PriceMode" AS ENUM ('FIXED', 'CONTACT', 'NEGOTIABLE', 'FREE', 'UNAVAILABLE');

-- Extend Product with pricing + comments controls
ALTER TABLE "Product"
  ADD COLUMN "priceMode" "PriceMode" NOT NULL DEFAULT 'UNAVAILABLE',
  ADD COLUMN "priceAmount" DECIMAL(65,30),
  ADD COLUMN "priceNoteFa" TEXT,
  ADD COLUMN "priceNoteEn" TEXT,
  ADD COLUMN "commentsEnabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Product"
  SET "priceMode" = CASE WHEN "price" IS NOT NULL THEN 'FIXED' ELSE 'UNAVAILABLE' END,
      "priceAmount" = "price";

ALTER TABLE "Product" DROP COLUMN "price";

-- Create ProductMedia
CREATE TABLE "ProductMedia" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "ProductMediaType" NOT NULL,
  "url" TEXT,
  "emoji" TEXT,
  "altFa" TEXT,
  "altEn" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductMedia"
  ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ProductMedia" ("id", "productId", "type", "url", "altFa", "altEn", "sortOrder", "createdAt")
  SELECT "id", "productId", 'IMAGE', "url", "altFa", "altEn", "sortOrder", "createdAt"
  FROM "ProductImage";

DROP TABLE "ProductImage";

-- Ensure InboxItem cascades with Product deletes
ALTER TABLE "InboxItem" DROP CONSTRAINT "InboxItem_productId_fkey";
ALTER TABLE "InboxItem"
  ADD CONSTRAINT "InboxItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Site settings
CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "commentsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
