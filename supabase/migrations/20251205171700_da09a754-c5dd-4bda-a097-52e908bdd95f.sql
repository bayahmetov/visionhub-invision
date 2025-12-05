-- Update coordinates for existing universities without them
UPDATE public.universities SET latitude = 43.2380, longitude = 76.9123 WHERE name_ru LIKE '%КазНУ%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 43.2350, longitude = 76.9450 WHERE name_ru LIKE '%КБТУ%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 51.0895, longitude = 71.4000 WHERE name_ru LIKE '%Назарбаев%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 43.2557, longitude = 76.9286 WHERE name_ru LIKE '%КИМЭП%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 43.2200, longitude = 76.9300 WHERE name_ru LIKE '%КазНПУ%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 43.2300, longitude = 76.9200 WHERE name_ru LIKE '%КазНИТУ%' AND latitude IS NULL;
UPDATE public.universities SET latitude = 51.1280, longitude = 71.4305 WHERE name_ru LIKE '%МУИТ%' AND latitude IS NULL;