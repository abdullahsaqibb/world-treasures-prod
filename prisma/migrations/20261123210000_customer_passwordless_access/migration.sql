-- Prepared for isolated development migration. No production data changed.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customerIdentityEnabled" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "CustomerLoginChallenge" (
 "id" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "tokenHash" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "consumedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CustomerLoginChallenge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerLoginChallenge_tokenHash_key" ON "CustomerLoginChallenge"("tokenHash");
CREATE INDEX "CustomerLoginChallenge_email_createdAt_idx" ON "CustomerLoginChallenge"("email","createdAt");
CREATE INDEX "CustomerLoginChallenge_expiresAt_idx" ON "CustomerLoginChallenge"("expiresAt");
CREATE TABLE "CustomerSession" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "tokenHash" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "revokedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomerSession_tokenHash_key" ON "CustomerSession"("tokenHash");
CREATE INDEX "CustomerSession_userId_expiresAt_idx" ON "CustomerSession"("userId","expiresAt");
ALTER TABLE "CustomerSession" ADD CONSTRAINT "CustomerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
