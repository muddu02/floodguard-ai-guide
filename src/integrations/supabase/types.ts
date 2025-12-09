export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string
          id: string
          location: string
          message: string
          name: string
          sentiment: string | null
          sentiment_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          message: string
          name: string
          sentiment?: string | null
          sentiment_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          message?: string
          name?: string
          sentiment?: string | null
          sentiment_score?: number | null
        }
        Relationships: []
      }
      flood_alerts: {
        Row: {
          actions: string[]
          affected_areas: string[]
          created_at: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          severity: Database["public"]["Enums"]["alert_severity"]
          source: Database["public"]["Enums"]["alert_source"]
          time: string
          updated_at: string
        }
        Insert: {
          actions?: string[]
          affected_areas?: string[]
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          severity: Database["public"]["Enums"]["alert_severity"]
          source: Database["public"]["Enums"]["alert_source"]
          time?: string
          updated_at?: string
        }
        Update: {
          actions?: string[]
          affected_areas?: string[]
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          source?: Database["public"]["Enums"]["alert_source"]
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      flood_reports: {
        Row: {
          classification: string | null
          confidence: number | null
          created_at: string
          id: string
          image_url: string
          latitude: number | null
          longitude: number | null
          notified_users: number | null
          severity: string | null
        }
        Insert: {
          classification?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          image_url: string
          latitude?: number | null
          longitude?: number | null
          notified_users?: number | null
          severity?: string | null
        }
        Update: {
          classification?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          image_url?: string
          latitude?: number | null
          longitude?: number | null
          notified_users?: number | null
          severity?: string | null
        }
        Relationships: []
      }
      flood_risk_predictions: {
        Row: {
          created_at: string
          distance_to_river_km: number
          elevation_m: number
          historical_flood_events: number
          id: string
          population_density_per_sqkm: number
          predicted_risk_label: string
          predicted_risk_score: number
          rainfall_mm_last_24h: number
          river_level_m: number
          soil_moisture_pct: number
        }
        Insert: {
          created_at?: string
          distance_to_river_km: number
          elevation_m: number
          historical_flood_events: number
          id?: string
          population_density_per_sqkm: number
          predicted_risk_label: string
          predicted_risk_score: number
          rainfall_mm_last_24h: number
          river_level_m: number
          soil_moisture_pct: number
        }
        Update: {
          created_at?: string
          distance_to_river_km?: number
          elevation_m?: number
          historical_flood_events?: number
          id?: string
          population_density_per_sqkm?: number
          predicted_risk_label?: string
          predicted_risk_score?: number
          rainfall_mm_last_24h?: number
          river_level_m?: number
          soil_moisture_pct?: number
        }
        Relationships: []
      }
      safe_shelters: {
        Row: {
          address: string | null
          created_at: string
          current_capacity: number
          direction: string | null
          distance_km: number | null
          id: string
          latitude: number
          longitude: number
          max_capacity: number
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          current_capacity?: number
          direction?: string | null
          distance_km?: number | null
          id?: string
          latitude: number
          longitude: number
          max_capacity: number
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          current_capacity?: number
          direction?: string | null
          distance_km?: number | null
          id?: string
          latitude?: number
          longitude?: number
          max_capacity?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_severity: "high" | "medium" | "low"
      alert_source: "satellite" | "citizen" | "sensor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["high", "medium", "low"],
      alert_source: ["satellite", "citizen", "sensor"],
    },
  },
} as const
