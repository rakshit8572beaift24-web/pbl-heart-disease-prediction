import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import MedicalReportDocument from './MedicalReportDocument';
import { generateMedicalReportPDF } from '../../utils/reportGenerator';

const ReportPreviewModal = ({
  isOpen,
  onClose,
  patient,
  healthData,
  result,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    generateMedicalReportPDF({ patient, healthData, result });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Report Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950">
          <MedicalReportDocument
            patient={patient}
            healthData={healthData}
            result={result}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
