import React from 'react';
import { X, FileText, Download, Calendar, User, Stethoscope, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MedicalReport } from '../types/hospital';

interface ReportViewModalProps {
  report: MedicalReport | null;
  onClose: () => void;
}

export const ReportViewModal: React.FC<ReportViewModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const handleDownloadSimulation = () => {
    // Generate text download simulation
    const content = `GREEN LIFE HOSPITAL - OFFICIAL MEDICAL REPORT
================================================
Report Title: ${report.title}
Category: ${report.category}
Patient Name: ${report.patientName}
Date: ${report.date}
Attending Doctor: ${report.doctorName || 'Green Life Hospital Staff'}

DIAGNOSIS / KEY FINDINGS:
------------------------------------------------
${report.diagnosis || 'No specific pathological diagnosis noted.'}

DETAILED SUMMARY:
------------------------------------------------
${report.summary}

Status: Verified (${report.status})
Document Reference: #${report.id}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.fileName || `report_${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
              Verified Medical Document
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {report.title}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Document ID: #{report.id.slice(0, 10)}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Category:</span>
              <span className="font-bold text-emerald-800">{report.category}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Test Date:</span>
              <span className="font-bold text-slate-800">{report.date}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Patient:</span>
              <span className="font-bold text-slate-800">{report.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Attending Doctor:</span>
              <span className="font-bold text-slate-800">{report.doctorName || 'Hospital Specialist'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
              Clinical Findings & Summary
            </h3>
            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 text-xs text-slate-800 leading-relaxed">
              {report.summary}
            </div>
          </div>

          {report.diagnosis && (
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Medical Diagnosis / Impression
              </h3>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-800">
                {report.diagnosis}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              File: {report.fileName || 'medical_report.pdf'} ({report.fileSize || '1.2 MB'})
            </span>

            <button
              onClick={handleDownloadSimulation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download Record
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
