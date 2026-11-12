import connectDB from './mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import MedicalRecord from '@/models/MedicalRecord';
import Consultation from '@/models/Consultation';
import Prescription from '@/models/Prescription';
import DoctorPatientAccess from '@/models/DoctorPatientAccess';
import AuditLog from '@/models/AuditLog';
import { hashPassword } from './auth';

/**
 * Seed initial data if database is empty
 */
export async function seedInitialData() {
  await connectDB();

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return { success: true, message: 'Database already has data.' };
  }

  console.log('Seeding initial VALORA healthcare database...');

  const passwordHash = await hashPassword('Valora@123');

  // 1. Create Admin
  const adminUser = await User.create({
    name: 'Dr. Evelyn Vance (Chief Admin)',
    email: 'admin@valora.health',
    passwordHash,
    role: 'admin',
    phone: '+91 98765 00001',
    status: 'active',
  });

  // 2. Create Doctors
  const docUser1 = await User.create({
    name: 'Dr. Rajesh Sharma, MD',
    email: 'dr.sharma@valora.health',
    passwordHash,
    role: 'doctor',
    phone: '+91 98765 11111',
    status: 'active',
  });

  await Doctor.create({
    userId: docUser1._id,
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
    experienceYears: 14,
    licenseNumber: 'MCI-CARD-88492',
    consultationFee: 800,
    biography: 'Specialized in interventional cardiology, cardiovascular risk assessment, and non-invasive cardiac imaging.',
    clinicAddress: {
      clinicName: 'VALORA Advanced Heart & Vascular Clinic',
      street: '45 Lotus Avenue, Health City',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
    },
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: { start: '09:00', end: '16:00' },
    isVerified: true,
    rating: 0,
    totalReviews: 0,
  });

  const docUser2 = await User.create({
    name: 'Dr. Priya Nambiar, MS',
    email: 'dr.priya@valora.health',
    passwordHash,
    role: 'doctor',
    phone: '+91 98765 22222',
    status: 'active',
  });

  await Doctor.create({
    userId: docUser2._id,
    specialty: 'Neurology',
    qualifications: ['MBBS', 'DM (Neurology)'],
    experienceYears: 10,
    licenseNumber: 'MCI-NEUR-45210',
    consultationFee: 950,
    biography: 'Expert in clinical neurophysiology, chronic migraine management, and neuromuscular disorders.',
    clinicAddress: {
      clinicName: 'VALORA Brain & Nerve Institute',
      street: '12 Cyber Park Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560100',
    },
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableHours: { start: '10:00', end: '18:00' },
    isVerified: true,
    rating: 0,
    totalReviews: 0,
  });

  const docUser3 = await User.create({
    name: 'Dr. Amitav Roy, DNB',
    email: 'dr.roy@valora.health',
    passwordHash,
    role: 'doctor',
    phone: '+91 98765 33333',
    status: 'pending_verification', // For testing admin verification
  });

  await Doctor.create({
    userId: docUser3._id,
    specialty: 'Orthopedics',
    qualifications: ['MBBS', 'MS (Orthopedics)'],
    experienceYears: 6,
    licenseNumber: 'MCI-ORTH-99120',
    consultationFee: 650,
    biography: 'Specializes in sports injuries, arthroscopic surgeries, and joint preservation therapies.',
    clinicAddress: {
      clinicName: 'Metro Joint Care Center',
      street: '88 Ring Road',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110029',
    },
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableHours: { start: '11:00', end: '17:00' },
    isVerified: false,
    rating: 0,
    totalReviews: 0,
  });

  // 3. Create Patients
  const patientUser1 = await User.create({
    name: 'Aarav Patel',
    email: 'patient@valora.health',
    passwordHash,
    role: 'patient',
    phone: '+91 98111 22334',
    status: 'active',
  });

  await Patient.create({
    userId: patientUser1._id,
    dateOfBirth: new Date('1994-06-15'),
    gender: 'male',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension (Mild)'],
    emergencyContact: {
      name: 'Sunita Patel',
      relation: 'Spouse',
      phone: '+91 98111 22335',
    },
    address: {
      street: 'B-204 Greenwoods Residency',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400076',
      country: 'India',
    },
    insuranceProvider: 'Star Health Allied Insurance',
    insurancePolicyNumber: 'SH-MED-8492041',
    heightCm: 175,
    weightKg: 74,
  });

  const patientUser2 = await User.create({
    name: 'Ananya Sharma',
    email: 'ananya@valora.health',
    passwordHash,
    role: 'patient',
    phone: '+91 98222 33445',
    status: 'active',
  });

  await Patient.create({
    userId: patientUser2._id,
    dateOfBirth: new Date('1998-11-20'),
    gender: 'female',
    bloodGroup: 'O+',
    allergies: ['Peanuts'],
    chronicConditions: [],
    emergencyContact: {
      name: 'Ramesh Sharma',
      relation: 'Father',
      phone: '+91 98222 33440',
    },
    address: {
      street: '14 Palm Grove Boulevard',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
    },
    insuranceProvider: 'HDFC ERGO Health',
    insurancePolicyNumber: 'HE-IND-778899',
    heightCm: 162,
    weightKg: 58,
  });

  // 4. Appointments
  const apt1 = await Appointment.create({
    patientId: patientUser1._id,
    doctorId: docUser1._id,
    appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    timeSlot: '10:30 AM',
    type: 'in-person',
    status: 'confirmed',
    reason: 'Routine quarterly cardiac rhythm check and blood pressure titration.',
    fee: 800,
  });

  const apt2 = await Appointment.create({
    patientId: patientUser1._id,
    doctorId: docUser2._id,
    appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    timeSlot: '02:00 PM',
    type: 'teleconsultation',
    status: 'completed',
    reason: 'Follow-up regarding tension headache episodes.',
    fee: 950,
  });

  const apt3 = await Appointment.create({
    patientId: patientUser2._id,
    doctorId: docUser1._id,
    appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    timeSlot: '11:15 AM',
    type: 'in-person',
    status: 'scheduled',
    reason: 'Mild palpitation evaluation and ECG review.',
    fee: 800,
  });

  // 5. Medical Records for Patient 1
  await MedicalRecord.create({
    patientId: patientUser1._id,
    uploadedBy: docUser1._id,
    recordType: 'lab_report',
    title: 'Comprehensive Lipid & Metabolic Panel',
    description: 'Fasting lipid profile, HbA1c, liver enzymes, and kidney function panel.',
    fileUrl: '/uploads/sample_lab_report.pdf',
    fileType: 'application/pdf',
    fileSize: 420000,
    facilityOrDoctor: 'VALORA Central Diagnostics Lab',
    tags: ['Blood Test', 'Lipids', 'Metabolic', 'Fasting'],
  });

  await MedicalRecord.create({
    patientId: patientUser1._id,
    uploadedBy: patientUser1._id,
    recordType: 'xray',
    title: 'Chest PA View Digital Radiograph',
    description: 'Posteroanterior chest X-Ray normal cardiothoracic ratio, clear lung fields.',
    fileUrl: '/uploads/sample_chest_xray.png',
    fileType: 'image/png',
    fileSize: 1250000,
    facilityOrDoctor: 'City Imaging & Scan Center',
    tags: ['X-Ray', 'Chest', 'Radiology'],
  });

  await MedicalRecord.create({
    patientId: patientUser1._id,
    uploadedBy: docUser2._id,
    recordType: 'mri_scan',
    title: 'Brain MRI T1/T2 Axial Non-Contrast',
    description: 'Brain MRI scan ruling out intracranial lesions. Normal ventricular anatomy.',
    fileUrl: '/uploads/sample_brain_mri.jpg',
    fileType: 'image/jpeg',
    fileSize: 2450000,
    facilityOrDoctor: 'VALORA Neuro Imaging Suite',
    tags: ['MRI', 'Neurology', 'Brain'],
  });

  // 6. Consultations & Prescriptions
  const consult1 = await Consultation.create({
    appointmentId: apt2._id,
    patientId: patientUser1._id,
    doctorId: docUser2._id,
    consultationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    symptoms: ['Bilateral temporal throbbing headache', 'Mild photophobia', 'Neck stiffness'],
    diagnosis: 'Tension-Type Headache aggravated by screen fatigue',
    clinicalNotes: 'Neurological examination unremarkable. Fundus normal. Patient advised 20-20-20 screen rule and ergonomic posture.',
    vitalSigns: {
      bloodPressure: '124/82 mmHg',
      heartRate: 74,
      temperature: 98.4,
      spO2: 99,
      respiratoryRate: 16,
      weightKg: 74,
      heightCm: 175,
    },
    treatmentPlan: 'Hydration 3L/day, sleep hygiene, oral analgesics SOS only, magnesium supplement.',
    followUpDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  });

  await Prescription.create({
    consultationId: consult1._id,
    appointmentId: apt2._id,
    patientId: patientUser1._id,
    doctorId: docUser2._id,
    prescribedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    medications: [
      {
        medicineName: 'Naproxen Sodium',
        dosage: '250mg',
        frequency: 'As needed SOS (max 2/day)',
        duration: '5 days',
        instructions: 'Take strictly after meals with plenty of water',
      },
      {
        medicineName: 'Magnesium Glycinate',
        dosage: '400mg',
        frequency: 'Once daily at bedtime (0-0-1)',
        duration: '30 days',
        instructions: 'Take 30 minutes before sleep',
      },
    ],
    diagnosticTestsAdvised: ['Ophthalmic Refraction Check'],
    generalAdvice: 'Limit continuous screen exposure to under 2 hours without breaks. Avoid skipping meals.',
  });

  // 7. Doctor Patient Access grant
  await DoctorPatientAccess.create({
    patientId: patientUser1._id,
    doctorId: docUser1._id,
    status: 'granted',
    accessLevel: 'full',
  });

  await DoctorPatientAccess.create({
    patientId: patientUser1._id,
    doctorId: docUser2._id,
    status: 'granted',
    accessLevel: 'full',
  });

  // 8. Audit Logs
  await AuditLog.create({
    userId: adminUser._id,
    action: 'SYSTEM_INITIALIZED',
    entityType: 'System',
    entityId: 'VALORA_CORE',
    details: { message: 'Database initialized with demo healthcare network.' },
  });

  console.log('Seeding completed successfully.');
  return { success: true, message: 'Database seeded successfully.' };
}

