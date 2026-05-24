/** Derive BMI when not provided (uses backend default logic proxy from vitals) */
export const getBmi = (healthData) => {
  if (healthData.bmi != null && healthData.bmi > 0) return Number(healthData.bmi);
  const bpFactor = ((healthData.resting_bp || 120) - 120) * 0.02;
  const cholFactor = ((healthData.cholesterol || 200) - 200) * 0.005;
  return Math.round((24 + bpFactor + cholFactor) * 10) / 10;
};

export const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#eab308' };
  return { label: 'Obese', color: '#ef4444' };
};

export const computeHealthScore = (healthData, result) => {
  let score = 100;
  const risk = result.risk_score ?? result.confidence;

  score -= risk * 0.45;
  if (healthData.cholesterol > 240) score -= 12;
  else if (healthData.cholesterol > 200) score -= 6;
  if (healthData.resting_bp > 140) score -= 12;
  else if (healthData.resting_bp > 130) score -= 5;
  if (healthData.exercise_angina === 1) score -= 10;
  if (healthData.fasting_bs === 1) score -= 8;
  if (healthData.smoking === 1) score -= 10;

  const bmi = getBmi(healthData);
  if (bmi >= 30) score -= 10;
  else if (bmi >= 25) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getCholesterolTrend = (currentChol) => {
  const months = ['6 mo ago', '5 mo', '4 mo', '3 mo', '2 mo', 'Current'];
  const drift = (200 - currentChol) / 5;
  return months.map((label, i) => ({
    label,
    value: Math.round(currentChol + drift * (5 - i)),
    optimal: 200,
    borderline: 240,
  }));
};

export const getRiskGaugeColor = (value) => {
  if (value < 50) return '#22c55e';
  if (value <= 75) return '#eab308';
  return '#ef4444';
};

export const getHealthScoreColor = (score) => {
  if (score >= 75) return '#14b8a6';
  if (score >= 50) return '#eab308';
  return '#ef4444';
};
