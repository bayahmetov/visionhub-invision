-- Allow admins to create reviews
DROP POLICY IF EXISTS "Students can create reviews" ON public.reviews;

CREATE POLICY "Students and admins can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND 
  (has_role(auth.uid(), 'student'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);