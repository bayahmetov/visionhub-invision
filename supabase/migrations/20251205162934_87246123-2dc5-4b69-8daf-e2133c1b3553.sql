-- Create junction table for university fields
CREATE TABLE public.university_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES public.fields_of_study(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(university_id, field_id)
);

-- Enable RLS
ALTER TABLE public.university_fields ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "University fields are viewable by everyone"
ON public.university_fields
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage university fields"
ON public.university_fields
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "University users can manage own fields"
ON public.university_fields
FOR ALL
USING (can_manage_university(auth.uid(), university_id));