-- Update events to have future dates (January-March 2026)
UPDATE public.events SET 
  event_date = event_date + INTERVAL '1 year',
  end_date = CASE WHEN end_date IS NOT NULL THEN end_date + INTERVAL '1 year' ELSE NULL END
WHERE event_date < NOW();