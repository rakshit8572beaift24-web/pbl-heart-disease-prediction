import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { Heart, Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignupRedirect: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, darkMode, toggleDarkMode, onSignupRedirect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    // Send login request to backend
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(email, password);
        setIsLoading(false);
      } else {
        // Check if it's demo credentials
        if (email === 'demo@health.com' && password === 'demo123') {
          onLogin(email, password);
          setIsLoading(false);
        } else {
          const errorData = await response.json();
          setErrors({ general: errorData.detail || 'Invalid email or password. Try demo@health.com / demo123' });
          setIsLoading(false);
        }
      }
    } catch (error) {
      // Fallback to demo credentials on network error
      if (email === 'demo@health.com' && password === 'demo123') {
        onLogin(email, password);
        setIsLoading(false);
      } else {
        setErrors({ general: 'Network error. Please try again or use demo credentials.' });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-medical-blue-50 to-medical-green-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <div className="w-5 h-5 text-yellow-500">☀️</div>
          ) : (
            <div className="w-5 h-5 text-gray-700">🌙</div>
          )}
        </button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-medical-blue-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-medical-blue-600" />
          </div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Welcome Back
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Sign in to your Heart Disease Predictor account
          </p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 transition-all duration-200`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 transition-all duration-200`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-medical-blue-600 hover:text-medical-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-medical-blue-600 hover:bg-medical-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className={`mt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Demo Credentials
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                      Use these credentials to test the system:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100">
                          demo@health.com
                        </span>
                        <span className="text-blue-600 dark:text-blue-400">/</span>
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100">
                          demo123
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Email: demo@health.com
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Password: demo123
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                      <strong>Note:</strong> In production, you would use your actual credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              Don't have an account?{' '}
              <button
                onClick={onSignupRedirect}
                className="font-medium text-medical-blue-600 hover:text-medical-blue-500"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
