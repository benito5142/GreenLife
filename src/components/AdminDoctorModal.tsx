import React, { useState } from 'react';
import { X, Plus, Stethoscope, AlertCircle } from 'lucide-react';
import { Department, Doctor } from '../types/hospital';
import { addDoctorToDB } from '../lib/firebase';

interface AdminDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onSuccess: () => void;
}

export const AdminDoctorModal: React.FC<AdminDoctorModalProps> = ({
  isOpen,
  onClose,
  departments,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'cardiology');
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [qualification, setQualification] = useState('');
  const [consultationFee, setConsultationFee] = useState(100);
  const [locationRoom, setLocationRoom] = useState('Building A, Room 101');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialty.trim() || !qualification.trim()) {
      setError('Please fill out all required doctor profile fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const deptObj = departments.find(d => d.id === departmentId);

      await addDoctorToDB({
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        title: title.trim() || 'Specialist Physician',
        departmentId,
        departmentName: deptObj?.name || 'Medical Department',
        specialty: specialty.trim(),
        experienceYears,
        qualification: qualification.trim(),
        rating: 4.9,
        reviewCount: 1,
        imageUrl: imageUrl.trim(),
        bio: bio.trim() || 'Expert clinician dedicated to comprehensive patient wellbeing.',
        consultationFee,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        locationRoom: locationRoom.trim()
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding doctor:', err);
      setError(err.message || 'Failed to add doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-400/30">
            Admin Management
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Add New Specialist Doctor
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Robert Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Surgeon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
              <input
                type="text"
                required
                placeholder="e.g. Spine Surgery"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years Experience</label>
              <input
                type="number"
                required
                min={1}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
              <input
                type="text"
                required
                placeholder="e.g. MD, FRCS (London)"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                required
                min={10}
                value={consultationFee}
                onChange={(e) => setConsultationFee(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room / OPD Location</label>
            <input
              type="text"
              placeholder="Building A, Room 204"
              value={locationRoom}
              onChange={(e) => setLocationRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Biography</label>
            <textarea
              rows={2}
              placeholder="Short clinical summary and focus..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
          >
            {submitting ? 'Saving to Database...' : 'Add Doctor to Hospital Directory'}
          </button>

        </form>
      </div>
    </div>
  );
};
