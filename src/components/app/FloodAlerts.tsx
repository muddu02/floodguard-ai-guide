import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Satellite, Users, Radio, ChevronDown, ChevronUp, CloudRain, Thermometer } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Alert {
  id: string;
  time: string;
  description: string;
  severity: "high" | "medium" | "low";
  source: "satellite" | "citizen" | "sensor";
  details: {
    actions: string[];
    affectedAreas: string[];
  };
}

// Mock data - would come from /api/alerts
const mockAlerts: Alert[] = [
  {
    id: "1",
    time: "11:32 AM — Nov 20, 2025",
    description: "Severe overflow on Riverbank Rd",
    severity: "high",
    source: "satellite",
    details: {
      actions: ["Evacuate immediately", "Move to higher ground", "Avoid Riverbank Rd area"],
      affectedAreas: ["Riverbank Rd", "Downtown district", "East Bridge"],
    },
  },
  {
    id: "2",
    time: "10:15 AM — Nov 20, 2025",
    description: "Water level rising near Central Park",
    severity: "medium",
    source: "sensor",
    details: {
      actions: ["Monitor situation", "Prepare emergency kit", "Stay informed"],
      affectedAreas: ["Central Park", "Park Avenue", "Green Street"],
    },
  },
  {
    id: "3",
    time: "08:45 AM — Nov 20, 2025",
    description: "Minor flooding reported on Oak Street",
    severity: "low",
    source: "citizen",
    details: {
      actions: ["Avoid area if possible", "Drive carefully"],
      affectedAreas: ["Oak Street", "Maple Avenue"],
    },
  },
];

const FloodAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{
    temperature: number;
    condition: string;
    humidity?: number;
    windSpeed?: number;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const { location, loading: locationLoading } = useGeolocation();

  // Fetch weather based on user location
  useEffect(() => {
    const fetchWeather = async () => {
      if (locationLoading || !location) return;

      try {
        console.log("Fetching weather for location:", location.latitude, location.longitude);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }

        const data = await response.json();
        
        // Map weather codes to conditions
        const weatherCode = data.current.weather_code;
        let condition = "Clear sky";
        if (weatherCode >= 61 && weatherCode <= 67) condition = "Rain";
        else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snow";
        else if (weatherCode >= 80 && weatherCode <= 82) condition = "Rain showers";
        else if (weatherCode >= 95 && weatherCode <= 99) condition = "Thunderstorm";
        else if (weatherCode >= 51 && weatherCode <= 57) condition = "Drizzle";
        else if (weatherCode >= 1 && weatherCode <= 3) condition = "Partly cloudy";
        else if (weatherCode === 45 || weatherCode === 48) condition = "Fog";

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          condition,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [location, locationLoading]);

  // Fetch initial alerts and set up real-time subscription
  useEffect(() => {
    const fetchAlerts = async () => {
      console.log("Fetching alerts from database...");
      const { data, error } = await supabase
        .from("flood_alerts")
        .select("*")
        .order("time", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching alerts:", error);
        setLoading(false);
        return;
      }

      const formattedAlerts: Alert[] = (data || []).map((alert) => ({
        id: alert.id,
        time: new Date(alert.time).toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: alert.description,
        severity: alert.severity as Alert["severity"],
        source: alert.source as Alert["source"],
        details: {
          actions: alert.actions || [],
          affectedAreas: alert.affected_areas || [],
        },
      }));

      setAlerts(formattedAlerts);
      setLoading(false);
    };

    fetchAlerts();

    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel("flood_alerts_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "flood_alerts",
        },
        (payload) => {
          console.log("New alert received:", payload);
          const newAlert = payload.new;
          const formattedAlert: Alert = {
            id: newAlert.id,
            time: new Date(newAlert.time).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            description: newAlert.description,
            severity: newAlert.severity,
            source: newAlert.source,
            details: {
              actions: newAlert.actions || [],
              affectedAreas: newAlert.affected_areas || [],
            },
          };
          setAlerts((prev) => [formattedAlert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-alert-high text-white";
      case "medium":
        return "bg-alert-medium text-white";
      case "low":
        return "bg-alert-low text-white";
    }
  };

  const getSourceIcon = (source: Alert["source"]) => {
    switch (source) {
      case "satellite":
        return <Satellite className="w-4 h-4" />;
      case "citizen":
        return <Users className="w-4 h-4" />;
      case "sensor":
        return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <AlertTriangle className="w-6 h-6 text-alert-high" />
          <span>FloodGuard Alerts</span>
          <span className="live-indicator text-sm font-normal text-muted-foreground ml-auto">
            Real-time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Local Weather Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  Local Weather
                </h3>
                {weatherLoading ? (
                  <p className="text-sm text-muted-foreground">Loading weather...</p>
                ) : weather ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-foreground">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-2xl font-bold">{weather.temperature}°C</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Condition: {weather.condition}
                    </p>
                    {weather.humidity && (
                      <p className="text-xs text-muted-foreground">
                        Humidity: {weather.humidity}%
                      </p>
                    )}
                    {weather.windSpeed && (
                      <p className="text-xs text-muted-foreground">
                        Wind: {weather.windSpeed} km/h
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Unable to fetch weather right now. Please try again later.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active alerts at this time
          </div>
        ) : (
          alerts.map((alert) => (
          <Collapsible
            key={alert.id}
            open={expandedId === alert.id}
            onOpenChange={() =>
              setExpandedId(expandedId === alert.id ? null : alert.id)
            }
          >
            <Card className="card-hover border-l-4 border-l-transparent hover:border-l-primary">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {getSourceIcon(alert.source)}
                        {alert.source}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">
                      {alert.description}
                    </p>
                    <p className="text-sm text-muted-foreground">{alert.time}</p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {expandedId === alert.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-3 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">
                      Suggested Actions:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {alert.details.actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">
                      Affected Areas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.details.affectedAreas.map((area, idx) => (
                        <Badge key={idx} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FloodAlerts;
