import React, { useState } from 'react';
import { Search, Building2, Bed, Stethoscope, ArrowRight } from 'lucide-react';
import { Department } from '../types/hospital';
import { DepartmentCard } from '../components/DepartmentCard';

interface DepartmentsPageProps {
  departments: Department[];
  onViewDeptDetails: (dept: Department) => void;
  onBookAppointment: (deptId: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  onViewDeptDetails,
  onBookAppointment
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
            Specialized Care Centers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Hospital Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Discover our comprehensive clinical departments offering 24/7 diagnostic, inpatient, and surgical medical services led by world-class medical specialists.
          </p>

          {/* Search bar */}
          <div className="pt-2 relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by department name or medical service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredDepts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No departments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map(dept => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onViewDetails={onViewDeptDetails}
              onBookAppointment={(deptId) => onBookAppointment(deptId)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
