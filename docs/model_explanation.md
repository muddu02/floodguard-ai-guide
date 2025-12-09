# Model Explanation

## Algorithm: Random Forest Classifier

### Why Random Forest?
- Handles non-linear relationships between features
- Provides feature importance rankings
- Robust to outliers and missing data
- No need for feature scaling

### Feature Weights (Importance)
1. **Rainfall** (22%) - Primary flood trigger
2. **River Level** (18%) - Direct flooding indicator
3. **Elevation** (16%) - Drainage and water accumulation
4. **Soil Moisture** (14%) - Ground absorption capacity
5. **Distance to River** (12%) - Proximity risk factor
6. **Historical Events** (12%) - Location vulnerability
7. **Population Density** (6%) - Impact severity factor

### Decision Thresholds
- **Low**: Score < 0.35
- **Medium**: 0.35 ≤ Score < 0.65
- **High**: Score ≥ 0.65
