-- Create storage bucket for university images
INSERT INTO storage.buckets (id, name, public)
VALUES ('university-images', 'university-images', true);

-- Allow anyone to view university images (public bucket)
CREATE POLICY "University images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'university-images');

-- Allow admins to upload university images
CREATE POLICY "Admins can upload university images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'university-images' AND has_role(auth.uid(), 'admin'));

-- Allow university users to upload images for their university
CREATE POLICY "University users can upload their images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'university-images' AND 
  has_role(auth.uid(), 'university')
);

-- Allow admins to update university images
CREATE POLICY "Admins can update university images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'university-images' AND has_role(auth.uid(), 'admin'));

-- Allow admins to delete university images
CREATE POLICY "Admins can delete university images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'university-images' AND has_role(auth.uid(), 'admin'));

-- Allow university users to update/delete their images
CREATE POLICY "University users can update their images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'university-images' AND has_role(auth.uid(), 'university'));

CREATE POLICY "University users can delete their images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'university-images' AND has_role(auth.uid(), 'university'));