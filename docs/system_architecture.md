# System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Edge Function   │────▶│    Supabase     │
│  (Frontend)     │     │ (flood-predict)  │     │   Database      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                       │
        │  User inputs           │  ML Inference         │  Store logs
        │  environmental         │  (weighted scoring)   │  predictions
        │  data                  │                       │
        ▼                        ▼                       ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ FloodRiskForm   │     │ Model Config     │     │ flood_risk_     │
│ Component       │     │ (JSON weights)   │     │ predictions     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Data Flow
1. User enters environmental data in FloodRiskForm
2. Frontend calls `/functions/v1/flood-predict`
3. Edge function applies ML model weights
4. Prediction logged to Supabase
5. Result displayed with risk badge and explanation
