import React, { useMemo } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import '../../config/chartSetup';
import ChartCard from './ChartCard';
import { useChartTheme, baseAnimation, centerTextPlugin } from './useChartTheme';
import {
  getBmi,
  getBmiCategory,
  computeHealthScore,
  getCholesterolTrend,
  getRiskGaugeColor,
  getHealthScoreColor,
} from '../../utils/healthAnalytics';
import { formatFeatureName } from '../../utils/reportLabels';

const HealthAnalyticsCharts = ({ healthData, result, darkMode }) => {
  const theme = useChartTheme(darkMode);
  const riskScore = result.risk_score ?? result.confidence;
  const confidence = result.confidence;
  const bmi = getBmi(healthData);
  const bmiCat = getBmiCategory(bmi);
  const healthScore = computeHealthScore(healthData, result);
  const cholTrend = getCholesterolTrend(healthData.cholesterol);

  const gaugeOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnimation,
      circumference: 180,
      rotation: 270,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        centerText: {
          value: `${riskScore.toFixed(0)}%`,
          sub: result.risk_level,
          color: theme.text,
          subColor: theme.muted,
        },
      },
    }),
    [riskScore, result.risk_level, theme]
  );

  const riskGaugeData = useMemo(
    () => ({
      labels: ['Risk', 'Remainder'],
      datasets: [
        {
          data: [riskScore, Math.max(0, 100 - riskScore)],
          backgroundColor: [getRiskGaugeColor(riskScore), darkMode ? '#1e293b' : '#f1f5f9'],
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    }),
    [riskScore, darkMode]
  );

  const confidenceData = useMemo(
    () => ({
      labels: ['Confidence', 'Uncertainty'],
      datasets: [
        {
          data: [confidence, Math.max(0, 100 - confidence)],
          backgroundColor: [
            result.prediction === 1 ? '#ef4444' : '#14b8a6',
            darkMode ? '#334155' : '#e2e8f0',
          ],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [confidence, result.prediction, darkMode]
  );

  const confidenceOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { ...baseAnimation, animateRotate: true, animateScale: true },
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: theme.text, padding: 16, usePointStyle: true },
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.muted,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
        },
        centerText: {
          value: `${confidence.toFixed(1)}%`,
          sub: 'Model confidence',
          color: theme.text,
          subColor: theme.muted,
        },
      },
    }),
    [confidence, theme]
  );

  const bmiData = useMemo(
    () => ({
      labels: ['Underweight', 'Normal', 'Overweight', 'Obese', 'You'],
      datasets: [
        {
          label: 'BMI Range (upper bound)',
          data: [18.5, 25, 30, 40, bmi],
          backgroundColor: [
            'rgba(59, 130, 246, 0.35)',
            'rgba(34, 197, 94, 0.35)',
            'rgba(234, 179, 8, 0.35)',
            'rgba(239, 68, 68, 0.35)',
            bmiCat.color,
          ],
          borderColor: [
            '#3b82f6',
            '#22c55e',
            '#eab308',
            '#ef4444',
            bmiCat.color,
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    }),
    [bmi, bmiCat.color]
  );

  const bmiOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnimation,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.muted,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: theme.muted, maxRotation: 45, minRotation: 0 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          max: 45,
          ticks: { color: theme.muted },
          grid: { color: theme.grid },
          title: {
            display: true,
            text: 'BMI (kg/m²)',
            color: theme.muted,
          },
        },
      },
    }),
    [theme]
  );

  const cholData = useMemo(
    () => ({
      labels: cholTrend.map((d) => d.label),
      datasets: [
        {
          label: 'Your cholesterol',
          data: cholTrend.map((d) => d.value),
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#0d9488',
        },
        {
          label: 'Optimal (200)',
          data: cholTrend.map((d) => d.optimal),
          borderColor: '#22c55e',
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Borderline (240)',
          data: cholTrend.map((d) => d.borderline),
          borderColor: '#eab308',
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    }),
    [cholTrend]
  );

  const cholOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnimation,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: theme.text, usePointStyle: true, padding: 12 },
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.muted,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: theme.muted },
          grid: { color: theme.grid },
        },
        y: {
          ticks: { color: theme.muted },
          grid: { color: theme.grid },
          title: {
            display: true,
            text: 'mg/dL',
            color: theme.muted,
          },
        },
      },
    }),
    [theme]
  );

  const healthScoreData = useMemo(
    () => ({
      labels: ['Score', 'Gap'],
      datasets: [
        {
          data: [healthScore, 100 - healthScore],
          backgroundColor: [getHealthScoreColor(healthScore), darkMode ? '#1e293b' : '#f1f5f9'],
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    }),
    [healthScore, darkMode]
  );

  const healthScoreOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnimation,
      circumference: 180,
      rotation: 270,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        centerText: {
          value: healthScore,
          sub: healthScore >= 75 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Needs care',
          color: theme.text,
          subColor: getHealthScoreColor(healthScore),
        },
      },
    }),
    [healthScore, theme]
  );

  const factors = result.contributing_factors || [];

  const factorsData = useMemo(
    () => ({
      labels: factors.map((f) => formatFeatureName(f.feature)),
      datasets: [
        {
          label: 'Importance %',
          data: factors.map((f) => f.importance),
          backgroundColor: 'rgba(13, 148, 136, 0.75)',
          borderColor: '#0d9488',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [factors]
  );

  const factorsOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnimation,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.muted,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { color: theme.muted },
          grid: { color: theme.grid },
        },
        y: {
          ticks: { color: theme.muted, font: { size: 10 } },
          grid: { display: false },
        },
      },
    }),
    [theme]
  );

  return (
    <section className="space-y-4">
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Advanced Health Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Interactive visual insights from your assessment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard title="Risk Gauge" subtitle="Overall cardiovascular risk score" darkMode={darkMode}>
          <div className="h-[220px] w-full max-w-[280px] mx-auto">
            <Doughnut
              data={riskGaugeData}
              options={gaugeOptions}
              plugins={[centerTextPlugin]}
            />
          </div>
        </ChartCard>

        <ChartCard title="Confidence Score" subtitle="Model prediction certainty" darkMode={darkMode}>
          <div className="h-[220px] w-full max-w-[260px] mx-auto">
            <Doughnut
              data={confidenceData}
              options={confidenceOptions}
              plugins={[centerTextPlugin]}
            />
          </div>
        </ChartCard>

        <ChartCard title="Health Score Meter" subtitle="Composite wellness index (0–100)" darkMode={darkMode}>
          <div className="h-[220px] w-full max-w-[280px] mx-auto">
            <Doughnut
              data={healthScoreData}
              options={healthScoreOptions}
              plugins={[centerTextPlugin]}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="BMI Analysis"
          subtitle={`Your BMI: ${bmi} — ${bmiCat.label}`}
          darkMode={darkMode}
          className="md:col-span-1 xl:col-span-1"
        >
          <div className="h-[240px] w-full">
            <Bar data={bmiData} options={bmiOptions} />
          </div>
        </ChartCard>

        <ChartCard
          title="Cholesterol Trends"
          subtitle="Estimated trajectory vs clinical targets"
          darkMode={darkMode}
          className="md:col-span-2 xl:col-span-2"
        >
          <div className="h-[260px] w-full">
            <Line data={cholData} options={cholOptions} />
          </div>
        </ChartCard>

        {factors.length > 0 && (
          <ChartCard
            title="Contributing Factors"
            subtitle="Key drivers behind your risk assessment"
            darkMode={darkMode}
            className="md:col-span-2 xl:col-span-3"
          >
            <div className="h-[220px] w-full">
              <Bar data={factorsData} options={factorsOptions} />
            </div>
          </ChartCard>
        )}
      </div>
    </section>
  );
};

export default HealthAnalyticsCharts;
