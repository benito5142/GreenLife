import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Calendar, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ReportCategory } from '../types/hospital';
import { createMedicalReport } from '../lib/firebase';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: ReportCategory[] = [
  'Lab Result',
  'X-Ray / Imaging',
  'Prescription',
  'Discharge Summary',
  'Checkup Summary'
];

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Lab Result');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to upload medical reports.');
      return;
    }

    if (!title.trim() || !summary.trim()) {
      setError('Please provide report title and summary details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createMedicalReport({
        patientId: user.uid,
        patientName: user.name || 'Patient',
        title: title.trim(),
        category,
        doctorName: doctorName.trim() || 'Attending Physician',
        date,
        summary: summary.trim(),
        fileName: fileName || `${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_document.pdf`,
        fileSize: fileSize || '1.4 MB',
        fileDataUrl: fileDataUrl || undefined,
        status: 'Final'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error uploading report:', err);
      setError(err.message || 'Failed to save report to database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
              Health File Management
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Upload Medical Report
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Securely save lab results, prescriptions, and radiology scans to your Firestore portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Blood Lipid Profile / MRI Spine Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prescribing Doctor / Hospital (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Jenkins"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document File Upload</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Click or drag PDF / Image file here'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {fileSize ? `Size: ${fileSize}` : 'Supports PDF, JPG, PNG up to 10MB'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Key Findings & Doctor Summary</label>
            <textarea
              rows={3}
              required
              placeholder="Enter key findings, doctor observations, test values..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Uploading to Firestore...' : 'Save Report to Medical Record'}
          </button>

        </form>
      </div>
    </div>
  );
};
