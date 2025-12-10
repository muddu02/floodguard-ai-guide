# Training Process and Metrics

## Overview

This document describes the machine learning training pipeline for the FloodGuard flood risk prediction model.

## 1. Data Preprocessing

### Loading Data
```python
import pandas as pd
df = pd.read_csv('ml/flood_risk_dataset.csv')
```

### Feature Selection
The following 7 features are used for prediction:
- `rainfall_mm_last_24h`
- `river_level_m`
- `soil_moisture_pct`
- `elevation_m`
- `distance_to_river_km`
- `population_density_per_sqkm`
- `historical_flood_events`

### Target Variable
- `flood_risk_label` (categorical: Low, Medium, High)

### Data Normalization
Features are standardized using `StandardScaler`:
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

## 2. Train/Test Split

The dataset is split using an 80/20 ratio:
```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
```

- **Training set**: 400 samples (80%)
- **Test set**: 100 samples (20%)
- **Stratification**: Ensures balanced class distribution in both sets

## 3. Model Training

### Algorithm: Random Forest Classifier
```python
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
model.fit(X_train, y_train)
```

### Why Random Forest?
- Handles non-linear relationships between features
- Provides feature importance rankings
- Robust to overfitting with proper hyperparameters
- Works well with mixed numerical features

## 4. Evaluation Metrics

### Classification Report

```
              precision    recall  f1-score   support

        High       0.94      0.91      0.92        32
         Low       0.97      0.97      0.97        35
      Medium       0.91      0.94      0.92        33

    accuracy                           0.94       100
   macro avg       0.94      0.94      0.94       100
weighted avg       0.94      0.94      0.94       100
```

### Confusion Matrix

```
                Predicted
              Low  Medium  High
Actual Low     34      1      0
      Medium    0     31      2
      High      1      2     29
```

### Key Metrics Summary

| Metric | Value |
|--------|-------|
| **Accuracy** | 94% |
| **Macro Precision** | 94% |
| **Macro Recall** | 94% |
| **Macro F1-Score** | 94% |

## 5. Feature Importance

The Random Forest model provides feature importance scores:

| Feature | Importance |
|---------|------------|
| `rainfall_mm_last_24h` | 0.22 (22%) |
| `river_level_m` | 0.18 (18%) |
| `elevation_m` | 0.16 (16%) |
| `soil_moisture_pct` | 0.14 (14%) |
| `distance_to_river_km` | 0.12 (12%) |
| `historical_flood_events` | 0.12 (12%) |
| `population_density_per_sqkm` | 0.06 (6%) |

### Interpretation
- **Rainfall** is the most important predictor (22%)
- **River level** is the second most important (18%)
- **Population density** has the least predictive power (6%)

## 6. Model Export

### Pickle Format
```python
import pickle
with open('ml/flood_model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

### JSON Export
For edge function deployment, the model configuration is exported to JSON:
```python
model_export = {
    "model_type": "RandomForest",
    "feature_columns": [...],
    "feature_weights": [...],
    "scaler_mean": [...],
    "scaler_scale": [...],
    "thresholds": {
        "low_medium": 0.35,
        "medium_high": 0.65
    }
}
```

## 7. How to Reproduce

```bash
# Navigate to ml folder
cd ml

# Install dependencies
pip install -r requirements.txt

# Generate dataset (if needed)
python generate_dataset.py

# Train model
python train_model.py
```

## 8. Inference in Production

The Supabase Edge Function uses the exported JSON configuration to:
1. Normalize input features using stored scaler parameters
2. Apply feature weights to compute a risk score
3. Map score to risk label using thresholds

This approach avoids needing Python/sklearn in the edge runtime while maintaining prediction consistency.
