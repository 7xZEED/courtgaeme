
-- Add new columns
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

-- Migrate any 'family' rows to 'ex_to_ex' so future CHECK constraints don't fail
UPDATE public.cases SET category = 'ex_to_ex' WHERE category = 'family';

-- Replace public SELECT policy to hide is_hidden=true
DROP POLICY IF EXISTS "Anyone can read cases" ON public.cases;
CREATE POLICY "Anyone can read non-hidden cases"
  ON public.cases FOR SELECT
  TO public
  USING (is_hidden = false);

-- Index for admin/public filtering
CREATE INDEX IF NOT EXISTS cases_is_hidden_idx ON public.cases (is_hidden);
CREATE INDEX IF NOT EXISTS cases_is_featured_idx ON public.cases (is_featured);
