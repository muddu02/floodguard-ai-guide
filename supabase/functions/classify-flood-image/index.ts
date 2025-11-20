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
    const { imageBase64, latitude, longitude } = await req.json();

    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    console.log("Classifying flood image with AI");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Lovable AI with vision model to classify the image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a flood detection AI. Analyze images and respond with ONLY a JSON object: {\"severity\": \"high\"|\"medium\"|\"low\", \"classification\": brief description, \"confidence\": number 0-100, \"is_flood\": boolean}. No additional text."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for flooding. Determine if it shows a flood, the severity level, and your confidence."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI classification response:", aiResponse);
    
    // Parse the JSON response
    const classificationData = JSON.parse(aiResponse);

    // Calculate estimated reach based on severity
    const estimatedReach = classificationData.severity === "high" ? 500 : 
                          classificationData.severity === "medium" ? 300 : 100;

    // Store report in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reportData, error: insertError } = await supabase
      .from("flood_reports")
      .insert({
        image_url: imageBase64.substring(0, 100) + "...", // Store truncated for demo
        severity: classificationData.severity,
        classification: classificationData.classification,
        confidence: classificationData.confidence,
        latitude,
        longitude,
        notified_users: estimatedReach,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Report stored successfully");

    // If high severity, create an alert
    if (classificationData.severity === "high" && classificationData.is_flood) {
      await supabase.from("flood_alerts").insert({
        description: `Citizen-reported flooding: ${classificationData.classification}`,
        severity: "high",
        source: "citizen",
        actions: ["Avoid the area", "Seek higher ground if nearby"],
        affected_areas: ["Reported location"],
        latitude,
        longitude,
      });
      console.log("High severity alert created");
    }

    return new Response(
      JSON.stringify({
        severity: classificationData.severity,
        classification: classificationData.classification,
        confidence: classificationData.confidence,
        reach: estimatedReach,
        reportId: reportData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in classify-flood-image function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
