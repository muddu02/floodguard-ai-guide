import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Fix for default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface RoutingMachineProps {
  start: [number, number];
  end: [number, number];
}

function RoutingMachine({ start, end }: RoutingMachineProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing routing control if any
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 5, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      show: true,
      collapsible: true,
      fitSelectedRoutes: true,
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
}

const Directions = () => {
  const [searchParams] = useSearchParams();
  const { location } = useGeolocation();
  
  const shelterName = searchParams.get("name") || "Shelter";
  const shelterLat = parseFloat(searchParams.get("lat") || "0");
  const shelterLng = parseFloat(searchParams.get("lng") || "0");
  const shelterAddress = searchParams.get("address") || "";

  const userLat = location?.latitude || 0;
  const userLng = location?.longitude || 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Link to="/app">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Directions to {shelterName}</h1>
            {shelterAddress && (
              <p className="text-sm text-muted-foreground">{shelterAddress}</p>
            )}
          </div>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Navigation className="w-6 h-6 text-primary" />
              <span>Route Navigation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-border">
              <MapContainer
                center={[(userLat + shelterLat) / 2, (userLng + shelterLng) / 2]}
                zoom={13}
                style={{ height: "600px", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[userLat, userLng]} />
                <Marker position={[shelterLat, shelterLng]} />
                <RoutingMachine
                  start={[userLat, userLng]}
                  end={[shelterLat, shelterLng]}
                />
              </MapContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-sm font-semibold">Your Location</p>
                  <p className="text-xs text-muted-foreground">
                    {userLat.toFixed(4)}, {userLng.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-destructive mt-1" />
                <div>
                  <p className="text-sm font-semibold">Destination</p>
                  <p className="text-xs text-muted-foreground">
                    {shelterLat.toFixed(4)}, {shelterLng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Directions;
