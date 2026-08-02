import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Calendar, 
  Users, 
  Stethoscope, 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Trash2, 
  Eye, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Database,
  RefreshCw,
  Layers,
  Code2,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Doctor, MedicalReport, Department, UserProfile } from '../types/hospital';
import { 
  subscribeAllAppointments, 
  subscribeAllReports, 
  updateAppointmentStatus, 
  deleteDoctorFromDB,
  getAllUsers,
  getRawCollectionDocuments
} from '../lib/firebase';
import { AdminDoctorModal } from '../components/AdminDoctorModal';
import { ReportViewModal } from '../components/ReportViewModal';

interface AdminDashboardPageProps {
  doctors: Doctor[];
  departments: Department[];
  onRefreshDoctors: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  doctors,
  departments,
  onRefreshDoctors
}) => {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'reports' | 'database'>('appointments');

  // Live Database Explorer state
  const [selectedCol, setSelectedCol] = useState<'users' | 'appointments' | 'doctors' | 'reports' | 'departments'>('users');
  const [rawDocs, setRawDocs] = useState<any[]>([]);
  const [loadingRawDocs, setLoadingRawDocs] = useState(false);

  const fetchRawDocs = async (colName: string) => {
    setLoadingRawDocs(true);
    const data = await getRawCollectionDocuments(colName);
    setRawDocs(data);
    setLoadingRawDocs(false);
  };

  useEffect(() => {
    if (activeTab === 'database') {
      fetchRawDocs(selectedCol);
    }
  }, [activeTab, selectedCol]);

  // Filters
  const [appFilterStatus, setAppFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [appSearch, setAppSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  // Modals
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

  // Edit notes state
  const [editingAppNotesId, setEditingAppNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Real-time subscriptions
  useEffect(() => {
    const unsubApps = subscribeAllAppointments((data) => {
      setAppointments(data);
    });

    const unsubReps = subscribeAllReports((data) => {
      setReports(data);
    });

    getAllUsers().then(uList => setPatients(uList));

    return () => {
      unsubApps();
      unsubReps();
    };
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Hospital Admin Portal Restricted
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Admin credentials are required to access patient scheduling controls and doctor directory management.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={loginAsDemoAdmin}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Switch to Demo Admin Account
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async (appId: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appId, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async (appId: string, currentStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appId, currentStatus, notesText);
      setEditingAppNotesId(null);
      setNotesText('');
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleDeleteDoctor = async (docId: string) => {
    if (confirm('Are you sure you want to remove this doctor from the hospital database?')) {
      try {
        await deleteDoctorFromDB(docId);
        onRefreshDoctors();
      } catch (err) {
        console.error('Delete doctor error:', err);
      }
    }
  };

  // Filtered lists
  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = appFilterStatus === 'all' || a.status === appFilterStatus;
    const matchesQuery = 
      a.patientName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.departmentName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(appSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.departmentName.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(docSearch.toLowerCase())
  );

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.patientName.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(reportSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                Hospital Administration Portal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Green Life Management Suite
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live tracking for appointments, doctors, patient records, and Firestore updates.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-xs">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total OPD</span>
              <span className="font-extrabold text-emerald-400 text-base">{appointments.length}</span>
            </div>
            <div className="border-x border-slate-700 px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Doctors</span>
              <span className="font-extrabold text-amber-300 text-base">{doctors.length}</span>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Reports</span>
              <span className="font-extrabold text-teal-300 text-base">{reports.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          Manage Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'doctors'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Manage Doctors Directory ({doctors.length})
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
          All Patient Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-amber-500" />
          Live Firestore DB Explorer
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient, doctor, or ID..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500">Filter Status:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setAppFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      appFilterStatus === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Patient Info</th>
                    <th className="py-3.5 px-4">Doctor & Dept</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No appointments match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{app.patientName}</p>
                          <p className="text-[11px] text-slate-400">{app.patientEmail} • {app.patientPhone}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-emerald-800">{app.doctorName}</p>
                          <p className="text-[11px] text-slate-500">{app.departmentName}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{app.date}</p>
                          <p className="text-[11px] text-emerald-600 font-semibold">{app.timeSlot}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            app.status === 'scheduled'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : app.status === 'completed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'scheduled' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'completed')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px]"
                              >
                                Mark Complete
                              </button>
                            )}

                            {app.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-[11px]"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingAppNotesId(app.id);
                                setNotesText(app.adminNotes || '');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]"
                            >
                              Add Note
                            </button>
                          </div>

                          {/* Notes Inline Modal */}
                          {editingAppNotesId === app.id && (
                            <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-left">
                              <textarea
                                rows={2}
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder="Staff doctor note..."
                                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                              />
                              <div className="flex justify-end gap-1 mt-1">
                                <button
                                  onClick={() => setEditingAppNotesId(null)}
                                  className="px-2 py-0.5 text-[10px] text-slate-500 font-bold"
                                >
                                  Close
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(app.id, app.status)}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-bold"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search doctors directory..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setAddDoctorModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add New Specialist Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 relative">
                <div className="flex items-start gap-3">
                  <img src={doc.imageUrl} alt={doc.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200" />
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                      {doc.departmentName}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{doc.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                  <p><strong>Qualification:</strong> {doc.qualification}</p>
                  <p><strong>Fee:</strong> ${doc.consultationFee} • <strong>Experience:</strong> {doc.experienceYears} Yrs</p>
                  <p><strong>OPD Room:</strong> {doc.locationRoom}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteDoctor(doc.id)}
                    className="text-rose-600 hover:bg-rose-50 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Doctor
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: PATIENT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient medical reports..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(rep => (
              <div key={rep.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md">
                    {rep.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{rep.date}</span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{rep.title}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Patient: {rep.patientName}</p>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed line-clamp-2">
                  {rep.summary}
                </p>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Inspect Document
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: LIVE FIRESTORE DATABASE EXPLORER */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          
          {/* Explanation banner about GCP Console permissions vs In-App Live DB Explorer */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-2xl text-amber-700 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-amber-950">
                  Firebase Database Access & Permissions Explanation
                </h3>
                <p className="leading-relaxed text-slate-700">
                  <strong>Why direct console.cloud.google.com links show "permission denied":</strong>
                  The Google Cloud Console interface requires direct IAM project owner permissions on Google Cloud's infrastructure. Because this medical application runs inside a secure AI Studio preview container, direct web console URLs are restricted by Cloud IAM policies.
                </p>
                <p className="leading-relaxed text-slate-700">
                  <strong>How to test & view your real live Firestore data:</strong> Your app is connected directly to your active Firestore database ID <code>ai-studio-mediflowpro-2b99f7dd-9222-4a6e-8b3d-487453803634</code>. You can inspect raw document snapshots, IDs, collections, and live JSON data right here in this <strong>Live Explorer</strong>!
                </p>
              </div>
            </div>
          </div>

          {/* Collection Selector Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Select Firestore Collection
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Database ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-800 font-mono">ai-studio-mediflowpro-2b99f7dd-9222-4a6e-8b3d-487453803634</code>
                </p>
              </div>

              <button
                onClick={() => fetchRawDocs(selectedCol)}
                disabled={loadingRawDocs}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingRawDocs ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {(['users', 'appointments', 'doctors', 'reports', 'departments'] as const).map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedCol(col)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedCol === col
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>collection('{col}')</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Records Viewer */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-mono text-sm font-bold text-amber-300">
                  collection('{selectedCol}') document list ({rawDocs.length} entries)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                Status: {loadingRawDocs ? 'Syncing...' : 'LIVE FIRESTORE READ'}
              </span>
            </div>

            {loadingRawDocs ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Fetching live documents from Firestore database...
              </div>
            ) : rawDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Collection '{selectedCol}' is currently empty or has no documents.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {rawDocs.map((docItem, idx) => (
                  <div key={docItem._documentId || idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-emerald-400 font-bold text-[11px]">
                        Document ID: <code className="text-amber-300">{docItem._documentId}</code>
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">Document #{idx + 1}</span>
                    </div>
                    <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(
                        Object.fromEntries(Object.entries(docItem).filter(([k]) => k !== '_documentId')),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Admin Doctor Add Modal */}
      <AdminDoctorModal
        isOpen={addDoctorModalOpen}
        onClose={() => setAddDoctorModalOpen(false)}
        departments={departments}
        onSuccess={onRefreshDoctors}
      />

      <ReportViewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

    </div>
  );
};
