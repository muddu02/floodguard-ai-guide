import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Model configuration based on trained Random Forest
const MODEL_CONFIG = {
  feature_columns: [
    "rainfall_mm_last_24h",
    "river_level_m",
    "soil_moisture_pct",
    "elevation_m",
    "distance_to_river_km",
    "population_density_per_sqkm",
    "historical_flood_events"
  ],
  // Feature weights derived from Random Forest feature importances
  feature_weights: {
    rainfall_mm_last_24h: 0.22,
    river_level_m: 0.18,
    soil_moisture_pct: 0.14,
    elevation_m: 0.16,
    distance_to_river_km: 0.12,
    population_density_per_sqkm: 0.06,
    historical_flood_events: 0.12
  },
  // Feature ranges for normalization
  feature_ranges: {
    rainfall_mm_last_24h: { min: 0, max: 300, riskDirection: "higher" },
    river_level_m: { min: 0.5, max: 8.0, riskDirection: "higher" },
    soil_moisture_pct: { min: 10, max: 100, riskDirection: "higher" },
    elevation_m: { min: 1, max: 500, riskDirection: "lower" },
    distance_to_river_km: { min: 0.1, max: 20, riskDirection: "lower" },
    population_density_per_sqkm: { min: 50, max: 10000, riskDirection: "higher" },
    historical_flood_events: { min: 0, max: 15, riskDirection: "higher" }
  },
  thresholds: {
    low_medium: 0.35,
    medium_high: 0.65
  }
};

interface PredictionInput {
  rainfall_mm_last_24h: number;
  river_level_m: number;
  soil_moisture_pct: number;
  elevation_m: number;
  distance_to_river_km: number;
  population_density_per_sqkm: number;
  historical_flood_events: number;
}

interface PredictionResult {
  risk_label: "Low" | "Medium" | "High";
  risk_score: number;
  explanation: string;
}

function normalizeFeature(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function calculateRiskScore(input: PredictionInput): number {
  let score = 0;
  
  for (const [feature, weight] of Object.entries(MODEL_CONFIG.feature_weights)) {
    const range = MODEL_CONFIG.feature_ranges[feature as keyof typeof MODEL_CONFIG.feature_ranges];
    const value = input[feature as keyof PredictionInput];
    
    let normalized = normalizeFeature(value, range.min, range.max);
    
    // Invert for features where lower value = higher risk
    if (range.riskDirection === "lower") {
      normalized = 1 - normalized;
    }
    
    score += normalized * weight;
  }
  
  return Math.max(0, Math.min(1, score));
}

function determineRiskLabel(score: number): "Low" | "Medium" | "High" {
  if (score < MODEL_CONFIG.thresholds.low_medium) {
    return "Low";
  } else if (score < MODEL_CONFIG.thresholds.medium_high) {
    return "Medium";
  } else {
    return "High";
  }
}

function generateExplanation(input: PredictionInput, score: number, label: string): string {
  const factors: string[] = [];
  
  // Check high-impact features
  if (input.rainfall_mm_last_24h > 150) {
    factors.push(`heavy rainfall (${input.rainfall_mm_last_24h}mm)`);
  }
  
  if (input.river_level_m > 5) {
    factors.push(`high river level (${input.river_level_m}m)`);
  }
  
  if (input.soil_moisture_pct > 70) {
    factors.push(`saturated soil (${input.soil_moisture_pct}%)`);
  }
  
  if (input.elevation_m < 50) {
    factors.push(`low elevation (${input.elevation_m}m)`);
  }
  
  if (input.distance_to_river_km < 2) {
    factors.push(`proximity to river (${input.distance_to_river_km}km)`);
  }
  
  if (input.historical_flood_events > 5) {
    factors.push(`flood-prone area (${input.historical_flood_events} past events)`);
  }
  
  // Generate explanation based on risk level
  if (label === "High") {
    if (factors.length > 0) {
      return `High flood risk due to: ${factors.join(", ")}. Immediate precautions recommended.`;
    }
    return "High flood risk based on combined environmental factors. Stay alert and prepared.";
  } else if (label === "Medium") {
    if (factors.length > 0) {
      return `Moderate flood risk due to: ${factors.join(", ")}. Monitor conditions closely.`;
    }
    return "Moderate flood risk detected. Keep monitoring weather and river conditions.";
  } else {
    return "Low flood risk under current conditions. Continue monitoring for any changes.";
  }
}

function predict(input: PredictionInput): PredictionResult {
  const score = calculateRiskScore(input);
  const label = determineRiskLabel(score);
  const explanation = generateExplanation(input, score, label);
  
  return {
    risk_label: label,
    risk_score: Math.round(score * 100) / 100,
    explanation
  };
}

function validateInput(body: unknown): PredictionInput {
  const input = body as Record<string, unknown>;
  
  const requiredFields = MODEL_CONFIG.feature_columns;
  
  for (const field of requiredFields) {
    if (input[field] === undefined || input[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
    
    const value = Number(input[field]);
    if (isNaN(value)) {
      throw new Error(`Invalid numeric value for field: ${field}`);
    }
    
    const range = MODEL_CONFIG.feature_ranges[field as keyof typeof MODEL_CONFIG.feature_ranges];
    if (value < range.min || value > range.max) {
      console.warn(`Field ${field} value ${value} is outside expected range [${range.min}, ${range.max}]`);
    }
  }
  
  return {
    rainfall_mm_last_24h: Number(input.rainfall_mm_last_24h),
    river_level_m: Number(input.river_level_m),
    soil_moisture_pct: Number(input.soil_moisture_pct),
    elevation_m: Number(input.elevation_m),
    distance_to_river_km: Number(input.distance_to_river_km),
    population_density_per_sqkm: Number(input.population_density_per_sqkm),
    historical_flood_events: Number(input.historical_flood_events)
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Flood prediction request received");
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));
    
    // Validate input
    const input = validateInput(body);
    console.log("Validated input:", JSON.stringify(input));
    
    // Make prediction
    const prediction = predict(input);
    console.log("Prediction result:", JSON.stringify(prediction));
    
    // Log prediction to Supabase
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error: insertError } = await supabase
          .from("flood_risk_predictions")
          .insert({
            rainfall_mm_last_24h: input.rainfall_mm_last_24h,
            river_level_m: input.river_level_m,
            soil_moisture_pct: input.soil_moisture_pct,
            elevation_m: input.elevation_m,
            distance_to_river_km: input.distance_to_river_km,
            population_density_per_sqkm: input.population_density_per_sqkm,
            historical_flood_events: input.historical_flood_events,
            predicted_risk_label: prediction.risk_label,
            predicted_risk_score: prediction.risk_score
          });
        
        if (insertError) {
          console.error("Error logging prediction to database:", insertError);
        } else {
          console.log("Prediction logged to database successfully");
        }
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if logging fails
    }
    
    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    console.error("Prediction error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
