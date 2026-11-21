-- Preview-only owner login throttling; use development Neon database first.
CREATE TABLE IF NOT EXISTS "AdminLoginAttempt" (
  "key" TEXT PRIMARY KEY,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
