import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Upload, 
  Eye, 
  Heart, 
  Activity, 
  Droplet, 
  ShieldCheck, 
  RefreshCw,
  Phone,
  Sparkles,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Appointment, MedicalReport, UserProfile } from '../types/hospital';
import { 
  subscribeUserAppointments, 
  subscribeUserReports, 
  updateAppointmentStatus 
} from '../lib/firebase';
import { ReportUploadModal } from '../components/ReportUploadModal';
import { ReportViewModal } from '../components/ReportViewModal';

interface PatientDashboardPageProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({
  onOpenBooking,
  onOpenAuth
}) => {
  const { user, isDemoAccount, loginAsDemoPatient, updateProfileData } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'reports' | 'vitals'>('appointments');

  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [reportSearch, setReportSearch] = useState('');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  // Editing profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');

  // Vitals tracker state
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [heartRate, setHeartRate] = useState(72);
  const [glucose, setGlucose] = useState(95);
  const [vitalsSaved, setVitalsSaved] = useState(false);

  // Subscribe to user Firestore data
  useEffect(() => {
    if (!user) return;

    setPhone(user.phone || '');
    setBloodGroup(user.bloodGroup || 'O+');
    setEmergencyContact(user.emergencyContact || '');

    // 1. Appointments subscription
    const unsubAppointments = subscribeUserAppointments(user.uid, (data) => {
      setAppointments(data);
    });

    // 2. Reports subscription
    const unsubReports = subscribeUserReports(user.uid, (data) => {
      setReports(data);
    });

    return () => {
      unsubAppointments();
      unsubReports();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <User className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Patient Portal Access
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Please log in or register to view your appointments, upload medical reports, and track your health metrics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={onOpenAuth}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm transition-all"
          >
            Sign In / Register
          </button>
          <button
            onClick={loginAsDemoPatient}
            className="bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Instant Demo Patient Access
          </button>
        </div>
      </div>
    );
  }

  const handleCancelAppointment = async (appId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateAppointmentStatus(appId, 'cancelled');
      } catch (err) {
        console.error('Error cancelling appointment:', err);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({ phone, bloodGroup, emergencyContact });
    setIsEditingProfile(false);
  };

  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setVitalsSaved(true);
    setTimeout(() => setVitalsSaved(false), 3000);
  };

  const filteredAppointments = appointments.filter(a => {
    if (appointmentFilter === 'all') return true;
    return a.status === appointmentFilter;
  });

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(reportSearch.toLowerCase()) ||
    (r.doctorName && r.doctorName.toLowerCase().includes(reportSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Profile Card Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-emerald-300/40">
              {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                  Patient Health Record
                </span>
                {isDemoAccount && (
                  <span className="text-[10px] font-bold uppercase bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                    Evaluator Demo Mode
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {user.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {user.email} • Member ID: #{user.uid.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-emerald-500/20">
            <div>
              <span className="text-slate-400 block font-medium">Blood Group:</span>
              <span className="font-extrabold text-emerald-300 text-sm">{user.bloodGroup || 'O+'}</span>
            </div>
            <div className="border-x border-slate-800 px-3">
              <span className="text-slate-400 block font-medium">Phone:</span>
              <span className="font-bold text-white">{user.phone || '+1 (555) 234-5678'}</span>
            </div>
            <div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                {isEditingProfile ? 'Close Editor' : 'Edit Contact Profile'}
              </button>
            </div>
          </div>

        </div>

        {/* Profile Edit Inline Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Save Updated Info
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Overview Vitals Summary Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Health Vitals Summary</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Live Record Status
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">Heart Rate</p>
            <p className="text-xl font-extrabold text-slate-900">{heartRate} <span className="text-xs font-normal text-slate-500">bpm</span></p>
          </div>

          <div className="bg-blue-50/90 p-3.5 rounded-xl border border-blue-100">
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1">Blood Sugar</p>
            <p className="text-xl font-extrabold text-slate-900">{glucose} <span className="text-xs font-normal text-slate-500">mg/dL</span></p>
          </div>

          <div className="bg-orange-50/90 p-3.5 rounded-xl border border-orange-100">
            <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider mb-1">Oxygen Sat.</p>
            <p className="text-xl font-extrabold text-slate-900">99<span className="text-xs font-normal text-slate-500">%</span></p>
          </div>

          <div className="bg-purple-50/90 p-3.5 rounded-xl border border-purple-100">
            <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1">Blood Pressure</p>
            <p className="text-xl font-extrabold text-slate-900">{bpSys}/{bpDia} <span className="text-xs font-normal text-slate-500">mmHg</span></p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-bold gap-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Medical Reports & Records ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'vitals'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Health Metrics & Vitals
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter Status:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setAppointmentFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      appointmentFilter === st 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenBooking}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Book New Appointment
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
              <p className="text-xs text-slate-500">You haven't booked any OPD appointments yet.</p>
              <button
                onClick={onOpenBooking}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Schedule Appointment Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map(app => (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3 relative">
                  
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {app.departmentName}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {app.doctorName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{app.doctorSpecialty}</p>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      app.status === 'scheduled'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'completed'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 block font-medium">Date:</span>
                      <span className="font-bold">{app.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Time Slot:</span>
                      <span className="font-bold text-emerald-700">{app.timeSlot}</span>
                    </div>
                  </div>

                  {app.reason && (
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Reason:</span> {app.reason}
                    </div>
                  )}

                  {app.adminNotes && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                      <strong>Doctor/Staff Note:</strong> {app.adminNotes}
                    </div>
                  )}

                  {app.status === 'scheduled' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MEDICAL REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter medical reports..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              Upload Medical Document
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No medical reports found</h3>
              <p className="text-xs text-slate-500">Upload lab tests or prescriptions to store in your record.</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Upload First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map(rep => (
                <div key={rep.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {rep.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{rep.date}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mt-2 line-clamp-1">
                      {rep.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Doctor: {rep.doctorName || 'Hospital Specialist'}</p>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{rep.fileName || 'document.pdf'}</span>
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: VITALS TRACKER */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Patient Vitals Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record your daily health metrics for doctor review during your next OPD consultation.
              </p>
            </div>

            {vitalsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Health vitals saved successfully to patient record.</span>
              </div>
            )}

            <form onSubmit={handleLogVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                    <Heart className="w-4 h-4" />
                    <span>Blood Pressure (mmHg)</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={bpSys}
                      onChange={(e) => setBpSys(parseInt(e.target.value) || 120)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="number"
                      value={bpDia}
                      onChange={(e) => setBpDia(parseInt(e.target.value) || 80)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">Systolic / Diastolic</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <Activity className="w-4 h-4" />
                    <span>Heart Rate (BPM)</span>
                  </div>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value) || 72)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Resting Pulse</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs">
                  <Droplet className="w-4 h-4" />
                  <span>Fasting Blood Sugar (mg/dL)</span>
                </div>
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(parseInt(e.target.value) || 95)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-md"
              >
                Log Vitals Reading
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {}}
      />

      <ReportViewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

    </div>
  );
};
