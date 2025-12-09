# Flood Risk Dataset Description

## Overview
Synthetic dataset with 500+ samples for training flood risk prediction models.

## Features

| Feature | Unit | Range | Impact on Risk |
|---------|------|-------|----------------|
| `rainfall_mm_last_24h` | mm | 0-300 | Higher → Higher risk |
| `river_level_m` | meters | 0.5-8.0 | Higher → Higher risk |
| `soil_moisture_pct` | % | 10-100 | Higher → Higher risk |
| `elevation_m` | meters | 1-500 | Lower → Higher risk |
| `distance_to_river_km` | km | 0.1-20 | Closer → Higher risk |
| `population_density_per_sqkm` | people/km² | 50-10000 | Higher → Higher risk |
| `historical_flood_events` | count | 0-15 | More → Higher risk |

## Target Variable
`flood_risk_label`: Low, Medium, or High

## Generation
Run: `python ml/generate_dataset.py`
