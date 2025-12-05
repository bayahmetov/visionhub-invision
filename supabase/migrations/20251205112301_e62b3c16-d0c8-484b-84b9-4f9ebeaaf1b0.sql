-- First drop dependent policies
DROP POLICY IF EXISTS "Admins can manage universities" ON public.universities;
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;

-- Drop the function that depends on old enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Now we can safely change the enum
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('admin', 'student', 'university');

-- Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE app_role USING 
    CASE 
      WHEN role::text = 'user' THEN 'student'::app_role
      WHEN role::text = 'moderator' THEN 'university'::app_role
      ELSE role::text::app_role
    END,
  ALTER COLUMN role SET DEFAULT 'student'::app_role;

DROP TYPE app_role_old;

-- Recreate has_role function with new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Recreate admin policies
CREATE POLICY "Admins can manage universities" ON public.universities
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage programs" ON public.programs
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add university_id to profiles for university role users
ALTER TABLE public.profiles 
ADD COLUMN university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL;

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, university_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON public.reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  public.has_role(auth.uid(), 'student')
);

CREATE POLICY "Students can update own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can delete own reviews" ON public.reviews
FOR DELETE USING (auth.uid() = user_id);

-- Function to check if university user can access university
CREATE OR REPLACE FUNCTION public.can_manage_university(_user_id uuid, _university_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = _user_id
      AND p.university_id = _university_id
  ) AND public.has_role(_user_id, 'university')
$$;

-- University users can manage own university
CREATE POLICY "University users can manage own university" ON public.universities
FOR ALL USING (public.can_manage_university(auth.uid(), id));

-- University users can manage own programs
CREATE POLICY "University users can manage own programs" ON public.programs
FOR ALL USING (public.can_manage_university(auth.uid(), university_id));

-- University users can manage own partnerships  
CREATE POLICY "University users can manage own partnerships" ON public.partnerships
FOR ALL USING (public.can_manage_university(auth.uid(), university_id));

-- Admin can manage partnerships
CREATE POLICY "Admins can manage partnerships" ON public.partnerships
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to use new default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student');
  
  RETURN new;
END;
$$;

-- Trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();