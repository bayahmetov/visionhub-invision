-- Enum для типов университетов
CREATE TYPE public.university_type AS ENUM ('national', 'state', 'private', 'international');

-- Enum для уровней образования
CREATE TYPE public.degree_level AS ENUM ('bachelor', 'master', 'doctorate');

-- Enum для ролей пользователей
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Таблица университетов
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ru TEXT NOT NULL,
  name_kz TEXT,
  name_en TEXT,
  description_ru TEXT,
  description_kz TEXT,
  description_en TEXT,
  type university_type NOT NULL DEFAULT 'state',
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  founded_year INTEGER,
  students_count INTEGER,
  teachers_count INTEGER,
  ranking_national INTEGER,
  ranking_qs INTEGER,
  has_grants BOOLEAN DEFAULT false,
  has_dormitory BOOLEAN DEFAULT false,
  has_military_department BOOLEAN DEFAULT false,
  accreditation TEXT,
  mission_ru TEXT,
  mission_kz TEXT,
  mission_en TEXT,
  virtual_tour_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица направлений обучения
CREATE TABLE public.fields_of_study (
  id TEXT PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_kz TEXT,
  name_en TEXT,
  icon TEXT
);

-- Таблица программ
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  field_id TEXT REFERENCES public.fields_of_study(id),
  name_ru TEXT NOT NULL,
  name_kz TEXT,
  name_en TEXT,
  description_ru TEXT,
  description_kz TEXT,
  description_en TEXT,
  degree_level degree_level NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 4,
  language TEXT[] DEFAULT ARRAY['ru'],
  tuition_fee_kzt INTEGER,
  grants_available BOOLEAN DEFAULT false,
  ent_min_score INTEGER,
  employment_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица партнерств
CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  partner_country TEXT NOT NULL,
  partnership_type TEXT,
  description_ru TEXT,
  description_kz TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Таблица избранных университетов
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, university_id)
);

-- Включаем RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields_of_study ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Функция проверки роли (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS политики для universities (публичное чтение)
CREATE POLICY "Universities are viewable by everyone"
ON public.universities FOR SELECT
USING (true);

CREATE POLICY "Admins can manage universities"
ON public.universities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS политики для fields_of_study (публичное чтение)
CREATE POLICY "Fields are viewable by everyone"
ON public.fields_of_study FOR SELECT
USING (true);

-- RLS политики для programs (публичное чтение)
CREATE POLICY "Programs are viewable by everyone"
ON public.programs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage programs"
ON public.programs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS политики для partnerships (публичное чтение)
CREATE POLICY "Partnerships are viewable by everyone"
ON public.partnerships FOR SELECT
USING (true);

-- RLS политики для profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- RLS политики для user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS политики для favorites
CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
ON public.favorites FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Триггер для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();