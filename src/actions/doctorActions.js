'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import Consultation from '@/models/Consultation';
import Prescription from '@/models/Prescription';
import MedicalRecord from '@/models/MedicalRecord';
import DoctorPatientAccess from '@/models/DoctorPatientAccess';
import AuditLog from '@/models/AuditLog';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get comprehensive Doctor Dashboard overview
 */
export async function getDoctorDashboardData() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const doctorUser = await User.findById(session.id).select('-passwordHash').lean();
    const doctorProfile = await Doctor.findOne({ userId: session.id }).lean();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's appointments
    const todaysAppointments = await Appointment.find({
      doctorId: session.id,
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
    })
      .populate('patientId', 'name email phone avatar')
      .sort({ timeSlot: 1 })
      .lean();

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctorId: session.id,
      appointmentDate: { $gt: todayEnd },
      status: { $in: ['scheduled', 'confirmed'] },
    })
      .populate('patientId', 'name email phone avatar')
      .sort({ appointmentDate: 1 })
      .limit(6)
      .lean();

    // Recent consultations conducted
    const recentConsultations = await Consultation.find({ doctorId: session.id })
      .populate('patientId', 'name email')
      .sort({ consultationDate: -1 })
      .limit(5)
      .lean();

    // Stats
    const totalAppointments = await Appointment.countDocuments({ doctorId: session.id });
    const completedConsultations = await Consultation.countDocuments({ doctorId: session.id });
    const distinctPatients = await Appointment.distinct('patientId', { doctorId: session.id });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(doctorUser)),
        profile: JSON.parse(JSON.stringify(doctorProfile || {})),
        todaysAppointments: JSON.parse(JSON.stringify(todaysAppointments)),
        upcomingAppointments: JSON.parse(JSON.stringify(upcomingAppointments)),
        recentConsultations: JSON.parse(JSON.stringify(recentConsultations)),
        stats: {
          todaysCount: todaysAppointments.length,
          totalAppointments,
          completedConsultations,
          uniquePatients: distinctPatients.length,
        },
      },
    };
  } catch (error) {
    console.error('getDoctorDashboardData error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get doctor profile
 */
export async function getDoctorProfile() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const user = await User.findById(session.id).select('-passwordHash').lean();
    let profile = await Doctor.findOne({ userId: session.id }).lean();

    if (!profile) {
      profile = await Doctor.create({
        userId: session.id,
        specialty: 'General Medicine',
        licenseNumber: `MCI-${Date.now()}`,
      });
    }

    return {
      success: true,
      user: JSON.parse(JSON.stringify(user)),
      profile: JSON.parse(JSON.stringify(profile)),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update doctor profile and availability
 */
export async function updateDoctorProfile(formData) {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const name = formData.get('name')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const specialty = formData.get('specialty')?.toString().trim();
    const qualificationsRaw = formData.get('qualifications')?.toString();
    const experienceYears = Number(formData.get('experienceYears')) || 1;
    const consultationFee = Number(formData.get('consultationFee')) || 500;
    const biography = formData.get('biography')?.toString().trim();
    const clinicName = formData.get('clinicName')?.toString().trim();
    const street = formData.get('street')?.toString().trim();
    const city = formData.get('city')?.toString().trim();
    const state = formData.get('state')?.toString().trim();
    const postalCode = formData.get('postalCode')?.toString().trim();
    const startHour = formData.get('startHour')?.toString() || '09:00';
    const endHour = formData.get('endHour')?.toString() || '17:00';
    const availableDaysRaw = formData.get('availableDays')?.toString();

    await User.findByIdAndUpdate(session.id, { name, phone });

    const qualifications = qualificationsRaw
      ? qualificationsRaw.split(',').map((q) => q.trim()).filter(Boolean)
      : ['MBBS'];

    const availableDays = availableDaysRaw
      ? availableDaysRaw.split(',').map((d) => d.trim()).filter(Boolean)
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    await Doctor.findOneAndUpdate(
      { userId: session.id },
      {
        specialty,
        qualifications,
        experienceYears,
        consultationFee,
        biography,
        clinicAddress: {
          clinicName: clinicName || 'VALORA Care Center',
          street: street || '',
          city: city || '',
          state: state || '',
          postalCode: postalCode || '',
        },
        availableHours: {
          start: startHour,
          end: endHour,
        },
        availableDays,
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      userId: session.id,
      action: 'DOCTOR_PROFILE_UPDATED',
      entityType: 'Doctor',
      entityId: session.id,
    });

    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');

    return { success: true, message: 'Doctor profile updated successfully' };
  } catch (error) {
    console.error('updateDoctorProfile error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Public/Patient directory to browse verified and active doctors
 */
export async function getDoctorsDirectory(search = '', specialty = '') {
  try {
    await connectDB();

    const query = {};
    if (specialty && specialty !== 'all') {
      query.specialty = specialty;
    }

    const doctors = await Doctor.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone avatar status',
        match: { status: 'active' },
      })
      .sort({ rating: -1, isVerified: -1 })
      .lean();

    // Filter out if user matching didn't return an active user
    let filtered = doctors.filter((doc) => doc.userId);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.userId.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          (doc.clinicAddress?.city && doc.clinicAddress.city.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      doctors: JSON.parse(JSON.stringify(filtered)),
    };
  } catch (error) {
    console.error('getDoctorsDirectory error:', error);
    return { success: false, error: error.message, doctors: [] };
  }
}

/**
 * Get distinct patients for a doctor
 */
export async function getDoctorPatients() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    // Find patients with appointments or granted access
    const appointments = await Appointment.find({ doctorId: session.id })
      .populate('patientId', 'name email phone avatar')
      .sort({ appointmentDate: -1 })
      .lean();

    const patientMap = new Map();

    for (const apt of appointments) {
      if (apt.patientId && !patientMap.has(apt.patientId._id.toString())) {
        const patientDoc = await Patient.findOne({ userId: apt.patientId._id }).lean();
        patientMap.set(apt.patientId._id.toString(), {
          user: apt.patientId,
          profile: patientDoc || {},
          lastAppointment: apt.appointmentDate,
          totalAppointments: 1,
        });
      } else if (apt.patientId) {
        const existing = patientMap.get(apt.patientId._id.toString());
        existing.totalAppointments += 1;
      }
    }

    return {
      success: true,
      patients: JSON.parse(JSON.stringify(Array.from(patientMap.values()))),
    };
  } catch (error) {
    console.error('getDoctorPatients error:', error);
    return { success: false, error: error.message, patients: [] };
  }
}

/**
 * Add or update consultation note and vitals
 */
export async function saveConsultationNotes(formData) {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const appointmentId = formData.get('appointmentId')?.toString();
    const patientId = formData.get('patientId')?.toString();
    const diagnosis = formData.get('diagnosis')?.toString().trim();
    const symptomsRaw = formData.get('symptoms')?.toString().trim();
    const clinicalNotes = formData.get('clinicalNotes')?.toString().trim();
    const treatmentPlan = formData.get('treatmentPlan')?.toString().trim();
    const followUpDate = formData.get('followUpDate')?.toString();

    const bloodPressure = formData.get('bloodPressure')?.toString() || '120/80 mmHg';
    const heartRate = Number(formData.get('heartRate')) || 72;
    const temperature = Number(formData.get('temperature')) || 98.6;
    const spO2 = Number(formData.get('spO2')) || 99;
    const weightKg = formData.get('weightKg') ? Number(formData.get('weightKg')) : null;

    if (!patientId || !diagnosis) {
      return { success: false, error: 'Patient ID and Diagnosis are required' };
    }

    const symptoms = symptomsRaw ? symptomsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const consultation = await Consultation.create({
      appointmentId: appointmentId || undefined,
      patientId,
      doctorId: session.id,
      diagnosis,
      symptoms,
      clinicalNotes,
      treatmentPlan,
      vitalSigns: {
        bloodPressure,
        heartRate,
        temperature,
        spO2,
        weightKg,
      },
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    });

    // If linked to an appointment, mark appointment as completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    }

    // Grant doctor patient access
    await DoctorPatientAccess.findOneAndUpdate(
      { patientId, doctorId: session.id },
      { status: 'granted', accessLevel: 'full' },
      { upsert: true }
    );

    await AuditLog.create({
      userId: session.id,
      action: 'CONSULTATION_RECORDED',
      entityType: 'Consultation',
      entityId: consultation._id.toString(),
      details: { patientId, diagnosis },
    });

    revalidatePath('/doctor/consultations');
    revalidatePath('/doctor/dashboard');
    revalidatePath('/patient/history');

    return {
      success: true,
      message: 'Consultation notes recorded successfully',
      consultationId: consultation._id.toString(),
    };
  } catch (error) {
    console.error('saveConsultationNotes error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get consultations for doctor
 */
export async function getDoctorConsultations() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const consultations = await Consultation.find({ doctorId: session.id })
      .populate('patientId', 'name email phone avatar')
      .populate('appointmentId')
      .sort({ consultationDate: -1 })
      .lean();

    return {
      success: true,
      consultations: JSON.parse(JSON.stringify(consultations)),
    };
  } catch (error) {
    return { success: false, error: error.message, consultations: [] };
  }
}

