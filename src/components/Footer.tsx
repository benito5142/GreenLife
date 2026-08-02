import React from 'react';
import { Plus, HeartPulse, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenBooking, onOpenAuth }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Green<span className="text-emerald-400">Life</span> Hospital
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leading multispecialty healthcare institution providing world-class diagnostic, surgical, and compassionate medical care 24 hours a day, 7 days a week.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/40 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              JCI & NABH Accredited Healthcare Center
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide border-b border-slate-800 pb-2">
              Hospital Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('departments')} className="hover:text-emerald-400 transition-colors">
                  Specialized Departments
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('doctors')} className="hover:text-emerald-400 transition-colors">
                  Find Expert Doctors
                </button>
              </li>
              <li>
                <button onClick={onOpenBooking} className="hover:text-emerald-400 transition-colors">
                  Online Appointment Booking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400 transition-colors">
                  Patient Portal & Reports
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-emerald-400 transition-colors">
                  Login / Patient Sign Up
                </button>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide border-b border-slate-800 pb-2">
              Core Specialties
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Cardiology & Heart Care</li>
              <li>Neurology & Neurosurgery</li>
              <li>Pediatrics & Neonatal Care</li>
              <li>Orthopedics & Joint Surgery</li>
              <li>Comprehensive Oncology</li>
              <li>24/7 Level-1 Emergency Care</li>
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide border-b border-slate-800 pb-2">
              Contact & Location
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  450 GreenLife Boulevard, Medical District, NY 10021, USA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-white font-bold">+1 (800) 473-3654</span>
                  <span className="text-xs text-slate-400">Emergency & Ambulance</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">care@greenlife.hospital</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">24 Hours Emergency & Diagnostic Lab</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Green Life Hospital & Care Center. All Rights Reserved.</p>
          <div className="flex gap-6 text-slate-400">
            <span className="hover:text-emerald-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-emerald-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-emerald-400 cursor-pointer">Patient Rights</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
