import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Users, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Shelter {
  id: string;
  name: string;
  current_capacity: number;
  max_capacity: number;
  distance_km: number;
  direction: string;
  latitude: number;
  longitude: number;
  address?: string;
}

const SafeShelters = () => {
  const [filter, setFilter] = useState<"nearest" | "available">("nearest");
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Use hardcoded sample shelters
    if (locationLoading || !location) return;

    console.log("Loading sample shelters for location:", location.latitude, location.longitude);
    
    // Calculate rough distances (demo values)
    const sampleShelters: Shelter[] = [
      {
        id: "1",
        name: "City Community Flood Shelter",
        address: "123 Main Street, Downtown",
        current_capacity: 45,
        max_capacity: 200,
        distance_km: 2.3,
        direction: "North",
        latitude: location.latitude + 0.02,
        longitude: location.longitude + 0.01,
      },
      {
        id: "2",
        name: "Central Emergency Relief Center",
        address: "456 Park Avenue, Central District",
        current_capacity: 80,
        max_capacity: 150,
        distance_km: 3.7,
        direction: "East",
        latitude: location.latitude - 0.01,
        longitude: location.longitude + 0.03,
      },
      {
        id: "3",
        name: "Riverside Safe Haven",
        address: "789 River Road, West Side",
        current_capacity: 120,
        max_capacity: 180,
        distance_km: 1.5,
        direction: "West",
        latitude: location.latitude + 0.01,
        longitude: location.longitude - 0.02,
      },
      {
        id: "4",
        name: "Highland Evacuation Shelter",
        address: "321 Hill Street, Highland Area",
        current_capacity: 30,
        max_capacity: 100,
        distance_km: 4.2,
        direction: "South",
        latitude: location.latitude - 0.03,
        longitude: location.longitude - 0.01,
      },
    ];

    setShelters(sampleShelters);
    setLoading(false);
  }, [location, locationLoading]);

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-alert-medium";
    return "text-alert-high";
  };

  const handleReserve = (shelter: Shelter) => {
    alert(`Reservation request sent for ${shelter.name}`);
  };

  const handleNavigate = (shelter: Shelter) => {
    navigate(`/directions?lat=${shelter.latitude}&lng=${shelter.longitude}&name=${encodeURIComponent(shelter.name)}&address=${encodeURIComponent(shelter.address || '')}`);
  };

  const displayedShelters = filter === "available"
    ? [...shelters].sort((a, b) => {
        const aAvailable = a.max_capacity - a.current_capacity;
        const bAvailable = b.max_capacity - b.current_capacity;
        return bAvailable - aAvailable;
      })
    : shelters;

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <MapPin className="w-6 h-6 text-accent" />
            <span>Safe Shelters</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "nearest" ? "default" : "outline"}
              onClick={() => setFilter("nearest")}
            >
              Nearest
            </Button>
            <Button
              size="sm"
              variant={filter === "available" ? "default" : "outline"}
              onClick={() => setFilter("available")}
            >
              Available
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || locationLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {location?.error || "Loading shelters..."}
          </div>
        ) : displayedShelters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shelters found nearby
          </div>
        ) : (
          displayedShelters.map((shelter) => (
          <Card
            key={shelter.id}
            className="card-hover border-l-4 border-l-accent/50"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {shelter.name}
                  </h3>
                  {shelter.address && (
                    <p className="text-sm text-muted-foreground">{shelter.address}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span
                      className={`flex items-center gap-1 font-medium ${getCapacityColor(
                        shelter.current_capacity,
                        shelter.max_capacity
                      )}`}
                    >
                      <Users className="w-4 h-4" />
                      Capacity: {shelter.max_capacity} people
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="w-4 h-4" />
                      {shelter.distance_km} km {shelter.direction}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                    Free Shelter
                  </Badge>
                </div>
                
                {/* Map Thumbnail Placeholder */}
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleNavigate(shelter)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleReserve(shelter)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reserve
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SafeShelters;
