import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
  error?: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: 0,
        longitude: 0,
        error: "Geolocation is not supported by your browser",
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Default to a sample location if permission denied
        setLocation({
          latitude: 40.7128,
          longitude: -74.006,
          error: "Location access denied. Using default location.",
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, loading };
};
