#!/usr/bin/env python3
"""
Flood Risk Dataset Generator
============================

This script generates a synthetic but realistic flood risk dataset with 500+ rows.
The values are correlated logically with the flood risk label:
- Higher rainfall, river level, soil moisture → Higher risk
- Lower elevation, closer to river → Higher risk
- Higher historical flood events → Higher risk

Usage:
    python ml/generate_dataset.py

Output:
    ml/flood_risk_dataset.csv
"""

import csv
import random
import os

# Set seed for reproducibility
random.seed(42)

# Configuration
NUM_ROWS = 500
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "flood_risk_dataset.csv")

# Feature ranges
RAINFALL_RANGE = (0, 300)  # mm in last 24h
RIVER_LEVEL_RANGE = (0.5, 8.0)  # meters
SOIL_MOISTURE_RANGE = (10, 100)  # percentage
ELEVATION_RANGE = (1, 500)  # meters
DISTANCE_TO_RIVER_RANGE = (0.1, 20)  # km
POPULATION_DENSITY_RANGE = (50, 10000)  # per sqkm
HISTORICAL_FLOODS_RANGE = (0, 15)  # count


def calculate_risk_score(row: dict) -> float:
    """
    Calculate a normalized risk score (0-1) based on feature values.
    Higher values for risky features increase the score.
    """
    score = 0.0
    
    # Rainfall contribution (0-0.25)
    rainfall_norm = (row["rainfall_mm_last_24h"] - RAINFALL_RANGE[0]) / (RAINFALL_RANGE[1] - RAINFALL_RANGE[0])
    score += rainfall_norm * 0.25
    
    # River level contribution (0-0.20)
    river_norm = (row["river_level_m"] - RIVER_LEVEL_RANGE[0]) / (RIVER_LEVEL_RANGE[1] - RIVER_LEVEL_RANGE[0])
    score += river_norm * 0.20
    
    # Soil moisture contribution (0-0.15)
    soil_norm = (row["soil_moisture_pct"] - SOIL_MOISTURE_RANGE[0]) / (SOIL_MOISTURE_RANGE[1] - SOIL_MOISTURE_RANGE[0])
    score += soil_norm * 0.15
    
    # Elevation contribution (inverted - lower elevation = higher risk) (0-0.15)
    elevation_norm = 1 - (row["elevation_m"] - ELEVATION_RANGE[0]) / (ELEVATION_RANGE[1] - ELEVATION_RANGE[0])
    score += elevation_norm * 0.15
    
    # Distance to river contribution (inverted - closer = higher risk) (0-0.10)
    distance_norm = 1 - (row["distance_to_river_km"] - DISTANCE_TO_RIVER_RANGE[0]) / (DISTANCE_TO_RIVER_RANGE[1] - DISTANCE_TO_RIVER_RANGE[0])
    score += distance_norm * 0.10
    
    # Population density contribution (0-0.05)
    pop_norm = (row["population_density_per_sqkm"] - POPULATION_DENSITY_RANGE[0]) / (POPULATION_DENSITY_RANGE[1] - POPULATION_DENSITY_RANGE[0])
    score += pop_norm * 0.05
    
    # Historical floods contribution (0-0.10)
    hist_norm = row["historical_flood_events"] / HISTORICAL_FLOODS_RANGE[1]
    score += hist_norm * 0.10
    
    # Add some noise
    score += random.uniform(-0.05, 0.05)
    
    return max(0, min(1, score))


def determine_risk_label(score: float) -> str:
    """Determine risk label based on score."""
    if score < 0.35:
        return "Low"
    elif score < 0.65:
        return "Medium"
    else:
        return "High"


def generate_row() -> dict:
    """Generate a single row of data."""
    row = {
        "rainfall_mm_last_24h": round(random.uniform(*RAINFALL_RANGE), 1),
        "river_level_m": round(random.uniform(*RIVER_LEVEL_RANGE), 2),
        "soil_moisture_pct": round(random.uniform(*SOIL_MOISTURE_RANGE), 1),
        "elevation_m": round(random.uniform(*ELEVATION_RANGE), 1),
        "distance_to_river_km": round(random.uniform(*DISTANCE_TO_RIVER_RANGE), 2),
        "population_density_per_sqkm": round(random.uniform(*POPULATION_DENSITY_RANGE), 0),
        "historical_flood_events": random.randint(*HISTORICAL_FLOODS_RANGE),
    }
    
    # Calculate risk score and label
    score = calculate_risk_score(row)
    row["flood_risk_label"] = determine_risk_label(score)
    
    return row


def generate_biased_row(target_label: str) -> dict:
    """
    Generate a row biased toward a specific risk label.
    This ensures we have a balanced dataset.
    """
    if target_label == "High":
        row = {
            "rainfall_mm_last_24h": round(random.uniform(150, 300), 1),
            "river_level_m": round(random.uniform(5.0, 8.0), 2),
            "soil_moisture_pct": round(random.uniform(60, 100), 1),
            "elevation_m": round(random.uniform(1, 100), 1),
            "distance_to_river_km": round(random.uniform(0.1, 3), 2),
            "population_density_per_sqkm": round(random.uniform(2000, 10000), 0),
            "historical_flood_events": random.randint(5, 15),
        }
    elif target_label == "Medium":
        row = {
            "rainfall_mm_last_24h": round(random.uniform(75, 175), 1),
            "river_level_m": round(random.uniform(3.0, 5.5), 2),
            "soil_moisture_pct": round(random.uniform(40, 70), 1),
            "elevation_m": round(random.uniform(80, 250), 1),
            "distance_to_river_km": round(random.uniform(2, 10), 2),
            "population_density_per_sqkm": round(random.uniform(500, 4000), 0),
            "historical_flood_events": random.randint(2, 8),
        }
    else:  # Low
        row = {
            "rainfall_mm_last_24h": round(random.uniform(0, 100), 1),
            "river_level_m": round(random.uniform(0.5, 3.5), 2),
            "soil_moisture_pct": round(random.uniform(10, 50), 1),
            "elevation_m": round(random.uniform(200, 500), 1),
            "distance_to_river_km": round(random.uniform(8, 20), 2),
            "population_density_per_sqkm": round(random.uniform(50, 1500), 0),
            "historical_flood_events": random.randint(0, 4),
        }
    
    row["flood_risk_label"] = target_label
    return row


def main():
    """Generate the dataset and save to CSV."""
    print(f"Generating {NUM_ROWS} rows of flood risk data...")
    
    data = []
    
    # Generate balanced data: ~170 rows per label
    for label in ["Low", "Medium", "High"]:
        for _ in range(NUM_ROWS // 3):
            data.append(generate_biased_row(label))
    
    # Fill remaining rows with random generation
    remaining = NUM_ROWS - len(data)
    for _ in range(remaining):
        data.append(generate_row())
    
    # Shuffle the data
    random.shuffle(data)
    
    # Write to CSV
    fieldnames = [
        "rainfall_mm_last_24h",
        "river_level_m",
        "soil_moisture_pct",
        "elevation_m",
        "distance_to_river_km",
        "population_density_per_sqkm",
        "historical_flood_events",
        "flood_risk_label"
    ]
    
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    # Print summary
    label_counts = {"Low": 0, "Medium": 0, "High": 0}
    for row in data:
        label_counts[row["flood_risk_label"]] += 1
    
    print(f"Dataset saved to: {OUTPUT_FILE}")
    print(f"Total rows: {len(data)}")
    print(f"Label distribution:")
    for label, count in label_counts.items():
        print(f"  {label}: {count} ({count/len(data)*100:.1f}%)")


if __name__ == "__main__":
    main()
