import React from 'react';
import { X, Bed, Stethoscope, CheckCircle2, Calendar, UserCheck, Shield } from 'lucide-react';
import { Department, Doctor } from '../types/hospital';

interface DepartmentDetailModalProps {
  department: Department | null;
  doctors: Doctor[];
  onClose: () => void;
  onBookAppointment: (deptId: string, docId?: string) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  doctors,
  onClose,
  onBookAppointment
}) => {
  if (!department) return null;

  const deptDoctors = doctors.filter(d => d.departmentId === department.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Banner */}
        <div className="relative h-56 bg-slate-900">
          <img
            src={department.imageUrl}
            alt={department.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md mb-2">
              Center of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {department.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Department Head: <span className="text-white font-semibold">{department.headDoctor}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2">About Department</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {department.fullDesc}
            </p>
          </div>

          {/* Key Services Offered */}
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">Specialized Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {department.services.map((svc, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{svc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Doctors */}
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">
              Specialist Doctors in this Department ({deptDoctors.length})
            </h3>
            <div className="space-y-3">
              {deptDoctors.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <img src={doc.imageUrl} alt={doc.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.qualification}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onBookAppointment(department.id, doc.id);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    Book Doctor
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-600" />
              <span>{department.availableBeds} Available Beds in Ward</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onBookAppointment(department.id);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Department Consultation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
