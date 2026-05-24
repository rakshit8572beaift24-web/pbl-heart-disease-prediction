import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatFeatureName, formatHealthValue } from './reportLabels';

const COLORS = {
  primary: [13, 148, 136],
  primaryDark: [15, 118, 110],
  accent: [6, 182, 212],
  low: [34, 197, 94],
  medium: [234, 179, 8],
  high: [239, 68, 68],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  light: [241, 245, 249],
};

const riskColor = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'high') return COLORS.high;
  if (l === 'medium') return COLORS.medium;
  return COLORS.low;
};

const drawHeader = (doc, title) => {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 36, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MediAI Health', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Cardiovascular Risk Assessment Report', 14, 24);
  doc.setFontSize(9);
  doc.text(title, 14, 32);

  doc.setTextColor(...COLORS.muted);
  doc.text(new Date().toLocaleString(), 196, 16, { align: 'right' });
};

const drawSectionTitle = (doc, y, text) => {
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(14, y, 182, 8, 1, 1, 'F');
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 18, y + 5.5);
  return y + 12;
};

const drawDonutChart = (doc, cx, cy, r, percent, color) => {
  const start = -Math.PI / 2;
  const end = start + (Math.PI * 2 * percent) / 100;
  doc.setFillColor(226, 232, 240);
  doc.circle(cx, cy, r, 'F');
  doc.setFillColor(...color);
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const a1 = start + ((end - start) * i) / steps;
    const a2 = start + ((end - start) * (i + 1)) / steps;
    doc.triangle(
      cx,
      cy,
      cx + r * Math.cos(a1),
      cy + r * Math.sin(a1),
      cx + r * Math.cos(a2),
      cy + r * Math.sin(a2),
      'F'
    );
  }
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, r * 0.55, 'F');
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${percent.toFixed(1)}%`, cx, cy + 2, { align: 'center' });
};

const drawBarChart = (doc, x, y, w, h, factors) => {
  if (!factors?.length) return;
  const maxVal = Math.max(...factors.map((f) => f.importance), 1);
  const barH = Math.min(8, (h - 10) / factors.length);
  let cy = y + 8;

  factors.forEach((f) => {
    const barW = (f.importance / maxVal) * (w - 50);
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const label = formatFeatureName(f.feature).slice(0, 18);
    doc.text(label, x, cy + 4);
    doc.setFillColor(...COLORS.light);
    doc.roundedRect(x + 42, cy, w - 52, barH, 1, 1, 'F');
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(x + 42, cy, barW, barH, 1, 1, 'F');
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(7);
    doc.text(`${f.importance}%`, x + w - 8, cy + 4, { align: 'right' });
    cy += barH + 4;
  });
};

export const buildReportData = ({ patient, healthData, result }) => {
  const advice =
    result.advice?.length > 0
      ? result.advice
      : result.prediction === 0
        ? [
            'Continue maintaining a healthy lifestyle',
            'Regular exercise and balanced diet',
            'Schedule routine health check-ups',
          ]
        : [
            'Consult with a cardiologist',
            'Monitor blood pressure and cholesterol',
            'Adopt a heart-healthy diet',
          ];

  return {
    patient: {
      name: patient
        ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient'
        : 'Patient',
      email: patient?.email || '—',
      dateOfBirth: patient?.dateOfBirth || '—',
    },
    generatedAt: new Date().toLocaleString(),
    healthData,
    result: {
      prediction: result.prediction,
      predictionLabel:
        result.prediction === 1 ? 'Elevated Risk Detected' : 'Low Risk',
      confidence: result.confidence,
      risk_score: result.risk_score ?? result.confidence,
      risk_level: result.risk_level,
      contributing_factors: result.contributing_factors || [],
      advice,
    },
  };
};

export const generateMedicalReportPDF = ({ patient, healthData, result }) => {
  const data = buildReportData({ patient, healthData, result });
  const doc = new jsPDF();
  const rc = riskColor(data.result.risk_level);

  drawHeader(doc, 'Confidential Medical Report');

  let y = 48;
  y = drawSectionTitle(doc, y, 'Patient Information');

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [],
    body: [
      ['Patient Name', data.patient.name],
      ['Email', data.patient.email],
      ['Date of Birth', data.patient.dateOfBirth],
      ['Report Generated', data.generatedAt],
    ],
    theme: 'plain',
    styles: { fontSize: 9, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: COLORS.muted },
      1: { cellWidth: 'auto' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  y = drawSectionTitle(doc, y, 'Assessment Summary');

  doc.setFillColor(...rc);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.result.predictionLabel, 18, y + 9);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Risk Level: ${data.result.risk_level}`, 18, y + 17);

  doc.setFontSize(9);
  doc.text(`Confidence: ${data.result.confidence.toFixed(1)}%`, 120, y + 9);
  doc.text(`Risk Score: ${data.result.risk_score.toFixed(1)}%`, 120, y + 17);

  y += 30;
  y = drawSectionTitle(doc, y, 'Visual Analysis');

  drawDonutChart(doc, 55, y + 28, 22, data.result.confidence, rc);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(8);
  doc.text('Confidence Score', 55, y + 56, { align: 'center' });

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Contributing Factors', 105, y + 4);
  drawBarChart(doc, 100, y, 95, 52, data.result.contributing_factors);

  y += 62;
  y = drawSectionTitle(doc, y, 'Health Parameters');

  const healthRows = Object.entries(data.healthData || {}).map(([k, v]) => [
    formatFeatureName(k),
    formatHealthValue(k, v),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Parameter', 'Value']],
    body: healthRows,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: { fontSize: 8, textColor: COLORS.text },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = doc.lastAutoTable.finalY + 8;

  if (y > 240) {
    doc.addPage();
    drawHeader(doc, 'Confidential Medical Report (continued)');
    y = 48;
  }

  y = drawSectionTitle(doc, y, 'Personalized Recommendations');

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    body: data.result.advice.map((item, i) => [`${i + 1}.`, item]),
    theme: 'plain',
    styles: { fontSize: 9, textColor: COLORS.text, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: 'bold', textColor: COLORS.primary },
      1: { cellWidth: 'auto' },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (data.result.contributing_factors?.length) {
    if (y > 230) {
      doc.addPage();
      y = 48;
    }
    y = drawSectionTitle(doc, y, 'Factor Analysis Detail');
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Factor', 'Your Value', 'Importance (%)']],
      body: data.result.contributing_factors.map((f) => [
        formatFeatureName(f.feature),
        f.value,
        f.importance.toFixed(1),
      ]),
      headStyles: {
        fillColor: COLORS.primaryDark,
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 8 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  const footerY = Math.min(y + 6, 275);
  doc.setDrawColor(...COLORS.medium);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, 196, footerY);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'DISCLAIMER: This report is generated by an AI-assisted tool for educational purposes only. ' +
      'It does not constitute medical diagnosis or treatment. Always consult a qualified healthcare professional.',
    14,
    footerY + 5,
    { maxWidth: 182 }
  );

  const filename = `MediAI-Heart-Report-${data.patient.name.replace(/\s+/g, '-')}-${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  doc.save(filename);
  return filename;
};

export default generateMedicalReportPDF;
