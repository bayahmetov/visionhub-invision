-- Delete duplicate universities (keep ones with programs)
-- First delete related records from child tables

DELETE FROM university_fields WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM university_views WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM favorites WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM reviews WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM announcements WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM events WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');
DELETE FROM partnerships WHERE university_id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');

-- Delete the duplicate universities
DELETE FROM universities WHERE id IN ('81c5f2fd-41c9-4f29-8cda-ed176a09e880', 'f5c93637-e8ae-464e-93a1-1c9af9ef0e73');

-- Update coordinates for all universities

-- ЕНУ им. Гумилёва (Астана)
UPDATE universities SET latitude = 51.1605, longitude = 71.4704 
WHERE id = '616bad49-2f4e-456e-9c40-a7bbad677183';

-- МУИТ (Алматы)
UPDATE universities SET latitude = 43.2380, longitude = 76.9120 
WHERE id = '054af66c-1e7e-4bf0-87c4-61973d823b20';

-- inVision U by inDrive (Алматы)
UPDATE universities SET latitude = 43.2380, longitude = 76.9450 
WHERE id = '097a3b10-728b-4e83-b39c-ea63e5e55e3b';

-- Казахский национальный медицинский университет (Алматы)
UPDATE universities SET latitude = 43.2340, longitude = 76.9430 
WHERE id = '8fb02874-a69f-48fa-ba3b-caf62e10c560';

-- Казахский национальный университет им. аль-Фараби (Алматы)
UPDATE universities SET latitude = 43.2186, longitude = 76.9266 
WHERE id = '0f4d48d2-ba9b-462d-bf9e-c0768667f9aa';

-- Казахстанско-Британский технический университет (Алматы)
UPDATE universities SET latitude = 43.2350, longitude = 76.9530 
WHERE id = 'd0ef4f16-2ff4-40fe-88f0-65ffbf81b1fc';