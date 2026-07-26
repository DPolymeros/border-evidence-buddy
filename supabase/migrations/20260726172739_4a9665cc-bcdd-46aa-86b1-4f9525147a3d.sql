CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evidence_id text NOT NULL,
  case_number text NOT NULL DEFAULT '',
  date_time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  border_point text NOT NULL DEFAULT '',
  officer_name text NOT NULL DEFAULT '',
  badge_id text NOT NULL DEFAULT '',
  agency text NOT NULL DEFAULT '',
  witness_name text NOT NULL DEFAULT '',
  witness_id text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  make text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  serial text NOT NULL DEFAULT '',
  imei text NOT NULL DEFAULT '',
  condition text NOT NULL DEFAULT '',
  power text NOT NULL DEFAULT 'unknown',
  screen_locked text NOT NULL DEFAULT 'unknown',
  encryption text NOT NULL DEFAULT 'unknown',
  network text NOT NULL DEFAULT '',
  circumstances text NOT NULL DEFAULT '',
  photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, evidence_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own incidents"
  ON public.incidents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX incidents_user_created_idx ON public.incidents (user_id, created_at DESC);