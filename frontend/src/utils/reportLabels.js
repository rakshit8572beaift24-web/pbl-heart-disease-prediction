export const FEATURE_LABELS = {
  age: 'Age',
  sex: 'Sex',
  chest_pain_type: 'Chest Pain Type',
  resting_bp: 'Resting Blood Pressure',
  cholesterol: 'Cholesterol',
  fasting_bs: 'Fasting Blood Sugar',
  resting_ecg: 'Resting ECG',
  max_heart_rate: 'Max Heart Rate',
  exercise_angina: 'Exercise Angina',
  st_depression: 'ST Depression',
  st_slope: 'ST Slope',
  num_vessels: 'Major Vessels',
  thalassemia: 'Thalassemia',
  smoking: 'Smoking',
  alcohol_intake: 'Alcohol Intake',
  physical_activity: 'Physical Activity',
  bmi: 'BMI',
  diabetes: 'Diabetes',
  family_history: 'Family History',
};

export const formatFeatureName = (name) =>
  FEATURE_LABELS[name] ||
  name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const formatHealthValue = (key, value) => {
  const maps = {
    sex: { 0: 'Female', 1: 'Male' },
    fasting_bs: { 0: '≤ 120 mg/dl', 1: '> 120 mg/dl' },
    exercise_angina: { 0: 'No', 1: 'Yes' },
    smoking: { 0: 'No', 1: 'Yes' },
    diabetes: { 0: 'No', 1: 'Yes' },
    family_history: { 0: 'No', 1: 'Yes' },
    alcohol_intake: { 0: 'None', 1: 'Moderate', 2: 'High' },
    physical_activity: { 0: 'Low', 1: 'Moderate', 2: 'High' },
  };
  if (maps[key]?.[value] !== undefined) return maps[key][value];
  return String(value);
};
