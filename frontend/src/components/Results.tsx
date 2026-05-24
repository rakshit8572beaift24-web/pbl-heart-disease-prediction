import React, { useState } from 'react';
import { Heart, Download, RefreshCw, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import ReportPreviewModal from './reports/ReportPreviewModal';
import { generateMedicalReportPDF } from '../utils/reportGenerator';
import HealthAnalyticsCharts from './analytics/HealthAnalyticsCharts';

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
  bmi?: number;
  smoking?: number;
}

interface PredictionResult {
  prediction: number;
  confidence: number;
  risk_score?: number;
  risk_level: string;
  advice?: string[];
  contributing_factors: Array<{
    feature: string;
    importance: number;
    value: string;
  }>;
}

interface ResultsProps {
  result: PredictionResult;
  healthData: HealthData;
  onNewPrediction: () => void;
  darkMode: boolean;
}

const Results: React.FC<ResultsProps> = ({ result, healthData, onNewPrediction, darkMode }) => {
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return 'text-medical-green-600 bg-medical-green-100 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-amber-900/30 dark:text-amber-300';
      case 'High':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return <CheckCircle className="w-8 h-8 text-medical-green-600" />;
      case 'Medium':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'High':
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <Heart className="w-8 h-8 text-gray-600" />;
    }
  };

  const displayAdvice =
    result.advice && result.advice.length > 0
      ? result.advice
      : result.prediction === 0
        ? [
            'Continue maintaining a healthy lifestyle',
            'Regular exercise (30 minutes, 5 days a week)',
            'Balanced diet rich in fruits and vegetables',
            'Regular health check-ups',
          ]
        : [
            'Consult with a cardiologist',
            'Follow prescribed medications strictly',
            'Adopt a heart-healthy diet',
            'Monitor blood pressure and cholesterol regularly',
          ];

  const riskScore = result.risk_score ?? result.confidence;

  const handleDownloadPdf = () => {
    generateMedicalReportPDF({ patient: user, healthData, result });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Your Heart Health Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your health parameters and AI analysis
        </p>
      </div>

      <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="text-center">
          <div className="mb-6">{getRiskIcon(result.risk_level)}</div>
          <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg mb-4 ${getRiskColor(result.risk_level)}`}>
            {result.prediction === 1 ? 'Heart Disease Risk Detected' : 'Low Heart Disease Risk'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {result.confidence.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {riskScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Risk Score</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${getRiskColor(result.risk_level).split(' ')[0]}`}>
                {result.risk_level}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
            </div>
          </div>
        </div>
      </div>

      <HealthAnalyticsCharts healthData={healthData} result={result} darkMode={darkMode} />

      <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Health Recommendations
        </h3>
        <ul className="space-y-3">
          {displayAdvice.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold mt-0.5">
                {index + 1}
              </div>
              <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <FileText className="w-5 h-5" />
          <span>Preview Report</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
        <button
          type="button"
          onClick={onNewPrediction}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>New Assessment</span>
        </button>
      </div>

      <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} border-l-4 border-yellow-500`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Important Medical Disclaimer</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This assessment is for educational purposes only and should not be used as a substitute for
              professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </div>

      <ReportPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        patient={user}
        healthData={healthData}
        result={result}
      />
    </div>
  );
};

export default Results;
