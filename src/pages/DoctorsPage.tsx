import React, { useState } from 'react';
import { Search, Stethoscope, Filter, Star, Calendar } from 'lucide-react';
import { Department, Doctor } from '../types/hospital';
import { DoctorCard } from '../components/DoctorCard';

interface DoctorsPageProps {
  doctors: Doctor[];
  departments: Department[];
  onViewDocDetails: (doc: Doctor) => void;
  onBookAppointment: (deptId: string, docId: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  departments,
  onViewDocDetails,
  onBookAppointment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDeptFilter === 'all' || doc.departmentId === selectedDeptFilter;
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
            Expert Medical Faculty
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Doctors & Specialist Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consult with our team of board-certified consultants, surgeons, and physicians across specialized clinical disciplines.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by doctor name or medical specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium shadow-sm"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2.5 text-xs bg-white text-slate-900 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-slate-200"
            >
              <option value="all">All Departments ({doctors.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onViewDetails={onViewDocDetails}
              onBookAppointment={(deptId, docId) => onBookAppointment(deptId, docId)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
