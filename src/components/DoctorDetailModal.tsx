import React from 'react';
import { X, Star, Calendar, MapPin, Award, Clock, DollarSign, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Doctor } from '../types/hospital';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookAppointment: (deptId: string, docId: string) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBookAppointment
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={doctor.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'}
              alt={doctor.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80';
              }}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md shrink-0"
            />
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md mb-1 border border-emerald-400/30">
                {doctor.departmentName}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {doctor.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {doctor.title}
              </p>
              <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                {doctor.qualification}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating</span>
              <div className="flex items-center justify-center gap-1 font-extrabold text-slate-800 text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{doctor.rating}</span>
              </div>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
              <span className="font-extrabold text-slate-800 text-sm">{doctor.experienceYears}+ Years</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Consult Fee</span>
              <span className="font-extrabold text-emerald-700 text-sm">${doctor.consultationFee}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">Biography & Specialty</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">OPD Consultation Schedule</h3>
            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Available Days: {doctor.availableDays.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Available Time Slots:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {doctor.timeSlots.map((slot, idx) => (
                  <span key={idx} className="bg-white text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Consultation Location: <strong className="text-slate-800">{doctor.locationRoom}</strong></span>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onBookAppointment(doctor.departmentId, doctor.id);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Book Consultation with {doctor.name}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
