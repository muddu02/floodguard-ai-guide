import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, limit = 10 } = await req.json();

    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required");
    }

    console.log("Fetching nearby shelters for location:", { latitude, longitude });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all shelters
    const { data: shelters, error } = await supabase
      .from("safe_shelters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      throw error;
    }

    // Calculate distances and directions using Haversine formula
    const sheltersWithDistance = shelters.map((shelter) => {
      const lat1 = latitude * Math.PI / 180;
      const lat2 = parseFloat(shelter.latitude.toString()) * Math.PI / 180;
      const deltaLat = (parseFloat(shelter.latitude.toString()) - latitude) * Math.PI / 180;
      const deltaLng = (parseFloat(shelter.longitude.toString()) - longitude) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c; // Earth's radius in km

      // Calculate direction
      const bearing = Math.atan2(
        Math.sin(deltaLng) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)
      ) * 180 / Math.PI;

      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const index = Math.round(((bearing + 360) % 360) / 45) % 8;
      const direction = directions[index];

      return {
        ...shelter,
        distance_km: parseFloat(distance.toFixed(1)),
        direction,
      };
    });

    // Sort by distance and limit results
    const nearbyShelters = sheltersWithDistance
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    console.log(`Found ${nearbyShelters.length} nearby shelters`);

    return new Response(
      JSON.stringify({ shelters: nearbyShelters }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-nearby-shelters function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
