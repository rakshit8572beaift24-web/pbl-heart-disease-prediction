import numpy as np
import pandas as pd

def create_sample_dataset():
    """Create a sample dataset with all required features for demonstration"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate realistic sample data
    data = {
        'age': np.random.randint(29, 77, n_samples),
        'sex': np.random.randint(0, 2, n_samples),
        'chest_pain_type': np.random.randint(0, 4, n_samples),
        'resting_bp': np.random.randint(94, 200, n_samples),
        'cholesterol': np.random.randint(126, 564, n_samples),
        'fasting_bs': np.random.randint(0, 2, n_samples),
        'resting_ecg': np.random.randint(0, 3, n_samples),
        'max_heart_rate': np.random.randint(71, 202, n_samples),
        'exercise_angina': np.random.randint(0, 2, n_samples),
        'st_depression': np.random.uniform(0, 6.2, n_samples),
        'st_slope': np.random.randint(0, 3, n_samples),
        'num_vessels': np.random.randint(0, 4, n_samples),
        'thalassemia': np.random.randint(0, 3, n_samples),
        'smoking': np.random.randint(0, 2, n_samples),
        'alcohol_intake': np.random.randint(0, 3, n_samples),
        'physical_activity': np.random.randint(0, 3, n_samples),
        'bmi': np.random.uniform(18.5, 45, n_samples),
        'diabetes': np.random.randint(0, 2, n_samples),
        'family_history': np.random.randint(0, 2, n_samples),
    }
    
    # Create target with some correlation to features
    target = []
    for i in range(n_samples):
        # Simple logic for target creation based on risk factors
        risk_score = 0
        if data['age'][i] > 55: risk_score += 1
        if data['sex'][i] == 1: risk_score += 1
        if data['chest_pain_type'][i] > 1: risk_score += 1
        if data['resting_bp'][i] > 140: risk_score += 1
        if data['cholesterol'][i] > 240: risk_score += 1
        if data['max_heart_rate'][i] < 150: risk_score += 1
        if data['smoking'][i] == 1: risk_score += 1
        if data['diabetes'][i] == 1: risk_score += 1
        if data['family_history'][i] == 1: risk_score += 1
        if data['bmi'][i] > 30: risk_score += 1
        
        # Add some randomness
        if risk_score >= 4:
            target.append(np.random.choice([0, 1], p=[0.3, 0.7]))
        elif risk_score >= 2:
            target.append(np.random.choice([0, 1], p=[0.6, 0.4]))
        else:
            target.append(np.random.choice([0, 1], p=[0.8, 0.2]))
    
    data['target'] = target
    
    df = pd.DataFrame(data)
    return df
