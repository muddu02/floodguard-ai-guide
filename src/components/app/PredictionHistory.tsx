import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { History, RefreshCw, TrendingUp, Droplets, Waves, Mountain } from "lucide-react";
import { format } from "date-fns";

interface PredictionLog {
  id: string;
  created_at: string;
  rainfall_mm_last_24h: number;
  river_level_m: number;
  soil_moisture_pct: number;
  elevation_m: number;
  distance_to_river_km: number;
  population_density_per_sqkm: number;
  historical_flood_events: number;
  predicted_risk_label: string;
  predicted_risk_score: number;
}

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState<PredictionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("flood_risk_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

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

  const getRiskStats = () => {
    const total = predictions.length;
    if (total === 0) return { low: 0, medium: 0, high: 0 };
    
    const low = predictions.filter(p => p.predicted_risk_label === "Low").length;
    const medium = predictions.filter(p => p.predicted_risk_label === "Medium").length;
    const high = predictions.filter(p => p.predicted_risk_label === "High").length;
    
    return {
      low: Math.round((low / total) * 100),
      medium: Math.round((medium / total) * 100),
      high: Math.round((high / total) * 100),
    };
  };

  const stats = getRiskStats();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <CardTitle>Prediction History</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPredictions} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Recent flood risk predictions and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground">Low Risk</p>
              <p className="text-2xl font-bold text-green-600">{stats.low}%</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}%</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{stats.high}%</p>
            </div>
          </div>
        )}

        {/* Predictions List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No predictions yet</p>
              <p className="text-sm">Use the prediction form to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getRiskColor(prediction.predicted_risk_label)}>
                      {prediction.predicted_risk_label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(prediction.created_at), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <span className="font-semibold">
                      {Math.round(prediction.predicted_risk_score * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>{prediction.rainfall_mm_last_24h}mm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Waves className="w-3 h-3 text-cyan-500" />
                      <span>{prediction.river_level_m}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mountain className="w-3 h-3 text-stone-500" />
                      <span>{prediction.elevation_m}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PredictionHistory;
