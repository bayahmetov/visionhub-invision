-- Allow admins to manage fields_of_study
CREATE POLICY "Admins can insert fields"
ON public.fields_of_study
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fields"
ON public.fields_of_study
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fields"
ON public.fields_of_study
FOR DELETE
USING (has_role(auth.uid(), 'admin'));