import React, { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import HealthForm from '../components/HealthForm';
import CompareForm from '../components/CompareForm';
import Results from '../components/Results';
import CompareResults from '../components/CompareResults';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState(null);

  const handlePrediction = (result, data) => {
    setPredictionResult(result);
    setHealthData(data);
    setCompareResults(null);
  };

  const handleCompare = (data) => {
    setCompareResults(data);
    setPredictionResult(null);
    setHealthData(null);
  };

  const handleNewPrediction = () => {
    setPredictionResult(null);
    setHealthData(null);
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setCompareResults(null);
  };

  const handleModeToggle = (mode) => {
    setCompareMode(mode);
    setPredictionResult(null);
    setHealthData(null);
    setCompareResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 animate-fade-in-up">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 dark:border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg shadow-teal-500/20">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                  Heart Disease Predictor
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Welcome back, {user?.firstName}! Advanced ML-powered health assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400">
            Choose a mode:
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleModeToggle(false)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${compareMode ? 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          >
            Single Profile
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle(true)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${compareMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}
          >
            Compare Patients
          </button>
        </div>
      </div>

      <main>
        {!compareMode ? (
          !predictionResult ? (
            <HealthForm onPrediction={handlePrediction} darkMode={darkMode} />
          ) : (
            <Results
              result={predictionResult}
              healthData={healthData}
              onNewPrediction={handleNewPrediction}
              darkMode={darkMode}
            />
          )
        ) : !compareResults ? (
          <CompareForm onCompare={handleCompare} onCancel={handleCancelCompare} darkMode={darkMode} />
        ) : (
          <CompareResults
            resultA={compareResults.resultA}
            resultB={compareResults.resultB}
            healthDataA={compareResults.healthDataA}
            healthDataB={compareResults.healthDataB}
            onReset={handleCancelCompare}
            darkMode={darkMode}
          />
        )}
      </main>

      <footer className="mt-16 animate-fade-in-up">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 dark:border-slate-700/50 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-300">Medical Disclaimer</span>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong>Important:</strong> This tool is for educational purposes only and should not
                be used as a substitute for professional medical advice.
              </p>
              <p>Always consult qualified healthcare professionals for medical concerns and diagnosis.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
