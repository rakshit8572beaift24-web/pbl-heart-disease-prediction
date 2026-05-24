import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileFormData {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  smoking: number;
  alcohol_intake: number;
  physical_activity: number;
  bmi: number;
  diabetes: number;
  family_history: number;
  avatar: string;
}

const Profile = () => {
  const { user, updateProfile } = useAuth() as any;
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    smoking: 0,
    alcohol_intake: 0,
    physical_activity: 1,
    bmi: 25,
    diabetes: 0,
    family_history: 0,
    avatar: 'teal',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        smoking: user.smoking ?? 0,
        alcohol_intake: user.alcohol_intake ?? 0,
        physical_activity: user.physical_activity ?? 1,
        bmi: user.bmi ?? 25,
        diabetes: user.diabetes ?? 0,
        family_history: user.family_history ?? 0,
        avatar: user.avatar || 'teal',
      });
    }
  }, [user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'bmi'
        ? parseFloat(value)
        : ['smoking', 'alcohol_intake', 'physical_activity', 'diabetes', 'family_history'].includes(name)
          ? parseInt(value, 10)
          : value,
    } as ProfileFormData));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage('');

    const response = await updateProfile(formData);
    if (response.success) {
      setStatusMessage('Profile updated successfully.');
    } else {
      setStatusMessage(response.error || 'Unable to update profile.');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900/90">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account details and health preferences.</p>
          </div>
          <div className="rounded-2xl bg-teal-500/10 px-4 py-3 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200">
            {darkMode ? 'Dark mode enabled' : 'Light mode enabled'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              First Name
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                required
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Last Name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                required
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Date of Birth
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                required
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              BMI
              <input
                type="number"
                name="bmi"
                value={formData.bmi}
                min="10"
                max="60"
                step="0.1"
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Smoking Status
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Alcohol Intake
              <select
                name="alcohol_intake"
                value={formData.alcohol_intake}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              >
                <option value={0}>None</option>
                <option value={1}>Moderate</option>
                <option value={2}>High</option>
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Physical Activity
              <select
                name="physical_activity"
                value={formData.physical_activity}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              >
                <option value={0}>Low</option>
                <option value={1}>Moderate</option>
                <option value={2}>High</option>
              </select>
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Diabetes
              <select
                name="diabetes"
                value={formData.diabetes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Family History
              <select
                name="family_history"
                value={formData.family_history}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {statusMessage && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{statusMessage}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
