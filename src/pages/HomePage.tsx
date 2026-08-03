import React from 'react';
import { 
  HeartPulse, 
  Calendar, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  Bed, 
  Clock, 
  Users, 
  Award, 
  CheckCircle2, 
  FileText, 
  Activity, 
  Stethoscope,
  Building2,
  Sparkles,
  Search,
  Star
} from 'lucide-react';
import { Department, Doctor } from '../types/hospital';
import { DepartmentCard } from '../components/DepartmentCard';
import { DoctorCard } from '../components/DoctorCard';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  departments: Department[];
  doctors: Doctor[];
  setActiveTab: (tab: string) => void;
  onOpenBooking: (deptId?: string, docId?: string) => void;
  onViewDeptDetails: (dept: Department) => void;
  onViewDocDetails: (doc: Doctor) => void;
  onOpenAuth: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  departments,
  doctors,
  setActiveTab,
  onOpenBooking,
  onViewDeptDetails,
  onViewDocDetails,
  onOpenAuth
}) => {
  const { user, loginAsDemoPatient, loginAsDemoAdmin } = useAuth();

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-900 text-white rounded-b-3xl sm:rounded-b-[2.5rem] shadow-xl">
        
        {/* Subtle Decorative Background Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modern Healthcare & Cloud Patient Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                Compassionate Care. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-mint-400">
                  Advanced Medicine.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Green Life Hospital integrates internationally acclaimed specialist doctors, 24/7 Level-1 emergency trauma care, and a secure cloud patient dashboard for seamless online appointments and medical report management.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </button>

                <button
                  onClick={() => setActiveTab('doctors')}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  Explore Doctors
                </button>
              </div>

              {/* Demo Evaluation Shortcuts Bar */}
              <div className="pt-4 border-t border-emerald-800/40 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Try Demo Mode:</span>
                <button
                  onClick={loginAsDemoPatient}
                  className="bg-emerald-800/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Demo Patient Login
                </button>
                <button
                  onClick={loginAsDemoAdmin}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  Demo Admin Login
                </button>
              </div>

            </div>

            {/* Right Card / Feature Callout */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">24/7 Emergency Line</p>
                      <p className="text-lg font-black text-white">+1 (800) 473-3654</p>
                    </div>
                  </div>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Instant OPD Scheduling</h4>
                      <p className="text-[11px] text-slate-400">Select doctor, pick date & preferred time slot in under 60 seconds.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Digital Health Portal</h4>
                      <p className="text-[11px] text-slate-400">Access and upload lab reports, prescriptions, and radiology files safely.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Firestore Cloud Security</h4>
                      <p className="text-[11px] text-slate-400">Strict patient data isolation ensuring users access only their own medical records.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Direct Consultation
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS HIGHLIGHT BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">25+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Specialized Depts</p>
            <p className="text-[11px] text-slate-400">Cardiology, Neuro, ICU, Pediatrics</p>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">120+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Expert Physicians</p>
            <p className="text-[11px] text-slate-400">Board certified specialist doctors</p>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">24/7</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Emergency Care</p>
            <p className="text-[11px] text-slate-400">Trauma bays & ICU response</p>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-sans">99.4%</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Satisfaction</p>
            <p className="text-[11px] text-slate-400">Based on 10,000+ patient reviews</p>
          </div>

        </div>
      </section>

      {/* DEPARTMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Centers of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Featured Medical Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Equipped with modern diagnostic technology and lead doctors across core specialties.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('departments')}
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.slice(0, 6).map(dept => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onViewDetails={onViewDeptDetails}
              onBookAppointment={(deptId) => onOpenBooking(deptId)}
            />
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS SECTION */}
      <section className="bg-slate-50/80 py-12 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                Medical Team
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Consult With Renowned Specialists
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Book direct consultations with senior consultants and surgical specialists.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('doctors')}
              className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-all"
            >
              <span>View Doctors Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.slice(0, 6).map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onViewDetails={onViewDocDetails}
                onBookAppointment={(deptId, docId) => onOpenBooking(deptId, docId)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple & Seamless
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            4 Steps to Quality Healthcare
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            How Green Life Hospital simplifies appointment scheduling and health record management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">1</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">Choose Specialist</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Browse departments or doctor directory to find the right medical expert.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">2</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">Pick Date & Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Select a convenient OPD slot matching the physician's schedule.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">3</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">Instant Firestore Save</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Appointment automatically syncs to cloud database and patient portal.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">4</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">Access Medical Reports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Log in to view diagnosis, upload lab results, and track health history.</p>
          </div>
        </div>
      </section>

      {/* PATIENT TESTIMONIALS SLIDER */}
      <TestimonialSlider />

    </div>
  );
};
