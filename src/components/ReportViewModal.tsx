import React, { useState } from 'react';
import { X, FileText, Download, Calendar, User, Stethoscope, CheckCircle2, ShieldCheck, Sparkles, Bot, Loader2, HelpCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { MedicalReport } from '../types/hospital';
import { analyzeMedicalReportWithGemini } from '../lib/geminiClient';

interface ReportViewModalProps {
  report: MedicalReport | null;
  onClose: () => void;
}

export const ReportViewModal: React.FC<ReportViewModalProps> = ({ report, onClose }) => {
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!report) return null;

  const handleAnalyzeWithGemini = async () => {
    setAiAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeMedicalReportWithGemini({
        reportTitle: report.title,
        category: report.category,
        summary: report.summary,
        diagnosis: report.diagnosis,
        fileDataUrl: report.fileDataUrl,
      });

      setAiAnalysisResult(result);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setAiError(err.message || 'Gemini service is temporarily unavailable.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    // 1. If user uploaded an actual base64 fileDataUrl (PDF or image), trigger direct download
    if (report.fileDataUrl) {
      const a = document.createElement('a');
      a.href = report.fileDataUrl;
      a.download = report.fileName || `medical_report_${report.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Otherwise generate a high-quality, valid PDF using jsPDF
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner (Emerald Gradient Style)
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.rect(0, 0, 210, 38, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('GREEN LIFE HOSPITAL', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Verified Patient Medical Record', 14, 26);
      doc.text(`Doc Ref: #${report.id.slice(0, 10).toUpperCase()}`, 145, 26);

      // Title
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(report.title, 14, 50);

      // Patient Info Card Container
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.roundedRect(14, 56, 182, 40, 3, 3, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.setFont('helvetica', 'normal');
      doc.text('Patient Name:', 20, 66);
      doc.text('Category:', 20, 74);
      doc.text('Date of Service:', 20, 82);

      doc.text('Attending Physician:', 110, 66);
      doc.text('Document Status:', 110, 74);
      doc.text('Hospital ID:', 110, 82);

      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFont('helvetica', 'bold');
      doc.text(report.patientName || 'Patient Record', 52, 66);
      doc.text(report.category || 'General', 52, 74);
      doc.text(report.date || 'N/A', 52, 82);

      doc.text(report.doctorName || 'Green Life Medical Staff', 152, 66);
      doc.text((report.status || 'Verified').toUpperCase(), 152, 74);
      doc.text('GLH-2026-MED', 152, 82);

      // Section: Clinical Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // Emerald 600
      doc.text('CLINICAL SUMMARY & FINDINGS', 14, 110);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const summaryText = report.summary || 'No detailed clinical summary recorded for this entry.';
      const summaryLines = doc.splitTextToSize(summaryText, 180);
      doc.text(summaryLines, 14, 118);

      let nextY = 118 + (summaryLines.length * 6) + 12;

      // Section: Diagnosis / Impression if available
      if (report.diagnosis) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('MEDICAL DIAGNOSIS / IMPRESSION', 14, nextY);
        nextY += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const diagLines = doc.splitTextToSize(report.diagnosis, 180);
        doc.text(diagLines, 14, nextY);
        nextY += (diagLines.length * 6) + 12;
      }

      // Hospital Verification Stamp / Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 260, 196, 260);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('This medical document is digitally authorized by Green Life Hospital & Care Management System.', 14, 268);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} (UTC)`, 14, 273);

      const pdfName = (report.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'medical_report') + '.pdf';
      doc.save(pdfName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Fallback
      alert('Generating PDF failed. Please try again.');
    }
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

          {/* AI Report Analysis Section */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-4 rounded-2xl border border-emerald-800/40 text-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Gemini AI Medical Explainer
                  </h4>
                  <p className="text-[10px] text-emerald-300/80">Translate lab jargon into plain English</p>
                </div>
              </div>

              <button
                onClick={handleAnalyzeWithGemini}
                disabled={aiAnalyzing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:scale-95"
              >
                {aiAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>{aiAnalysisResult ? 'Re-Analyze with AI' : 'Explain Report'}</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <p className="text-xs text-rose-300 bg-rose-950/50 p-2 rounded-xl border border-rose-800/50">
                ⚠️ {aiError}
              </p>
            )}

            {aiAnalysisResult && (
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-800/40 pb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AI Patient Plain-English Summary
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                  {aiAnalysisResult}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              File: {report.fileName || 'medical_report.pdf'} ({report.fileSize || '1.2 MB'})
            </span>

            <button
              onClick={handleDownloadPDF}
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
