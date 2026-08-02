export type Role = 'patient' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  iconName: string; // lucide icon identifier
  shortDesc: string;
  fullDesc: string;
  headDoctor: string;
  availableBeds: number;
  services: string[];
  imageUrl: string;
  color: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  specialty: string;
  experienceYears: number;
  qualification: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  bio: string;
  consultationFee: number;
  availableDays: string[]; // e.g. ["Mon", "Wed", "Fri"]
  timeSlots: string[]; // e.g. ["09:00 AM", "10:30 AM", "02:00 PM"]
  locationRoom: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  departmentId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  reason: string;
  symptoms?: string;
  status: AppointmentStatus;
  createdAt: string;
  adminNotes?: string;
}

export type ReportCategory = 'Lab Result' | 'X-Ray / Imaging' | 'Prescription' | 'Discharge Summary' | 'Checkup Summary';

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: ReportCategory;
  doctorName?: string;
  departmentName?: string;
  date: string; // YYYY-MM-DD
  fileDataUrl?: string; // base64 or placeholder url
  fileName?: string;
  fileSize?: string;
  summary: string;
  diagnosis?: string;
  status: 'Final' | 'Pending Review' | 'Archived';
  createdAt: string;
}

export interface VitalSignLog {
  id: string;
  patientId: string;
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  temperature: number;
  weight: number;
}
