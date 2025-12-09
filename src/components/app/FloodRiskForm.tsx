import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Brain, Droplets, Waves, Mountain, MapPin, Users, History, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";

interface PredictionResult {
  risk_label: "Low" | "Medium" | "High";
  risk_score: number;
  explanation: string;
}

interface FormData {
  rainfall_mm_last_24h: string;
  river_level_m: string;
  soil_moisture_pct: string;
  elevation_m: string;
  distance_to_river_km: string;
  population_density_per_sqkm: string;
  historical_flood_events: string;
}

const initialFormData: FormData = {
  rainfall_mm_last_24h: "",
  river_level_m: "",
  soil_moisture_pct: "",
  elevation_m: "",
  distance_to_river_km: "",
  population_density_per_sqkm: "",
  historical_flood_events: "",
};

const FloodRiskForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    const numericFields: { key: keyof FormData; name: string; min: number; max: number }[] = [
      { key: "rainfall_mm_last_24h", name: "Rainfall", min: 0, max: 500 },
      { key: "river_level_m", name: "River Level", min: 0, max: 15 },
      { key: "soil_moisture_pct", name: "Soil Moisture", min: 0, max: 100 },
      { key: "elevation_m", name: "Elevation", min: 0, max: 1000 },
      { key: "distance_to_river_km", name: "Distance to River", min: 0, max: 50 },
      { key: "population_density_per_sqkm", name: "Population Density", min: 0, max: 50000 },
      { key: "historical_flood_events", name: "Historical Flood Events", min: 0, max: 100 },
    ];

    for (const field of numericFields) {
      const value = formData[field.key];
      if (!value.trim()) {
        errors.push(`${field.name} is required`);
        continue;
      }
      const num = parseFloat(value);
      if (isNaN(num)) {
        errors.push(`${field.name} must be a valid number`);
      } else if (num < field.min || num > field.max) {
        errors.push(`${field.name} must be between ${field.min} and ${field.max}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flood-predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            rainfall_mm_last_24h: parseFloat(formData.rainfall_mm_last_24h),
            river_level_m: parseFloat(formData.river_level_m),
            soil_moisture_pct: parseFloat(formData.soil_moisture_pct),
            elevation_m: parseFloat(formData.elevation_m),
            distance_to_river_km: parseFloat(formData.distance_to_river_km),
            population_density_per_sqkm: parseFloat(formData.population_density_per_sqkm),
            historical_flood_events: parseInt(formData.historical_flood_events, 10),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Prediction failed");
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);

      toast({
        title: "Prediction Complete",
        description: `Risk Level: ${result.risk_label}`,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (label: string) => {
    switch (label) {
      case "Low":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "High":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (label: string) => {
    switch (label) {
      case "Low":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Medium":
        return <Info className="w-5 h-5 text-yellow-600" />;
      case "High":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <CardTitle>AI Flood Risk Prediction</CardTitle>
        </div>
        <CardDescription>
          Enter environmental data to get an AI-powered flood risk assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rainfall */}
            <div className="space-y-2">
              <Label htmlFor="rainfall" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Rainfall (last 24h, mm)
              </Label>
              <Input
                id="rainfall"
                type="number"
                step="0.1"
                placeholder="e.g., 50"
                value={formData.rainfall_mm_last_24h}
                onChange={(e) => handleInputChange("rainfall_mm_last_24h", e.target.value)}
              />
            </div>

            {/* River Level */}
            <div className="space-y-2">
              <Label htmlFor="riverLevel" className="flex items-center gap-2">
                <Waves className="w-4 h-4" />
                River Level (m)
              </Label>
              <Input
                id="riverLevel"
                type="number"
                step="0.01"
                placeholder="e.g., 3.5"
                value={formData.river_level_m}
                onChange={(e) => handleInputChange("river_level_m", e.target.value)}
              />
            </div>

            {/* Soil Moisture */}
            <div className="space-y-2">
              <Label htmlFor="soilMoisture" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Soil Moisture (%)
              </Label>
              <Input
                id="soilMoisture"
                type="number"
                step="0.1"
                placeholder="e.g., 65"
                value={formData.soil_moisture_pct}
                onChange={(e) => handleInputChange("soil_moisture_pct", e.target.value)}
              />
            </div>

            {/* Elevation */}
            <div className="space-y-2">
              <Label htmlFor="elevation" className="flex items-center gap-2">
                <Mountain className="w-4 h-4" />
                Elevation (m)
              </Label>
              <Input
                id="elevation"
                type="number"
                step="0.1"
                placeholder="e.g., 150"
                value={formData.elevation_m}
                onChange={(e) => handleInputChange("elevation_m", e.target.value)}
              />
            </div>

            {/* Distance to River */}
            <div className="space-y-2">
              <Label htmlFor="distanceRiver" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Distance to River (km)
              </Label>
              <Input
                id="distanceRiver"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5"
                value={formData.distance_to_river_km}
                onChange={(e) => handleInputChange("distance_to_river_km", e.target.value)}
              />
            </div>

            {/* Population Density */}
            <div className="space-y-2">
              <Label htmlFor="populationDensity" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Population Density (per sqkm)
              </Label>
              <Input
                id="populationDensity"
                type="number"
                step="1"
                placeholder="e.g., 2500"
                value={formData.population_density_per_sqkm}
                onChange={(e) => handleInputChange("population_density_per_sqkm", e.target.value)}
              />
            </div>

            {/* Historical Flood Events */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="historicalFloods" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historical Flood Events (count)
              </Label>
              <Input
                id="historicalFloods"
                type="number"
                step="1"
                placeholder="e.g., 3"
                value={formData.historical_flood_events}
                onChange={(e) => handleInputChange("historical_flood_events", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Predict Flood Risk
              </>
            )}
          </Button>
        </form>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {getRiskIcon(prediction.risk_label)}
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge className={getRiskColor(prediction.risk_label)}>
                    {prediction.risk_label}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(prediction.risk_score * 100)}%
                </p>
              </div>
            </div>

            <Alert
              className={
                prediction.risk_label === "High"
                  ? "border-red-500/50 bg-red-500/5"
                  : prediction.risk_label === "Medium"
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-green-500/50 bg-green-500/5"
              }
            >
              {getRiskIcon(prediction.risk_label)}
              <AlertTitle className="ml-2">Analysis</AlertTitle>
              <AlertDescription className="ml-7">
                {prediction.explanation}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloodRiskForm;
