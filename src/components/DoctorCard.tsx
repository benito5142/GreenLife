import React from 'react';
import { Star, Calendar, MapPin, Award, Stethoscope, ArrowRight, Clock } from 'lucide-react';
import { Doctor } from '../types/hospital';

interface DoctorCardProps {
  doctor: Doctor;
  onViewDetails: (doc: Doctor) => void;
  onBookAppointment: (deptId: string, docId: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewDetails,
  onBookAppointment
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group relative">
      
      <div>
        {/* Doctor Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border-2 border-emerald-500/20 shadow-xs">
            <img
              src={doctor.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=047857&color=fff&size=300`}
              alt={doctor.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=047857&color=fff&size=300`;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md mb-1">
              {doctor.departmentName}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate">
              {doctor.title}
            </p>
          </div>
        </div>

        {/* Rating & Stats */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs mb-3 border border-slate-100">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{doctor.rating}</span>
            <span className="text-[10px] font-normal text-slate-500">({doctor.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{doctor.experienceYears}+ Yrs Exp</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {doctor.bio}
        </p>

        {/* Available Days */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">Days:</span>
            <span className="truncate">{doctor.availableDays.join(', ')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{doctor.locationRoom}</span>
          </div>
        </div>
      </div>

      {/* Footer / Fee & Booking */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
          <span className="text-sm font-extrabold text-slate-900">${doctor.consultationFee}</span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => onViewDetails(doctor)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Profile
          </button>
          <button
            onClick={() => onBookAppointment(doctor.departmentId, doctor.id)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-emerald-600/20 transition-all flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book
          </button>
        </div>
      </div>

    </div>
  );
};
