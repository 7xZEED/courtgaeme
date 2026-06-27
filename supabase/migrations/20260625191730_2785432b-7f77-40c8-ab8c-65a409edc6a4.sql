
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('bf_gf','situationship','friend','family','group_chat','gaming')),
  role text NOT NULL CHECK (role IN ('plaintiff','defendant')),
  title text NOT NULL,
  story text NOT NULL,
  defendant_response text,
  judge_personality text NOT NULL DEFAULT 'brutal' CHECK (judge_personality IN ('brutal','genz','wise','chaotic')),
  verdict jsonb,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('pending','ready','failed')),
  votes_a integer NOT NULL DEFAULT 0,
  votes_b integer NOT NULL DEFAULT 0,
  votes_both integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cases_created_at_idx ON public.cases (created_at DESC);
CREATE INDEX cases_category_idx ON public.cases (category);

GRANT SELECT, INSERT ON public.cases TO anon;
GRANT SELECT, INSERT ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Anyone can submit a case" ON public.cases FOR INSERT WITH CHECK (
  status = 'pending' AND verdict IS NULL AND votes_a = 0 AND votes_b = 0 AND votes_both = 0 AND view_count = 0
);

-- RPC: cast a jury vote
CREATE OR REPLACE FUNCTION public.cast_jury_vote(p_case_id uuid, p_choice text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_choice NOT IN ('a','b','both') THEN
    RAISE EXCEPTION 'invalid choice';
  END IF;
  IF p_choice = 'a' THEN
    UPDATE public.cases SET votes_a = votes_a + 1 WHERE id = p_case_id;
  ELSIF p_choice = 'b' THEN
    UPDATE public.cases SET votes_b = votes_b + 1 WHERE id = p_case_id;
  ELSE
    UPDATE public.cases SET votes_both = votes_both + 1 WHERE id = p_case_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_jury_vote(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_case_views(p_case_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.cases SET view_count = view_count + 1 WHERE id = p_case_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_case_views(uuid) TO anon, authenticated;
