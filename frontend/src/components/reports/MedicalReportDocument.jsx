import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';
import { buildReportData } from '../../utils/reportGenerator';
import { formatFeatureName } from '../../utils/reportLabels';

const riskStyles = {
  Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const MedicalReportDocument = ({ patient, healthData, result }) => {
  const data = buildReportData({ patient, healthData, result });
  const riskClass = riskStyles[data.result.risk_level] || riskStyles.Low;

  const pieData = [
    {
      name: 'Score',
      value: data.result.confidence,
      color: data.result.prediction === 1 ? '#ef4444' : '#14b8a6',
    },
    {
      name: 'Remainder',
      value: 100 - data.result.confidence,
      color: '#e2e8f0',
    },
  ];

  const barData = data.result.contributing_factors.map((f) => ({
    name: formatFeatureName(f.feature),
    importance: f.importance,
  }));

  return (
    <div className="bg-white text-slate-800 rounded-lg overflow-hidden shadow-inner">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">MediAI Health</h2>
              <p className="text-teal-100 text-sm">Cardiovascular Risk Assessment Report</p>
            </div>
          </div>
          <p className="text-xs text-teal-100">{data.generatedAt}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient */}
        <section>
          <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3">
            Patient Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Name</span>
              <p className="font-medium">{data.patient.name}</p>
            </div>
            <div>
              <span className="text-slate-500">Email</span>
              <p className="font-medium">{data.patient.email}</p>
            </div>
            <div>
              <span className="text-slate-500">Date of Birth</span>
              <p className="font-medium">{data.patient.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-slate-500">Report ID</span>
              <p className="font-medium font-mono text-xs">
                {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section>
          <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3">
            Assessment Summary
          </h3>
          <div className={`rounded-xl border-2 p-4 ${riskClass}`}>
            <p className="text-lg font-bold">{data.result.predictionLabel}</p>
            <div className="grid grid-cols-3 gap-4 mt-3 text-center">
              <div>
                <p className="text-2xl font-bold">{data.result.confidence.toFixed(1)}%</p>
                <p className="text-xs opacity-80">Confidence</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.result.risk_score.toFixed(1)}%</p>
                <p className="text-xs opacity-80">Risk Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{data.result.risk_level}</p>
                <p className="text-xs opacity-80">Risk Level</p>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section>
          <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3">
            Visual Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-2 text-center">
                Confidence Score
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Contributing Factors
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Advice */}
        <section>
          <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3">
            Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {data.result.advice.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Factors table */}
        {data.result.contributing_factors.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide mb-3">
              Factor Analysis
            </h3>
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Factor</th>
                  <th className="text-left px-3 py-2">Value</th>
                  <th className="text-right px-3 py-2">Importance</th>
                </tr>
              </thead>
              <tbody>
                {data.result.contributing_factors.map((f, i) => (
                  <tr key={i} className={i % 2 ? 'bg-slate-50' : ''}>
                    <td className="px-3 py-2">{formatFeatureName(f.feature)}</td>
                    <td className="px-3 py-2">{f.value}</td>
                    <td className="px-3 py-2 text-right font-medium">{f.importance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Disclaimer */}
        <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            This report is for educational purposes only and does not replace professional
            medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalReportDocument;
