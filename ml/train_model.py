#!/usr/bin/env python3
"""
Flood Risk ML Model Training Script
====================================

This script trains a machine learning model to predict flood risk levels
based on environmental and geographical features.

Prerequisites:
    pip install pandas scikit-learn numpy

Usage:
    python ml/train_model.py

Outputs:
    - ml/flood_model.pkl (pickled sklearn model)
    - ml/flood_model_export.json (model coefficients for inference)
    - Console output with evaluation metrics
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "flood_risk_dataset.csv")
MODEL_PKL_PATH = os.path.join(SCRIPT_DIR, "flood_model.pkl")
MODEL_JSON_PATH = os.path.join(SCRIPT_DIR, "flood_model_export.json")
RANDOM_STATE = 42
TEST_SIZE = 0.2

# Feature columns (order matters for inference)
FEATURE_COLUMNS = [
    "rainfall_mm_last_24h",
    "river_level_m",
    "soil_moisture_pct",
    "elevation_m",
    "distance_to_river_km",
    "population_density_per_sqkm",
    "historical_flood_events"
]

LABEL_COLUMN = "flood_risk_label"
LABELS = ["Low", "Medium", "High"]


def load_and_preprocess_data():
    """Load dataset and preprocess for training."""
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Features: {FEATURE_COLUMNS}")
    print(f"Label distribution:\n{df[LABEL_COLUMN].value_counts()}")
    
    X = df[FEATURE_COLUMNS].values
    y = df[LABEL_COLUMN].values
    
    # Encode labels
    label_encoder = LabelEncoder()
    label_encoder.fit(LABELS)  # Fit with ordered labels
    y_encoded = label_encoder.transform(y)
    
    return X, y_encoded, label_encoder


def train_random_forest(X_train, y_train):
    """Train a Random Forest classifier."""
    print("\nTraining Random Forest Classifier...")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    return model


def train_logistic_regression(X_train_scaled, y_train):
    """Train a Logistic Regression classifier."""
    print("\nTraining Logistic Regression Classifier...")
    
    model = LogisticRegression(
        multi_class="multinomial",
        solver="lbfgs",
        max_iter=1000,
        random_state=RANDOM_STATE
    )
    
    model.fit(X_train_scaled, y_train)
    return model


def evaluate_model(model, X_test, y_test, label_encoder, model_name="Model"):
    """Evaluate model and print metrics."""
    print(f"\n{'='*50}")
    print(f"Evaluation Results for {model_name}")
    print(f"{'='*50}")
    
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted")
    recall = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    print(f"\nAccuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"              Predicted")
    print(f"              Low   Med   High")
    print(f"Actual Low   [{cm[0][0]:4d}  {cm[0][1]:4d}  {cm[0][2]:4d}]")
    print(f"       Med   [{cm[1][0]:4d}  {cm[1][1]:4d}  {cm[1][2]:4d}]")
    print(f"       High  [{cm[2][0]:4d}  {cm[2][1]:4d}  {cm[2][2]:4d}]")
    
    # Detailed classification report
    print(f"\nClassification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_
    ))
    
    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "confusion_matrix": cm.tolist()
    }


def export_model_for_inference(model, scaler, label_encoder, feature_importances=None):
    """
    Export model weights/thresholds for simple inference in edge function.
    We'll export a simplified scoring system based on feature importances.
    """
    print("\nExporting model for inference...")
    
    # Get feature importances from Random Forest
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_.tolist()
    else:
        # For logistic regression, use coefficient magnitudes
        importances = np.mean(np.abs(model.coef_), axis=0).tolist()
    
    # Normalize importances
    total = sum(importances)
    weights = [imp / total for imp in importances]
    
    export_data = {
        "model_type": "RandomForest",
        "feature_columns": FEATURE_COLUMNS,
        "labels": LABELS,
        "feature_weights": weights,
        "feature_importances": importances,
        "scaler_mean": scaler.mean_.tolist() if scaler else None,
        "scaler_scale": scaler.scale_.tolist() if scaler else None,
        "thresholds": {
            "low_medium": 0.35,
            "medium_high": 0.65
        },
        "feature_ranges": {
            "rainfall_mm_last_24h": {"min": 0, "max": 300, "risk_direction": "higher"},
            "river_level_m": {"min": 0.5, "max": 8.0, "risk_direction": "higher"},
            "soil_moisture_pct": {"min": 10, "max": 100, "risk_direction": "higher"},
            "elevation_m": {"min": 1, "max": 500, "risk_direction": "lower"},
            "distance_to_river_km": {"min": 0.1, "max": 20, "risk_direction": "lower"},
            "population_density_per_sqkm": {"min": 50, "max": 10000, "risk_direction": "higher"},
            "historical_flood_events": {"min": 0, "max": 15, "risk_direction": "higher"}
        }
    }
    
    with open(MODEL_JSON_PATH, "w") as f:
        json.dump(export_data, f, indent=2)
    
    print(f"Model export saved to: {MODEL_JSON_PATH}")
    return export_data


def main():
    """Main training pipeline."""
    print("="*60)
    print("FLOOD RISK ML MODEL TRAINING")
    print("="*60)
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}")
        print("Please run 'python ml/generate_dataset.py' first.")
        return
    
    # Load data
    X, y, label_encoder = load_and_preprocess_data()
    
    # Split data
    print(f"\nSplitting data (test size: {TEST_SIZE})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y
    )
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Scale features for Logistic Regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest (primary model)
    rf_model = train_random_forest(X_train, y_train)
    rf_metrics = evaluate_model(rf_model, X_test, y_test, label_encoder, "Random Forest")
    
    # Train Logistic Regression (for comparison)
    lr_model = train_logistic_regression(X_train_scaled, y_train)
    lr_metrics = evaluate_model(lr_model, X_test_scaled, y_test, label_encoder, "Logistic Regression")
    
    # Feature importance analysis
    print("\n" + "="*50)
    print("Feature Importance (Random Forest)")
    print("="*50)
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    for i, idx in enumerate(indices):
        print(f"{i+1}. {FEATURE_COLUMNS[idx]}: {importances[idx]:.4f}")
    
    # Save the Random Forest model (best performer)
    print(f"\nSaving model to {MODEL_PKL_PATH}...")
    model_bundle = {
        "model": rf_model,
        "scaler": scaler,
        "label_encoder": label_encoder,
        "feature_columns": FEATURE_COLUMNS,
        "labels": LABELS,
        "metrics": rf_metrics
    }
    
    with open(MODEL_PKL_PATH, "wb") as f:
        pickle.dump(model_bundle, f)
    
    print(f"Model saved successfully!")
    
    # Export for edge function inference
    export_data = export_model_for_inference(rf_model, scaler, label_encoder)
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE")
    print("="*60)
    print(f"\nFiles created:")
    print(f"  - {MODEL_PKL_PATH}")
    print(f"  - {MODEL_JSON_PATH}")
    print(f"\nBest model: Random Forest")
    print(f"Accuracy: {rf_metrics['accuracy']:.2%}")


if __name__ == "__main__":
    main()
