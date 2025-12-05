-- Add rector information and achievements to universities
ALTER TABLE public.universities
ADD COLUMN IF NOT EXISTS rector_name text,
ADD COLUMN IF NOT EXISTS rector_photo_url text,
ADD COLUMN IF NOT EXISTS achievements text[];

-- Add admission dates
ALTER TABLE public.universities
ADD COLUMN IF NOT EXISTS admission_start_date date,
ADD COLUMN IF NOT EXISTS admission_end_date date;