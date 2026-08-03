import React from 'react';
import { 
  HeartPulse, 
  Brain, 
  Baby, 
  Activity, 
  ShieldAlert, 
  Ambulance, 
  ArrowRight, 
  Bed, 
  Stethoscope 
} from 'lucide-react';
import { Department } from '../types/hospital';

interface DepartmentCardProps {
  department: Department;
  onViewDetails: (dept: Department) => void;
  onBookAppointment: (deptId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-6 h-6 text-emerald-600" />,
  Brain: <Brain className="w-6 h-6 text-teal-600" />,
  Baby: <Baby className="w-6 h-6 text-emerald-600" />,
  Activity: <Activity className="w-6 h-6 text-teal-600" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-emerald-600" />,
  Ambulance: <Ambulance className="w-6 h-6 text-rose-600" />
};

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onViewDetails,
  onBookAppointment
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Image Header */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={department.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'}
          alt={department.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Department Icon Pill */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-white/40">
          {ICON_MAP[department.iconName] || <Stethoscope className="w-6 h-6 text-emerald-600" />}
        </div>

        {/* Beds Badge */}
        <div className="absolute bottom-3 right-3 bg-emerald-950/80 text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-emerald-400" />
          {department.availableBeds} Inpatient Beds
        </div>

        <h3 className="absolute bottom-3 left-3 right-16 text-lg font-bold text-white drop-shadow-sm line-clamp-1">
          {department.name}
        </h3>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {department.shortDesc}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {department.services.slice(0, 3).map((svc, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
              >
                {svc}
              </span>
            ))}
            {department.services.length > 3 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{department.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(department)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl transition-all text-center"
          >
            Explore Dept
          </button>
          <button
            onClick={() => onBookAppointment(department.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs hover:shadow-emerald-600/20"
          >
            <span>Book Doctor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
