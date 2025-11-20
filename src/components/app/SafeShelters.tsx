import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Users, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Shelter {
  id: string;
  name: string;
  capacity: { current: number; max: number };
  distance: string;
  direction: string;
  lat: number;
  lng: number;
}

// Mock data - would come from /api/shelters?lat=...&lng=...
const mockShelters: Shelter[] = [
  {
    id: "1",
    name: "Central Community Center",
    capacity: { current: 45, max: 100 },
    distance: "3.2 km",
    direction: "NE",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "2",
    name: "Westside Emergency Shelter",
    capacity: { current: 78, max: 120 },
    distance: "5.8 km",
    direction: "W",
    lat: 40.715,
    lng: -74.015,
  },
  {
    id: "3",
    name: "North District Safe Haven",
    capacity: { current: 32, max: 80 },
    distance: "7.1 km",
    direction: "N",
    lat: 40.725,
    lng: -74.002,
  },
];

const SafeShelters = () => {
  const [filter, setFilter] = useState<"nearest" | "available">("nearest");

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-alert-medium";
    return "text-alert-high";
  };

  const handleNavigate = (shelter: Shelter) => {
    // In production: open map with directions
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`,
      "_blank"
    );
  };

  const handleReserve = (shelter: Shelter) => {
    // Mock reservation
    alert(`Reservation request sent for ${shelter.name}`);
  };

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
        {mockShelters.map((shelter) => (
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
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span
                      className={`flex items-center gap-1 font-medium ${getCapacityColor(
                        shelter.capacity.current,
                        shelter.capacity.max
                      )}`}
                    >
                      <Users className="w-4 h-4" />
                      {shelter.capacity.current} / {shelter.capacity.max}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="w-4 h-4" />
                      {shelter.distance} {shelter.direction}
                    </span>
                  </div>
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
        ))}
      </CardContent>
    </Card>
  );
};

export default SafeShelters;
