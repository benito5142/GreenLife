import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

import firebaseConfigJson from '../../firebase-applet-config.json';
import { Department, Doctor, Appointment, MedicalReport, UserProfile } from '../types/hospital';
import { INITIAL_DEPARTMENTS, INITIAL_DOCTORS, INITIAL_SAMPLE_REPORTS } from '../data/initialData';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfigJson) : getApp();

// Note: Use firestoreDatabaseId if configured
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId) 
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auto-seed initial Firestore collections if empty
export async function autoSeedDatabase() {
  try {
    // 1. Seed Departments if empty
    const deptSnap = await getDocs(collection(db, 'departments'));
    if (deptSnap.empty) {
      console.log('Seeding initial departments to Firestore...');
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), dept);
      }
    }

    // 2. Seed Doctors if empty or auto-heal duplicate image URLs
    const docSnap = await getDocs(collection(db, 'doctors'));
    if (docSnap.empty) {
      console.log('Seeding initial doctors to Firestore...');
      for (const doctor of INITIAL_DOCTORS) {
        await setDoc(doc(db, 'doctors', doctor.id), doctor);
      }
    } else {
      // Heal doctor image URLs if they match duplicate or broken links
      const existingDocs = docSnap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
      for (const initDoc of INITIAL_DOCTORS) {
        const found = existingDocs.find(d => d.id === initDoc.id);
        if (found) {
          // If Dr. Emily Watson or any other doctor has the same image URL as Dr. Sarah Jenkins or a broken image
          if (found.id === 'doc-3' && (found.imageUrl === INITIAL_DOCTORS[0].imageUrl || !found.imageUrl || found.imageUrl.includes('photo-1594824813566') || found.imageUrl.includes('photo-1527613426441'))) {
            await updateDoc(doc(db, 'doctors', 'doc-3'), { imageUrl: initDoc.imageUrl });
            console.log('Auto-updated Dr. Emily Watson image URL to distinct portrait:', initDoc.imageUrl);
          }
        } else {
          // Add missing default doctor
          await setDoc(doc(db, 'doctors', initDoc.id), initDoc);
        }
      }
    }

    // 3. Seed Demo Sample Reports if empty
    const reportSnap = await getDocs(collection(db, 'reports'));
    if (reportSnap.empty) {
      console.log('Seeding initial sample reports to Firestore...');
      for (const report of INITIAL_SAMPLE_REPORTS) {
        await setDoc(doc(db, 'reports', report.id), report);
      }
    }
  } catch (err) {
    console.log('Auto-seed check completed:', err);
  }
}

// Trigger auto-seed asynchronously
autoSeedDatabase();

// Helper to fetch raw document snapshot list for live database inspection
export async function getRawCollectionDocuments(colName: string) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(docSnap => ({
      _documentId: docSnap.id,
      ...docSnap.data()
    }));
  } catch (err) {
    console.error(`Error reading raw collection ${colName}:`, err);
    return [];
  }
}

// --- DEPARTMENTS FIRESTORE API ---
export async function getDepartments(): Promise<Department[]> {
  try {
    const snap = await getDocs(collection(db, 'departments'));
    if (snap.empty) {
      return INITIAL_DEPARTMENTS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Department));
  } catch (err) {
    console.error('Error getting departments:', err);
    return INITIAL_DEPARTMENTS;
  }
}

// --- DOCTORS FIRESTORE API ---
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const snap = await getDocs(collection(db, 'doctors'));
    if (snap.empty) {
      return INITIAL_DOCTORS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
  } catch (err) {
    console.error('Error getting doctors:', err);
    return INITIAL_DOCTORS;
  }
}

export async function addDoctorToDB(doctorData: Omit<Doctor, 'id'>): Promise<string> {
  const newRef = doc(collection(db, 'doctors'));
  const doctor: Doctor = { ...doctorData, id: newRef.id };
  await setDoc(newRef, doctor);
  return newRef.id;
}

export async function updateDoctorInDB(id: string, updates: Partial<Doctor>): Promise<void> {
  await updateDoc(doc(db, 'doctors', id), updates);
}

export async function deleteDoctorFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, 'doctors', id));
}

// --- APPOINTMENTS FIRESTORE API ---
export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  const newRef = doc(collection(db, 'appointments'));
  const createdAt = new Date().toISOString();
  const appointment: Appointment = {
    ...appointmentData,
    id: newRef.id,
    createdAt
  };
  await setDoc(newRef, appointment);
  return newRef.id;
}

export function subscribeUserAppointments(userId: string, callback: (apps: Appointment[]) => void) {
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: Appointment[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    // sort by date descending
    list.sort((a, b) => new Date(b.date + ' ' + b.timeSlot).getTime() - new Date(a.date + ' ' + a.timeSlot).getTime());
    callback(list);
  }, (error) => {
    console.error('Snapshot error for appointments:', error);
    callback([]);
  });
}

export function subscribeAllAppointments(callback: (apps: Appointment[]) => void) {
  const q = collection(db, 'appointments');

  return onSnapshot(q, (snapshot) => {
    const list: Appointment[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    console.error('Snapshot error for all appointments:', error);
    callback([]);
  });
}

export async function updateAppointmentStatus(id: string, status: Appointment['status'], adminNotes?: string): Promise<void> {
  const ref = doc(db, 'appointments', id);
  const payload: any = { status };
  if (adminNotes !== undefined) {
    payload.adminNotes = adminNotes;
  }
  await updateDoc(ref, payload);
}

// --- MEDICAL REPORTS FIRESTORE API ---
export function subscribeUserReports(userId: string, callback: (reports: MedicalReport[]) => void) {
  const q = query(
    collection(db, 'reports'),
    where('patientId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: MedicalReport[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicalReport));
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(list);
  }, (error) => {
    console.error('Snapshot error for reports:', error);
    callback([]);
  });
}

export function subscribeAllReports(callback: (reports: MedicalReport[]) => void) {
  const q = collection(db, 'reports');

  return onSnapshot(q, (snapshot) => {
    const list: MedicalReport[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicalReport));
    list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    callback(list);
  }, (error) => {
    console.error('Snapshot error for all reports:', error);
    callback([]);
  });
}

export async function createMedicalReport(reportData: Omit<MedicalReport, 'id' | 'createdAt'>): Promise<string> {
  const newRef = doc(collection(db, 'reports'));
  const createdAt = new Date().toISOString();
  const report: MedicalReport = {
    ...reportData,
    id: newRef.id,
    createdAt
  };
  await setDoc(newRef, report);
  return newRef.id;
}

// --- USER PROFILE FIRESTORE API ---
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error reading user profile:', err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}
