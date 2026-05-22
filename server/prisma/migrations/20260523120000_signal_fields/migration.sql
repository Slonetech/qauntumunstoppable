-- Expand Signal model for live feed (bias, confidencePct, entryPrice, timeframe, modelVersion)
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "bias" TEXT;
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "confidencePct" INTEGER;
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "entryPrice" DECIMAL(18,8);
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "timeframe" TEXT;
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "modelVersion" TEXT;

-- Migrate legacy columns if present
UPDATE "Signal" SET "entryPrice" = "entry" WHERE "entryPrice" IS NULL AND "entry" IS NOT NULL;
UPDATE "Signal" SET "confidencePct" = "confidence" WHERE "confidencePct" IS NULL AND "confidence" IS NOT NULL;
UPDATE "Signal" SET "bias" = CASE WHEN "action" = 'BUY' THEN 'Bullish' ELSE 'Bearish' END WHERE "bias" IS NULL;
UPDATE "Signal" SET "timeframe" = '15M' WHERE "timeframe" IS NULL;
UPDATE "Signal" SET "modelVersion" = 'v4.2' WHERE "modelVersion" IS NULL;

ALTER TABLE "Signal" DROP COLUMN IF EXISTS "confidence";
ALTER TABLE "Signal" DROP COLUMN IF EXISTS "entry";

ALTER TABLE "Signal" ALTER COLUMN "bias" SET NOT NULL;
ALTER TABLE "Signal" ALTER COLUMN "confidencePct" SET NOT NULL;
ALTER TABLE "Signal" ALTER COLUMN "entryPrice" SET NOT NULL;
ALTER TABLE "Signal" ALTER COLUMN "timeframe" SET NOT NULL;
ALTER TABLE "Signal" ALTER COLUMN "modelVersion" SET NOT NULL;
