-- Create enum for alert severity
CREATE TYPE alert_severity AS ENUM ('high', 'medium', 'low');

-- Create enum for alert source
CREATE TYPE alert_source AS ENUM ('satellite', 'citizen', 'sensor');

-- Create flood_alerts table
CREATE TABLE public.flood_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  severity alert_severity NOT NULL,
  source alert_source NOT NULL,
  actions TEXT[] NOT NULL DEFAULT '{}',
  affected_areas TEXT[] NOT NULL DEFAULT '{}',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create safe_shelters table
CREATE TABLE public.safe_shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  current_capacity INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  address TEXT,
  distance_km DECIMAL(6, 2),
  direction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flood_reports table
CREATE TABLE public.flood_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  severity TEXT,
  classification TEXT,
  confidence DECIMAL(5, 2),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  notified_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  message TEXT NOT NULL,
  sentiment TEXT,
  sentiment_score DECIMAL(4, 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flood_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (emergency data should be publicly accessible)
CREATE POLICY "Anyone can view flood alerts"
  ON public.flood_alerts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view safe shelters"
  ON public.safe_shelters FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view flood reports"
  ON public.flood_reports FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert flood reports"
  ON public.flood_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_flood_alerts_severity ON public.flood_alerts(severity);
CREATE INDEX idx_flood_alerts_time ON public.flood_alerts(time DESC);
CREATE INDEX idx_flood_alerts_location ON public.flood_alerts(latitude, longitude);
CREATE INDEX idx_safe_shelters_location ON public.safe_shelters(latitude, longitude);
CREATE INDEX idx_feedback_created ON public.feedback(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_flood_alerts_updated_at
  BEFORE UPDATE ON public.flood_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safe_shelters_updated_at
  BEFORE UPDATE ON public.safe_shelters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for flood_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.flood_alerts;