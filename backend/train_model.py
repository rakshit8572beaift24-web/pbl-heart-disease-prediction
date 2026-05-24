#!/usr/bin/env python3
"""
Complete Training Pipeline for Heart Disease Prediction
Retrains the model with newly added health and lifestyle features
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix, classification_report
import xgboost as xgb
import joblib
import os
from pathlib import Path
from utils import *

def load_data(csv_path=None):
    """Load dataset from CSV or create sample data"""
    if csv_path and os.path.exists(csv_path):
        print(f"Loading data from {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("Creating sample dataset...")
        df = create_sample_dataset()
        # Save sample dataset for future use
        df.to_csv('heart_disease_data.csv', index=False)
        print("Sample dataset saved as 'heart_disease_data.csv'")
    
    return df

def preprocess_data(df):
    """Preprocess the data: handle missing values and create features"""
    print("Preprocessing data...")
    
    # Check for missing values
    print(f"Missing values per column:\n{df.isnull().sum()}")
    
    # Handle missing values - fill with median for numeric columns
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            print(f"Filled missing values in {col} with median: {median_val}")
    
    # Feature Engineering
    print("Creating derived features...")
    
    # cholesterol_age_ratio = cholesterol / age
    df['cholesterol_age_ratio'] = df['cholesterol'] / df['age']
    
    # heart_rate_age_ratio = max_heart_rate / age
    df['heart_rate_age_ratio'] = df['max_heart_rate'] / df['age']
    
    print("Derived features created successfully")
    
    return df

def split_data(df):
    """Split data into features and target, then train/test"""
    print("Splitting data...")
    
    # Define feature columns (all except target)
    feature_columns = [
        'age', 'sex', 'chest_pain_type', 'resting_bp', 'cholesterol',
        'fasting_bs', 'resting_ecg', 'max_heart_rate', 'exercise_angina',
        'st_depression', 'st_slope', 'num_vessels', 'thalassemia',
        'smoking', 'alcohol_intake', 'physical_activity', 'bmi', 'diabetes', 'family_history',
        'cholesterol_age_ratio', 'heart_rate_age_ratio'
    ]
    
    # Ensure all required columns exist
    missing_cols = [col for col in feature_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    X = df[feature_columns]
    y = df['target']
    
    # Split into train and test sets (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")
    print(f"Training target distribution: {y_train.value_counts()}")
    print(f"Test target distribution: {y_test.value_counts()}")
    
    return X_train, X_test, y_train, y_test, feature_columns

def scale_features(X_train, X_test):
    """Scale features using StandardScaler"""
    print("Scaling features...")
    
    scaler = StandardScaler()
    
    # Fit scaler only on training data
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Transform test data using fitted scaler
    X_test_scaled = scaler.transform(X_test)
    
    print("Features scaled successfully")
    
    return X_train_scaled, X_test_scaled, scaler

def train_model(X_train, y_train):
    """Train XGBoost model"""
    print("Training XGBoost model...")
    
    # Initialize XGBoost classifier
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        random_state=42,
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8
    )
    
    # Train the model
    model.fit(X_train, y_train)
    
    print("Model training completed")
    
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    print("Evaluating model...")
    
    # Make predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    
    print(f"\n=== Model Evaluation Results ===")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"[[{cm[0,0]} {cm[0,1]}]")
    print(f" [{cm[1,0]} {cm[1,1]}]]")
    print(f"True Negatives: {cm[0,0]}, False Positives: {cm[0,1]}")
    print(f"False Negatives: {cm[1,0]}, True Positives: {cm[1,1]}")
    
    # Classification Report
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return accuracy, precision, recall, cm

def save_model_artifacts(model, scaler, feature_names):
    """Save model, scaler, and feature names"""
    print("Saving model artifacts...")
    
    # Create models directory if it doesn't exist
    models_dir = Path('models')
    models_dir.mkdir(exist_ok=True)
    
    # Save model
    joblib.dump(model, 'models/heart_disease_model.pkl')
    print("Model saved as 'models/heart_disease_model.pkl'")
    
    # Save scaler
    joblib.dump(scaler, 'models/scaler.pkl')
    print("Scaler saved as 'models/scaler.pkl'")
    
    # Save feature names
    joblib.dump(feature_names, 'models/feature_names.pkl')
    print("Feature names saved as 'models/feature_names.pkl'")
    
    print("All model artifacts saved successfully")

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("Heart Disease Prediction Model Training Pipeline")
    print("=" * 60)
    
    try:
        # Step 1: Load data
        df = load_data()  # You can pass a CSV path here: load_data('your_data.csv')
        
        # Step 2: Preprocess data
        df = preprocess_data(df)
        
        # Step 3: Split data
        X_train, X_test, y_train, y_test, feature_names = split_data(df)
        
        # Step 4: Scale features
        X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test)
        
        # Step 5: Train model
        model = train_model(X_train_scaled, y_train)
        
        # Step 6: Evaluate model
        accuracy, precision, recall, cm = evaluate_model(model, X_test_scaled, y_test)
        
        # Step 7: Save model artifacts
        save_model_artifacts(model, scaler, feature_names)
        
        print("\n" + "=" * 60)
        print("Training Pipeline Completed Successfully!")
        print("=" * 60)
        print(f"Final Model Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"Total Features: {len(feature_names)}")
        print(f"Feature Order: {feature_names}")
        
    except Exception as e:
        print(f"Error in training pipeline: {str(e)}")
        raise

if __name__ == "__main__":
    main()
