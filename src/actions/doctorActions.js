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
import Review from '@/models/Review';
import { requireAuth, requireRole } from '@/lib/auth';
import { hasDoctorAppointmentAccess, verifyDoctorPatientAppointment } from '@/lib/patientAccess';
import { revalidatePath } from 'next/cache';

/**
 * Get comprehensive Doctor Dashboard overview
 */
export async function getDoctorDashboardData() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const doctorUser = await User.findById(session.id).select('-passwordHash').lean();
    if (!doctorUser) {
      return { success: false, error: 'Session expired. Please sign in again.' };
    }
    const doctorProfile = await Doctor.findOne({ userId: session.id }).lean();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's active/requested appointments
    const todaysAppointments = await Appointment.find({
      doctorId: session.id,
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' },
    })
      .populate('patientId', 'name email phone avatar')
      .sort({ timeSlot: 1 })
      .lean();

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctorId: session.id,
      appointmentDate: { $gt: todayEnd },
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
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
    const totalAppointments = await Appointment.countDocuments({
      doctorId: session.id,
      status: { $ne: 'cancelled' },
    });
    const completedConsultations = await Consultation.countDocuments({ doctorId: session.id });
    const distinctPatients = await Appointment.distinct('patientId', {
      doctorId: session.id,
      status: { $ne: 'cancelled' },
    });

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
    if (!user) {
      return { success: false, error: 'Session expired. Please sign in again.' };
    }
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
    revalidatePath('/patient/doctors');
    revalidatePath('/patient/dashboard');
    revalidatePath('/patient/appointments');

    return { success: true, message: 'Doctor profile updated successfully' };
  } catch (error) {
    console.error('updateDoctorProfile error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Public/Patient directory to browse all registered and active doctors
 */
export async function getDoctorsDirectory(search = '', specialty = '') {
  try {
    await connectDB();

    // 1. Ensure any doctor user has a Doctor profile record
    const allDoctorUsers = await User.find({ role: 'doctor', status: { $ne: 'suspended' } }).lean();
    for (const dUser of allDoctorUsers) {
      const existing = await Doctor.findOne({ userId: dUser._id }).lean();
      if (!existing) {
        await Doctor.create({
          userId: dUser._id,
          specialty: 'General Medicine',
          licenseNumber: `MCI-${dUser._id.toString().slice(-6).toUpperCase()}`,
          experienceYears: 3,
          consultationFee: 500,
          isVerified: false,
        });
      }
    }

    const query = {};
    if (specialty && specialty !== 'all') {
      query.specialty = specialty;
    }

    const doctors = await Doctor.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone avatar status',
        match: { status: { $ne: 'suspended' } },
      })
      .sort({ isVerified: -1, rating: -1, createdAt: -1 })
      .lean();

    // Filter out if user matching didn't return a valid user
    let filtered = doctors.filter((doc) => doc.userId);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.userId.name?.toLowerCase().includes(q) ||
          doc.userId.email?.toLowerCase().includes(q) ||
          doc.specialty?.toLowerCase().includes(q) ||
          doc.qualifications?.some((qual) => qual.toLowerCase().includes(q)) ||
          (doc.clinicAddress?.city && doc.clinicAddress.city.toLowerCase().includes(q)) ||
          (doc.clinicAddress?.clinicName && doc.clinicAddress.clinicName.toLowerCase().includes(q))
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
 * Get distinct patients for a doctor (only patients who applied for a non-cancelled appointment)
 */
export async function getDoctorPatients() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const appointments = await Appointment.find({
      doctorId: session.id,
      status: { $ne: 'cancelled' },
    })
      .populate('patientId', 'name email phone avatar')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    const revokedAccessDocs = await DoctorPatientAccess.find({
      doctorId: session.id,
      status: 'revoked',
    })
      .select('patientId')
      .lean();
    const revokedSet = new Set(revokedAccessDocs.map((doc) => doc.patientId.toString()));

    const patientMap = new Map();

    for (const apt of appointments) {
      const patientIdStr = apt.patientId?._id?.toString();
      if (!patientIdStr || revokedSet.has(patientIdStr)) {
        continue;
      }

      if (!patientMap.has(patientIdStr)) {
        const patientDoc = await Patient.findOne({ userId: apt.patientId._id }).lean();
        patientMap.set(patientIdStr, {
          user: apt.patientId,
          profile: patientDoc || {},
          lastAppointment: apt.appointmentDate,
          latestAppointmentStatus: apt.status,
          latestAppointmentReason: apt.reason,
          latestAppointmentId: apt._id,
          totalAppointments: 1,
        });
      } else {
        const existing = patientMap.get(patientIdStr);
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

    const isAuthorized = await verifyDoctorPatientAppointment(session.id, patientId, appointmentId);
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Access denied: Consultation notes can only be recorded for patients with an appointment request.',
      };
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
    revalidatePath('/doctor/patients');
    revalidatePath('/doctor/appointments');
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

/**
 * Get full clinical history of a patient for an authorized doctor:
 * Includes previous medical records, previous doctor consultations, and previous prescriptions.
 */
export async function getPatientFullHistoryForDoctor(patientId) {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    if (!patientId) {
      return { success: false, error: 'Patient ID is required' };
    }

    const isAuthorized = await hasDoctorAppointmentAccess(session.id, patientId);
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Access denied: Patient profile is only accessible after the patient applies for an appointment with you.',
      };
    }

    const patientUser = await User.findById(patientId).select('-passwordHash').lean();
    if (!patientUser) {
      return { success: false, error: 'Patient record not found' };
    }
    const patientProfile = await Patient.findOne({ userId: patientId }).lean();

    // 1. All medical records uploaded by or for this patient
    const records = await MedicalRecord.find({ patientId })
      .populate('uploadedBy', 'name role')
      .sort({ recordDate: -1, createdAt: -1 })
      .lean();

    // 2. All past consultations for this patient (including other doctors)
    const rawConsultations = await Consultation.find({ patientId })
      .populate('doctorId', 'name email avatar')
      .sort({ consultationDate: -1 })
      .lean();

    // 3. All past prescriptions for this patient
    const rawPrescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email')
      .sort({ prescribedDate: -1 })
      .lean();

    // Enrich consultations with attending doctor's specialty & qualifications
    const enrichedConsultations = await Promise.all(
      rawConsultations.map(async (c) => {
        let doctorSpecialty = 'Consultant Physician';
        let doctorQualifications = ['MBBS'];
        if (c.doctorId?._id) {
          const docMeta = await Doctor.findOne({ userId: c.doctorId._id }).lean();
          if (docMeta) {
            doctorSpecialty = docMeta.specialty || doctorSpecialty;
            doctorQualifications = docMeta.qualifications || doctorQualifications;
          }
        }

        // Link prescriptions given during or corresponding to this consultation
        const matchingRx = rawPrescriptions.filter(
          (p) =>
            (p.consultationId && p.consultationId.toString() === c._id.toString()) ||
            (p.doctorId?._id &&
              c.doctorId?._id &&
              p.doctorId._id.toString() === c.doctorId._id.toString() &&
              Math.abs(new Date(p.prescribedDate).getTime() - new Date(c.consultationDate).getTime()) < 86400000)
        );

        return {
          ...c,
          doctorSpecialty,
          doctorQualifications,
          prescriptions: matchingRx,
        };
      })
    );

    // Enrich prescriptions with prescribing doctor's specialty
    const enrichedPrescriptions = await Promise.all(
      rawPrescriptions.map(async (p) => {
        let doctorSpecialty = 'Consultant Physician';
        if (p.doctorId?._id) {
          const docMeta = await Doctor.findOne({ userId: p.doctorId._id }).lean();
          if (docMeta) {
            doctorSpecialty = docMeta.specialty || doctorSpecialty;
          }
        }
        return {
          ...p,
          doctorSpecialty,
        };
      })
    );

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(patientUser || {})),
        profile: JSON.parse(JSON.stringify(patientProfile || {})),
        records: JSON.parse(JSON.stringify(records || [])),
        consultations: JSON.parse(JSON.stringify(enrichedConsultations || [])),
        prescriptions: JSON.parse(JSON.stringify(enrichedPrescriptions || [])),
      },
    };
  } catch (error) {
    console.error('getPatientFullHistoryForDoctor error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch patient reviews & ratings for the logged-in doctor
 */
export async function getDoctorReviewsAction() {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const reviews = await Review.find({ doctorId: session.id })
      .sort({ createdAt: -1 })
      .lean();

    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '0.0';

    return {
      success: true,
      reviews: JSON.parse(JSON.stringify(reviews)),
      stats: {
        totalReviews: total,
        averageRating: Number(avg),
        fiveStar: reviews.filter((r) => r.rating === 5).length,
        fourStar: reviews.filter((r) => r.rating === 4).length,
        threeStar: reviews.filter((r) => r.rating === 3).length,
      },
    };
  } catch (error) {
    console.error('getDoctorReviewsAction error:', error);
    return { success: false, error: error.message, reviews: [] };
  }
}

/**
 * Doctor submits an official reply to a patient review.
 * Doctor CANNOT edit the patient's review or rating, only reply.
 */
export async function replyToDoctorReviewAction(reviewId, replyMessage) {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    if (!replyMessage || !replyMessage.trim()) {
      return { success: false, error: 'Reply text cannot be empty' };
    }

    const review = await Review.findOne({ _id: reviewId, doctorId: session.id });
    if (!review) {
      return { success: false, error: 'Review not found or unauthorized' };
    }

    review.doctorReply = {
      message: replyMessage.trim(),
      repliedAt: new Date(),
    };
    await review.save();

    revalidatePath('/doctor/reviews');
    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');

    return {
      success: true,
      message: 'Official response published successfully on your profile',
      doctorReply: review.doctorReply,
    };
  } catch (error) {
    console.error('replyToDoctorReviewAction error:', error);
    return { success: false, error: error.message };
  }
}

