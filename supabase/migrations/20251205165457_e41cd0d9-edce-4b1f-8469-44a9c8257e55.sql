-- 1. Events table for calendar
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  title_ru TEXT NOT NULL,
  title_kz TEXT,
  title_en TEXT,
  description_ru TEXT,
  description_kz TEXT,
  description_en TEXT,
  event_type TEXT NOT NULL DEFAULT 'open_day', -- open_day, webinar, deadline, olympiad, other
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "University users can manage own events" ON public.events FOR ALL USING (can_manage_university(auth.uid(), university_id));

-- 2. Cities table for city guide
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_kz TEXT,
  name_en TEXT,
  region TEXT NOT NULL,
  population INTEGER,
  description_ru TEXT,
  description_kz TEXT,
  description_en TEXT,
  cost_of_living_kzt INTEGER, -- average monthly
  dormitory_cost_kzt INTEGER,
  rent_cost_kzt INTEGER,
  transport_info_ru TEXT,
  transport_info_kz TEXT,
  transport_info_en TEXT,
  safety_rating INTEGER, -- 1-5
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  title_ru TEXT NOT NULL,
  title_kz TEXT,
  title_en TEXT,
  content_ru TEXT NOT NULL,
  content_kz TEXT,
  content_en TEXT,
  announcement_type TEXT NOT NULL DEFAULT 'news', -- news, scholarship, admission_change, new_program, special
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "University users can manage own announcements" ON public.announcements FOR ALL USING (can_manage_university(auth.uid(), university_id));

-- 4. Articles/Blog table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id),
  title_ru TEXT NOT NULL,
  title_kz TEXT,
  title_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  excerpt_ru TEXT,
  excerpt_kz TEXT,
  excerpt_en TEXT,
  content_ru TEXT NOT NULL,
  content_kz TEXT,
  content_en TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'guide', -- guide, story, interview, news
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. User roadmap tasks
CREATE TABLE public.user_roadmap_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_key TEXT NOT NULL, -- predefined task key
  title_ru TEXT NOT NULL,
  title_kz TEXT,
  title_en TEXT,
  description_ru TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, task_key)
);

ALTER TABLE public.user_roadmap_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.user_roadmap_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON public.user_roadmap_tasks FOR ALL USING (auth.uid() = user_id);

-- 6. User documents storage
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- certificate, diploma, motivation_letter, other
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own documents" ON public.user_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON public.user_documents FOR ALL USING (auth.uid() = user_id);

-- 7. Extend profiles with applicant data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ent_score INTEGER,
ADD COLUMN IF NOT EXISTS expected_ent_score INTEGER,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS preferred_cities TEXT[],
ADD COLUMN IF NOT EXISTS preferred_fields TEXT[],
ADD COLUMN IF NOT EXISTS budget_max_kzt INTEGER,
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS english_level TEXT, -- A1, A2, B1, B2, C1, C2
ADD COLUMN IF NOT EXISTS target_degree TEXT; -- bachelor, master, phd

-- 8. Favorites with priority
ALTER TABLE public.favorites
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 9. University statistics views
CREATE TABLE public.university_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source_city TEXT,
  source_country TEXT
);

ALTER TABLE public.university_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create views" ON public.university_views FOR INSERT WITH CHECK (true);
CREATE POLICY "University users can view own stats" ON public.university_views FOR SELECT USING (can_manage_university(auth.uid(), university_id));
CREATE POLICY "Admins can view all stats" ON public.university_views FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);