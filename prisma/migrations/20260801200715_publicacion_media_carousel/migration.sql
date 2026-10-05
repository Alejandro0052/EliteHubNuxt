-- AlterTable: introduce the ordered media array
ALTER TABLE "Publicacion" ADD COLUMN "media" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: preserve any existing single image/video from the superseded columns
UPDATE "Publicacion" SET "media" = ARRAY["imagen"] WHERE "imagen" IS NOT NULL;
UPDATE "Publicacion" SET "media" = ARRAY["video"] WHERE "video" IS NOT NULL AND "imagen" IS NULL;

-- AlterTable: drop the superseded single-attachment columns
ALTER TABLE "Publicacion" DROP COLUMN "imagen";
ALTER TABLE "Publicacion" DROP COLUMN "video";
