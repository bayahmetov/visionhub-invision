-- Add unique constraint for reviews (one review per user per university)
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_university_unique UNIQUE (user_id, university_id);