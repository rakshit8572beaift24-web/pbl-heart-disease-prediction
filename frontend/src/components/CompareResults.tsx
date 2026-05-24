import React from 'react';

interface HealthData {
  age: number;
  sex: number;
  chest_pain_type: number;
  resting_bp: number;
  cholesterol: number;
  fasting_bs: number;
  resting_ecg: number;
  max_heart_rate: number;
  exercise_angina: number;
  st_depression: number;
  st_slope: number;
  num_vessels: number;
  thalassemia: number;
}

interface PredictionResult {
  prediction: number;
  confidence: number;
  risk_score?: number;
  risk_level: string;
  contributing_factors: Array<{
    feature: string;
    importance: number;
    value: string;
  }>;
}

interface CompareResultsProps {
  resultA: PredictionResult;
  resultB: PredictionResult;
  healthDataA: HealthData;
  healthDataB: HealthData;
  onReset: () => void;
  darkMode: boolean;
}

const featureLabels: Record<keyof HealthData, string> = {
  age: 'Age',
  sex: 'Sex',
  chest_pain_type: 'Chest Pain Type',
  resting_bp: 'Resting BP',
  cholesterol: 'Cholesterol',
  fasting_bs: 'Fasting Blood Sugar',
  resting_ecg: 'Resting ECG',
  max_heart_rate: 'Max Heart Rate',
  exercise_angina: 'Exercise Angina',
  st_depression: 'ST Depression',
  st_slope: 'ST Slope',
  num_vessels: 'Major Vessels',
  thalassemia: 'Thalassemia',
};

const optionLabels: Record<string, Record<number, string>> = {
  sex: { 0: 'Female', 1: 'Male' },
  chest_pain_type: {
    0: 'Typical Angina',
    1: 'Atypical Angina',
    2: 'Non-Anginal Pain',
    3: 'Asymptomatic',
  },
  fasting_bs: { 0: 'No', 1: 'Yes' },
  resting_ecg: { 0: 'Normal', 1: 'ST-T Abnormality', 2: 'LV Hypertrophy' },
  exercise_angina: { 0: 'No', 1: 'Yes' },
  st_slope: { 0: 'Upsloping', 1: 'Flat', 2: 'Downsloping' },
  num_vessels: { 0: '0', 1: '1', 2: '2', 3: '3' },
  thalassemia: { 0: 'Normal', 1: 'Fixed Defect', 2: 'Reversible Defect' },
};

const healthDelta = (field: keyof HealthData, a: number, b: number) => {
  if (field === 'sex') return 0;
  if (field === 'chest_pain_type' || field === 'resting_ecg' || field === 'st_slope' || field === 'thalassemia') {
    return b < a ? 1 : b > a ? -1 : 0;
  }
  if (field === 'max_heart_rate') {
    return b > a ? 1 : b < a ? -1 : 0;
  }
  if (field === 'exercise_angina' || field === 'fasting_bs') {
    return b === 0 && a === 1 ? 1 : a === 0 && b === 1 ? -1 : 0;
  }
  return b < a ? 1 : b > a ? -1 : 0;
};

const formatValue = (field: keyof HealthData, value: number) => {
  if (optionLabels[field]) {
    return optionLabels[field][value] ?? String(value);
  }
  return field === 'st_depression' ? `${value.toFixed(1)} mm` : String(value);
};

const CompareResults: React.FC<CompareResultsProps> = ({ resultA, resultB, healthDataA, healthDataB, onReset, darkMode }) => {
  const riskA = resultA.risk_score ?? resultA.confidence;
  const riskB = resultB.risk_score ?? resultB.confidence;

  const diffRows = (Object.keys(healthDataA) as Array<keyof HealthData>)
    .filter((field) => healthDataA[field] !== healthDataB[field])
    .map((field) => {
      const delta = healthDelta(field, healthDataA[field], healthDataB[field]);
      return {
        field,
        label: featureLabels[field],
        valueA: formatValue(field, healthDataA[field]),
        valueB: formatValue(field, healthDataB[field]),
        delta,
      };
    });

  const getStatusClass = (delta: number) =>
    delta > 0
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
      : delta < 0
      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Patient Comparison Results</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Side-by-side risk scores, factor breakdowns, and a diff table showing where Patient B is healthier or worse compared to Patient A.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start new comparison
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: 'Patient A', result: resultA, healthData: healthDataA, color: 'from-teal-500 to-cyan-600' },
          { title: 'Patient B', result: resultB, healthData: healthDataB, color: 'from-indigo-500 to-violet-600' },
        ].map((patient) => (
          <div key={patient.title} className={`rounded-3xl border p-6 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{patient.title}</h3>
            <div className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-r to-white from-teal-100 p-4 dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk Score</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{(patient.result.risk_score ?? patient.result.confidence).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-teal-600 dark:text-black">
                    {patient.result.risk_level}
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {patient.result.contributing_factors.slice(0, 4).map((factor) => (
                  <div key={factor.feature} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{factor.feature}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{factor.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Impact: {factor.importance.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-3xl border p-6 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Feature Diff Table</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Green indicates Patient B is healthier. Red indicates Patient B is worse.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">Feature</th>
                <th className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">Patient A</th>
                <th className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">Patient B</th>
                <th className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {diffRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    Both profiles are identical across all tracked features.
                  </td>
                </tr>
              ) : (
                diffRows.map((row) => (
                  <tr key={row.field} className={`${row.delta > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : row.delta < 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <td className="border-b border-slate-200 px-4 py-4 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100">{row.label}</td>
                    <td className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">{row.valueA}</td>
                    <td className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">{row.valueB}</td>
                    <td className={`border-b border-slate-200 px-4 py-4 dark:border-slate-700 ${getStatusClass(row.delta)}`}>
                      {row.delta > 0 ? 'B healthier' : row.delta < 0 ? 'B worse' : 'No change'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareResults;
