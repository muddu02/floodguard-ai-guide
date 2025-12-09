-- Create table for logging flood risk predictions
CREATE TABLE public.flood_risk_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rainfall_mm_last_24h NUMERIC NOT NULL,
  river_level_m NUMERIC NOT NULL,
  soil_moisture_pct NUMERIC NOT NULL,
  elevation_m NUMERIC NOT NULL,
  distance_to_river_km NUMERIC NOT NULL,
  population_density_per_sqkm NUMERIC NOT NULL,
  historical_flood_events INTEGER NOT NULL,
  predicted_risk_label TEXT NOT NULL,
  predicted_risk_score NUMERIC NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.flood_risk_predictions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert predictions (public form)
CREATE POLICY "Anyone can insert flood risk predictions" 
ON public.flood_risk_predictions 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view predictions (for analytics)
CREATE POLICY "Anyone can view flood risk predictions" 
ON public.flood_risk_predictions 
FOR SELECT 
USING (true);