import React, { useState } from 'react';
import { Heart, AlertCircle, ChevronRight, ChevronLeft, Info, Loader2 } from 'lucide-react';

// Type definitions
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
  risk_level: string;
  contributing_factors: Array<{
    feature: string;
    importance: number;
    value: string;
  }>;
}

interface HealthFormProps {
  onPrediction: (result: PredictionResult, data: HealthData) => void;
  darkMode: boolean;
}

interface FormField {
  name: keyof HealthData;
  label: string;
  type: 'number' | 'select';
  options?: { value: number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  tooltip: string;
  normalRange?: string;
}

const formFields: FormField[] = [
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    min: 1,
    max: 120,
    tooltip: 'Your current age in years',
    normalRange: '25-75 years'
  },
  {
    name: 'sex',
    label: 'Sex',
    type: 'select',
    options: [
      { value: 0, label: 'Female' },
      { value: 1, label: 'Male' }
    ],
    tooltip: 'Biological sex assigned at birth',
    normalRange: 'N/A'
  },
  {
    name: 'chest_pain_type',
    label: 'Chest Pain Type',
    type: 'select',
    options: [
      { value: 0, label: 'Typical Angina' },
      { value: 1, label: 'Atypical Angina' },
      { value: 2, label: 'Non-Anginal Pain' },
      { value: 3, label: 'Asymptomatic' }
    ],
    tooltip: 'Type of chest pain experienced',
    normalRange: 'Asymptomatic is best'
  },
  {
    name: 'resting_bp',
    label: 'Resting Blood Pressure (mm Hg)',
    type: 'number',
    min: 80,
    max: 200,
    tooltip: 'Blood pressure at rest in millimeters of mercury',
    normalRange: '90-120 mm Hg'
  },
  {
    name: 'cholesterol',
    label: 'Cholesterol Level (mg/dl)',
    type: 'number',
    min: 100,
    max: 600,
    tooltip: 'Serum cholesterol in mg/dl',
    normalRange: '<200 mg/dl'
  },
  {
    name: 'fasting_bs',
    label: 'Fasting Blood Sugar >120 mg/dl',
    type: 'select',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    tooltip: 'Fasting blood sugar level greater than 120 mg/dl',
    normalRange: 'No (<120 mg/dl)'
  },
  {
    name: 'resting_ecg',
    label: 'Resting ECG Results',
    type: 'select',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'ST-T Wave Abnormality' },
      { value: 2, label: 'Left Ventricular Hypertrophy' }
    ],
    tooltip: 'Results of resting electrocardiogram',
    normalRange: 'Normal'
  },
  {
    name: 'max_heart_rate',
    label: 'Maximum Heart Rate Achieved',
    type: 'number',
    min: 60,
    max: 220,
    tooltip: 'Maximum heart rate achieved during exercise',
    normalRange: 'Varies by age'
  },
  {
    name: 'exercise_angina',
    label: 'Exercise Induced Angina',
    type: 'select',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ],
    tooltip: 'Chest pain induced by exercise',
    normalRange: 'No'
  },
  {
    name: 'st_depression',
    label: 'ST Depression (mm)',
    type: 'number',
    min: 0,
    max: 10,
    step: 0.1,
    tooltip: 'ST depression induced by exercise relative to rest',
    normalRange: '<1.0 mm'
  },
  {
    name: 'st_slope',
    label: 'Slope of Peak Exercise ST Segment',
    type: 'select',
    options: [
      { value: 0, label: 'Upsloping' },
      { value: 1, label: 'Flat' },
      { value: 2, label: 'Downsloping' }
    ],
    tooltip: 'Slope of the peak exercise ST segment',
    normalRange: 'Upsloping'
  },
  {
    name: 'num_vessels',
    label: 'Number of Major Vessels (0-3)',
    type: 'select',
    options: [
      { value: 0, label: '0' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' }
    ],
    tooltip: 'Number of major vessels colored by fluoroscopy',
    normalRange: '0 vessels'
  },
  {
    name: 'thalassemia',
    label: 'Thalassemia',
    type: 'select',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Fixed Defect' },
      { value: 2, label: 'Reversible Defect' }
    ],
    tooltip: 'Blood disorder affecting hemoglobin',
    normalRange: 'Normal'
  }
];

const HealthForm: React.FC<HealthFormProps> = ({ onPrediction, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<HealthData>({
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
    thalassemia: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const stepsPerSection = 4;
  const totalSteps = Math.ceil(formFields.length / stepsPerSection);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) return 'Please enter a valid number';
      if (field.min !== undefined && numValue < field.min) return `Minimum value is ${field.min}`;
      if (field.max !== undefined && numValue > field.max) return `Maximum value is ${field.max}`;
    }
    return null;
  };

  const handleInputChange = (fieldName: keyof HealthData, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    const field = formFields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }));
    }
  };

  const getCurrentFields = () => {
    const start = currentStep * stepsPerSection;
    return formFields.slice(start, start + stepsPerSection);
  };

  const canProceed = () => {
    const currentFields = getCurrentFields();
    return currentFields.every(field => {
      const error = validateField(field, formData[field.name]);
      return !error;
    });
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log('Sending prediction request with data:', formData);
      
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result: PredictionResult = await response.json();
      console.log('Prediction result:', result);
      onPrediction(result, formData);
    } catch (error) {
      console.error('Error making prediction:', error);
      alert(`Failed to get prediction. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Health Assessment Form
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your health profile for AI-powered risk assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Progress
            </div>
            <div className="text-2xl font-bold text-medical-blue-600 dark:text-medical-blue-400">
              {currentStep + 1}/{totalSteps}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-medical-blue-500 to-medical-green-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
          
          <div className="flex justify-between relative">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 transform ${
                    i < currentStep ? 'bg-gradient-to-r from-medical-blue-500 to-medical-green-500 text-white scale-110 shadow-lg' : 
                    i === currentStep ? 'bg-medical-blue-600 text-white scale-110 shadow-lg ring-4 ring-medical-blue-200' : 
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {i < currentStep ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  i <= currentStep ? 'text-medical-blue-600 dark:text-medical-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {i === 0 ? 'Basic Info' : 
                   i === 1 ? 'Vitals' : 
                   i === 2 ? 'Cardiac' : 
                   'Advanced'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Form Fields */}
      <div className={`card transition-all duration-300 hover:shadow-xl ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {currentStep === 0 ? 'Basic Information' :
             currentStep === 1 ? 'Vital Signs' :
             currentStep === 2 ? 'Cardiac Health' :
             'Advanced Assessment'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep === 0 ? 'Tell us about your basic demographics' :
             currentStep === 1 ? 'Enter your vital health measurements' :
             currentStep === 2 ? 'Provide cardiac-specific information' :
             'Complete the advanced health metrics'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {getCurrentFields().map((field) => (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded-lg p-2 mt-1 w-48">
                    {field.tooltip}
                  </div>
                </div>
              </div>
              
              {field.type === 'select' ? (
                <select
                  value={formData[field.name]}
                  onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  className={`input-field transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 text-white border-gray-600 focus:border-medical-blue-500' 
                      : 'border-gray-300 focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-200'
                  } ${focusedField === field.name ? 'ring-2 ring-medical-blue-200 border-medical-blue-500' : ''}`}
                >
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={formData[field.name]}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className={`input-field transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 text-white border-gray-600 focus:border-medical-blue-500' 
                      : 'border-gray-300 focus:border-medical-blue-500 focus:ring-2 focus:ring-medical-blue-200'
                  } ${focusedField === field.name ? 'ring-2 ring-medical-blue-200 border-medical-blue-500 transform scale-[1.02]' : ''}`}
                />
              )}
              
              {errors[String(field.name)] && (
                <div className="flex items-center space-x-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors[String(field.name)]}</span>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Normal range: {field.normalRange}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`group flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Previous
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {canProceed() ? '✓ Ready to proceed' : '⚠ Complete all fields'}
            </div>
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className={`group flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 transform ${
                !canProceed() || isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 hover:from-medical-blue-700 hover:to-medical-blue-800 text-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  {currentStep === totalSteps - 1 ? 'Analyzing...' : 'Processing...'}
                </>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <span className="mr-2">🔮</span>
                  Get Prediction
                  <span className="ml-2">→</span>
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
