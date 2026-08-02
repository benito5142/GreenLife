import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';

import { HomePage } from './pages/HomePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Department, Doctor } from './types/hospital';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS } from './data/initialData';
import { getDepartments, getDoctors } from './lib/firebase';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Data state
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDeptId, setBookingDeptId] = useState<string | undefined>(undefined);
  const [bookingDocId, setBookingDocId] = useState<string | undefined>(undefined);

  const [selectedDeptDetails, setSelectedDeptDetails] = useState<Department | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<Doctor | null>(null);

  // Load Firestore data
  const loadHospitalData = async () => {
    try {
      const depts = await getDepartments();
      const docs = await getDoctors();
      setDepartments(depts);
      setDoctors(docs);
    } catch (err) {
      console.error('Error fetching hospital data from Firestore:', err);
    }
  };

  useEffect(() => {
    loadHospitalData();
  }, []);

  const handleOpenBooking = (deptId?: string, docId?: string) => {
    setBookingDeptId(deptId);
    setBookingDocId(docId);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Emergency Bar */}
      <EmergencyBanner onOpenBooking={() => handleOpenBooking()} />

      {/* Main Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenBooking={(deptId, docId) => handleOpenBooking(deptId, docId)}
      />

      {/* Page Body View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            departments={departments}
            doctors={doctors}
            setActiveTab={setActiveTab}
            onOpenBooking={(deptId, docId) => handleOpenBooking(deptId, docId)}
            onViewDeptDetails={(dept) => setSelectedDeptDetails(dept)}
            onViewDocDetails={(doc) => setSelectedDocDetails(doc)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsPage
            departments={departments}
            onViewDeptDetails={(dept) => setSelectedDeptDetails(dept)}
            onBookAppointment={(deptId) => handleOpenBooking(deptId)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsPage
            doctors={doctors}
            departments={departments}
            onViewDocDetails={(doc) => setSelectedDocDetails(doc)}
            onBookAppointment={(deptId, docId) => handleOpenBooking(deptId, docId)}
          />
        )}

        {activeTab === 'dashboard' && (
          <PatientDashboardPage
            onOpenBooking={() => handleOpenBooking()}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage
            doctors={doctors}
            departments={departments}
            onRefreshDoctors={loadHospitalData}
          />
        )}
      </main>

      {/* Main Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        departments={departments}
        doctors={doctors}
        initialDeptId={bookingDeptId}
        initialDocId={bookingDocId}
        onBookingSuccess={loadHospitalData}
      />

      <DepartmentDetailModal
        department={selectedDeptDetails}
        doctors={doctors}
        onClose={() => setSelectedDeptDetails(null)}
        onBookAppointment={(deptId, docId) => handleOpenBooking(deptId, docId)}
      />

      <DoctorDetailModal
        doctor={selectedDocDetails}
        onClose={() => setSelectedDocDetails(null)}
        onBookAppointment={(deptId, docId) => handleOpenBooking(deptId, docId)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
