-- Run this SQL in your Supabase project's SQL Editor

-- Areas
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Sub-areas
CREATE TABLE IF NOT EXISTS sub_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid REFERENCES areas(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Items
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  sub_area_id uuid REFERENCES sub_areas(id) ON DELETE SET NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'pcs',
  condition text CHECK (condition IN ('new', 'good', 'fair', 'poor')) DEFAULT 'good',
  photo_url text,
  tags text[] DEFAULT '{}',
  notes text,
  date_added timestamptz DEFAULT now(),
  date_updated timestamptz DEFAULT now()
);

-- Removal log
CREATE TABLE IF NOT EXISTS removal_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  area_name text,
  quantity_removed numeric NOT NULL,
  reason text CHECK (reason IN ('used', 'discarded', 'given away', 'sold', 'moved')) NOT NULL,
  date timestamptz DEFAULT now(),
  notes text
);

-- Auto-update date_updated
CREATE OR REPLACE FUNCTION update_date_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_date_updated
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_date_updated();

-- Storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read of photos
CREATE POLICY "Public read item photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload item photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-photos');

CREATE POLICY "Authenticated update item photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'item-photos');

-- Row Level Security (open for single-user personal app)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE removal_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all areas" ON areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all sub_areas" ON sub_areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all removal_log" ON removal_log FOR ALL USING (true) WITH CHECK (true);
