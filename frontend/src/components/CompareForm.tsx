import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

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

interface CompareFormProps {
  onCompare: (data: {
    resultA: PredictionResult;
    resultB: PredictionResult;
    healthDataA: HealthData;
    healthDataB: HealthData;
  }) => void;
  onCancel: () => void;
  darkMode: boolean;
}

interface FormField {
  name: keyof HealthData;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number; label: string }[];
}

const formFields: FormField[] = [
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
  { name: 'sex', label: 'Sex', type: 'select', options: [{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }] },
  { name: 'chest_pain_type', label: 'Chest Pain Type', type: 'select', options: [
    { value: 0, label: 'Typical Angina' },
    { value: 1, label: 'Atypical Angina' },
    { value: 2, label: 'Non-Anginal Pain' },
    { value: 3, label: 'Asymptomatic' }
  ] },
  { name: 'resting_bp', label: 'Resting BP', type: 'number', min: 80, max: 200 },
  { name: 'cholesterol', label: 'Cholesterol', type: 'number', min: 100, max: 600 },
  { name: 'fasting_bs', label: 'Fasting BS >120 mg/dl', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }] },
  { name: 'resting_ecg', label: 'Resting ECG', type: 'select', options: [{ value: 0, label: 'Normal' }, { value: 1, label: 'ST-T Abnormality' }, { value: 2, label: 'LV Hypertrophy' }] },
  { name: 'max_heart_rate', label: 'Max Heart Rate', type: 'number', min: 60, max: 220 },
  { name: 'exercise_angina', label: 'Exercise Angina', type: 'select', options: [{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }] },
  { name: 'st_depression', label: 'ST Depression', type: 'number', min: 0, max: 10, step: 0.1 },
  { name: 'st_slope', label: 'ST Slope', type: 'select', options: [{ value: 0, label: 'Upsloping' }, { value: 1, label: 'Flat' }, { value: 2, label: 'Downsloping' }] },
  { name: 'num_vessels', label: 'Major Vessels', type: 'select', options: [{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }] },
  { name: 'thalassemia', label: 'Thalassemia', type: 'select', options: [{ value: 0, label: 'Normal' }, { value: 1, label: 'Fixed Defect' }, { value: 2, label: 'Reversible Defect' }] },
];

const initialHealthData: HealthData = {
  age: 45,
  sex: 1,
  chest_pain_type: 0,
  resting_bp: 120,
  cholesterol: 200,
  fasting_bs: 0,
  resting_ecg: 0,
  max_heart_rate: 150,
  exercise_angina: 0,
  st_depression: 1.0,
  st_slope: 1,
  num_vessels: 0,
  thalassemia: 0,
};

const CompareForm: React.FC<CompareFormProps> = ({ onCompare, onCancel, darkMode }) => {
  const [patientA, setPatientA] = useState<HealthData>(initialHealthData);
  const [patientB, setPatientB] = useState<HealthData>({ ...initialHealthData, age: 50, sex: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (patient: 'A' | 'B', fieldName: keyof HealthData, value: number) => {
    const setter = patient === 'A' ? setPatientA : setPatientB;
    setter(prev => ({ ...prev, [fieldName]: value }));
  };

  const fetchPrediction = async (healthData: HealthData) => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Prediction failed: ${response.status} ${errorText}`);
    }
    return response.json();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const [resultA, resultB] = await Promise.all([
        fetchPrediction(patientA),
        fetchPrediction(patientB)
      ]);
      onCompare({ resultA, resultB, healthDataA: patientA, healthDataB: patientB });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Unable to compare patients.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Comparison Mode</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Fill in two patient profiles and compare their risk scores, factor breakdowns, and feature differences side-by-side.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Back to single patient
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? 'Comparing…' : 'Compare Patients'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: 'Patient A', data: patientA, setData: setPatientA },
          { title: 'Patient B', data: patientB, setData: setPatientB },
        ].map((patient) => (
          <div key={patient.title} className={`rounded-3xl border p-6 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
            <h3 className="mb-4 text-xl font-semibold text-slate-800 dark:text-white">{patient.title}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {formFields.map((field) => (
                <label key={`${patient.title}-${field.name}`} className="block text-sm text-slate-700 dark:text-slate-200">
                  <span className="mb-2 block font-medium">{field.label}</span>
                  {field.type === 'select' ? (
                    <select
                      value={patient.data[field.name]}
                      onChange={(event) => handleChange(patient.title === 'Patient A' ? 'A' : 'B', field.name as keyof HealthData, Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      step={field.step ?? 1}
                      min={field.min}
                      max={field.max}
                      value={patient.data[field.name]}
                      onChange={(event) => handleChange(patient.title === 'Patient A' ? 'A' : 'B', field.name as keyof HealthData, Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareForm;
