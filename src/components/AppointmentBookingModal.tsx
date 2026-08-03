import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Stethoscope, 
  Building2, 
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { matchDoctorWithGemini } from '../lib/geminiClient';
import { Department, Doctor } from '../types/hospital';
import { createAppointment } from '../lib/firebase';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  doctors: Doctor[];
  initialDeptId?: string;
  initialDocId?: string;
  onBookingSuccess: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  departments,
  doctors,
  initialDeptId,
  initialDocId,
  onBookingSuccess
}) => {
  const { user, loginAsDemoPatient } = useAuth();

  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDeptId || departments[0]?.id || '');
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || '');
  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  
  const [patientName, setPatientName] = useState<string>(user?.name || '');
  const [patientEmail, setPatientEmail] = useState<string>(user?.email || '');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '');
  const [reason, setReason] = useState<string>('');

  const [symptomInput, setSymptomInput] = useState<string>('');
  const [matchingAi, setMatchingAi] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleAiMatchSymptoms = async () => {
    if (!symptomInput.trim()) return;
    setMatchingAi(true);
    setAiMatchResult(null);

    try {
      const recommendationText = await matchDoctorWithGemini(
        symptomInput,
        departments.map(d => ({ id: d.id, name: d.name, description: d.description })),
        doctors.map(d => ({ id: d.id, name: d.name, specialty: d.specialty, departmentId: d.departmentId, qualification: d.qualification }))
      );

      setAiMatchResult(recommendationText);

      // Auto-preselect matched doctor or department if mentioned in response
      const recText = recommendationText.toLowerCase();
      const matchedDoc = doctors.find(d => recText.includes(d.name.toLowerCase()));
      if (matchedDoc) {
        setSelectedDeptId(matchedDoc.departmentId);
        setSelectedDocId(matchedDoc.id);
      } else {
        const matchedDept = departments.find(d => recText.includes(d.name.toLowerCase()));
        if (matchedDept) {
          setSelectedDeptId(matchedDept.id);
        }
      }

      setReason(symptomInput);
    } catch (err: any) {
      console.error('AI Matcher Error:', err);
      setError(err.message || 'Unable to analyze symptoms at this time.');
    } finally {
      setMatchingAi(false);
    }
  };

  // Sync initial values
  useEffect(() => {
    if (initialDeptId) {
      setSelectedDeptId(initialDeptId);
    }
    if (initialDocId) {
      setSelectedDocId(initialDocId);
    }
  }, [initialDeptId, initialDocId]);

  // Update prefilled user info when user changes
  useEffect(() => {
    if (user) {
      setPatientName(user.name || '');
      setPatientEmail(user.email || '');
      setPatientPhone(user.phone || '');
    }
  }, [user]);

  // Filter available doctors by department
  const filteredDoctors = doctors.filter(d => !selectedDeptId || d.departmentId === selectedDeptId);

  // Default time slots
  const selectedDoctor = doctors.find(d => d.id === selectedDocId);
  const availableTimeSlots = selectedDoctor?.timeSlots || ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM', '05:00 PM'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDocId) {
      setError('Please select a doctor for your appointment.');
      return;
    }

    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      setError('Please complete patient contact information.');
      return;
    }

    setSubmitting(true);

    try {
      const docObj = doctors.find(d => d.id === selectedDocId);
      const deptObj = departments.find(d => d.id === selectedDeptId);

      const newAppointmentId = await createAppointment({
        patientId: user?.uid || 'guest-patient-' + Date.now(),
        patientName,
        patientEmail,
        patientPhone,
        doctorId: selectedDocId,
        doctorName: docObj?.name || 'Doctor',
        doctorSpecialty: docObj?.specialty || 'General Physician',
        departmentId: selectedDeptId,
        departmentName: deptObj?.name || 'General Department',
        date,
        timeSlot,
        reason: reason.trim() || 'General Medical Consultation',
        status: 'scheduled'
      });

      setConfirmedId(newAppointmentId);
      onBookingSuccess();
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedId(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
              Online OPD Scheduling
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Book Doctor Appointment
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Choose your specialty, doctor, date & time slot with instant Firestore confirmation.
          </p>
        </div>

        <div className="p-6">
          
          {confirmedId ? (
            /* Confirmation Success Card */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Appointment Confirmed
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  Booking Reference: #{confirmedId.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  A confirmation summary has been logged to your patient dashboard and Firestore account.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-800">{patientName} ({patientEmail})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-emerald-800">{selectedDoctor?.name || 'Doctor'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">{departments.find(d => d.id === selectedDeptId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-900">{date} at {timeSlot}</span>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  onClick={handleResetAndClose}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                >
                  Done & Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">

              {!user && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Want to auto-fill patient details?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loginAsDemoPatient()}
                    className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-xl hover:bg-emerald-700 transition-all text-[11px]"
                  >
                    Quick Demo Fill
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* AI Symptom Checker & Doctor Matcher Card */}
              <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-3.5 rounded-2xl border border-emerald-800/40 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span className="text-xs font-bold text-white">Unsure which doctor to pick? Ask OpenRouter AI</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe your symptoms (e.g. sharp knee pain, persistent headache)..."
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className="flex-1 bg-slate-950/80 text-white placeholder-slate-400 text-xs px-3 py-2 rounded-xl border border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleAiMatchSymptoms}
                    disabled={matchingAi || !symptomInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1"
                  >
                    {matchingAi ? 'Matching...' : 'Match Doctor'}
                  </button>
                </div>

                {aiMatchResult && (
                  <div className="bg-slate-950/90 p-3 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-100 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {aiMatchResult}
                  </div>
                )}
              </div>

              {/* Step 1: Department & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Medical Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedDocId('');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    Select Specialist Doctor
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {filteredDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    {availableTimeSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Patient Information */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider text-slate-400">
                  Patient Contact Details
                </h4>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Patient Full Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Patient Email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Phone Number for SMS alert"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder="Symptoms or reason for consultation (Optional)..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Connecting to Firestore & Booking...' : 'Confirm Appointment Booking'}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
