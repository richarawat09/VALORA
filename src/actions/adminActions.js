'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import MedicalRecord from '@/models/MedicalRecord';
import Prescription from '@/models/Prescription';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get core Admin dashboard KPI statistics
 */
export async function getAdminStats() {
  try {
    await requireRole('admin');
    await connectDB();

    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      totalRecords,
      totalPrescriptions,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Doctor.countDocuments({ isVerified: false }),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments(),
      Prescription.countDocuments(),
      AuditLog.find()
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .limit(8)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        totalRecords,
        totalPrescriptions,
        recentAuditLogs: JSON.parse(JSON.stringify(recentAuditLogs)),
      },
    };
  } catch (error) {
    console.error('getAdminStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Manage all patients
 */
export async function getAllPatients(search = '') {
  try {
    await requireRole('admin');
    await connectDB();

    const query = { role: 'patient' };
    if (search) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const patients = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const enrichedPatients = await Promise.all(
      patients.map(async (p) => {
        const profile = await Patient.findOne({ userId: p._id }).lean();
        const recordsCount = await MedicalRecord.countDocuments({ patientId: p._id });
        const appointmentsCount = await Appointment.countDocuments({ patientId: p._id });
        return {
          ...p,
          profile: profile || {},
          recordsCount,
          appointmentsCount,
        };
      })
    );

    return {
      success: true,
      patients: JSON.parse(JSON.stringify(enrichedPatients)),
    };
  } catch (error) {
    console.error('getAllPatients error:', error);
    return { success: false, error: error.message, patients: [] };
  }
}

/**
 * Manage all doctors
 */
export async function getAllDoctors(search = '', filterVerification = 'all') {
  try {
    await requireRole('admin');
    await connectDB();

    const userQuery = { role: 'doctor' };
    if (search) {
      const q = search.trim();
      userQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const doctorUsers = await User.find(userQuery).select('-passwordHash').sort({ createdAt: -1 }).lean();

    const enrichedDoctors = await Promise.all(
      doctorUsers.map(async (u) => {
        const profile = await Doctor.findOne({ userId: u._id }).lean();
        const appointmentsCount = await Appointment.countDocuments({ doctorId: u._id });
        return {
          ...u,
          doctorProfile: profile || {},
          appointmentsCount,
        };
      })
    );

    let filtered = enrichedDoctors;
    if (filterVerification === 'verified') {
      filtered = filtered.filter((d) => d.doctorProfile?.isVerified === true);
    } else if (filterVerification === 'pending') {
      filtered = filtered.filter((d) => !d.doctorProfile?.isVerified);
    }

    return {
      success: true,
      doctors: JSON.parse(JSON.stringify(filtered)),
    };
  } catch (error) {
    console.error('getAllDoctors error:', error);
    return { success: false, error: error.message, doctors: [] };
  }
}

/**
 * Verify or Reject doctor credentials
 */
export async function verifyDoctorAction(doctorId, isVerified, notes = '') {
  try {
    const session = await requireRole('admin');
    await connectDB();

    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return { success: false, error: 'Doctor profile record not found' };
    }

    doctorProfile.isVerified = isVerified;
    if (notes) doctorProfile.verificationNotes = notes;
    await doctorProfile.save();

    // Also update User status
    await User.findByIdAndUpdate(doctorId, {
      status: isVerified ? 'active' : 'pending_verification',
    });

    await AuditLog.create({
      userId: session.id,
      action: isVerified ? 'DOCTOR_VERIFIED' : 'DOCTOR_VERIFICATION_REVOKED',
      entityType: 'Doctor',
      entityId: doctorId,
      details: { isVerified, notes },
    });

    revalidatePath('/admin/doctors');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: isVerified ? 'Doctor verified successfully' : 'Doctor verification revoked',
    };
  } catch (error) {
    console.error('verifyDoctorAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle user account status (active / suspended)
 */
export async function toggleUserStatusAction(userId, status) {
  try {
    const session = await requireRole('admin');
    await connectDB();

    if (!['active', 'suspended'].includes(status)) {
      return { success: false, error: 'Invalid status' };
    }

    await User.findByIdAndUpdate(userId, { status });

    await AuditLog.create({
      userId: session.id,
      action: `USER_${status.toUpperCase()}`,
      entityType: 'User',
      entityId: userId,
      details: { newStatus: status },
    });

    revalidatePath('/admin/patients');
    revalidatePath('/admin/doctors');

    return { success: true, message: `User account is now ${status}` };
  } catch (error) {
    console.error('toggleUserStatusAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get analytics datasets for Chart.js
 */
export async function getPlatformAnalyticsData() {
  try {
    await requireRole('admin');
    await connectDB();

    // 1. Monthly appointments (Last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyAppointmentsData = new Array(12).fill(0);
    const monthlyPatientsData = new Array(12).fill(0);

    const allAppointments = await Appointment.find().select('appointmentDate status').lean();
    allAppointments.forEach((apt) => {
      const d = new Date(apt.appointmentDate);
      if (d.getFullYear() === currentYear) {
        monthlyAppointmentsData[d.getMonth()] += 1;
      }
    });

    const allPatients = await User.find({ role: 'patient' }).select('createdAt').lean();
    allPatients.forEach((p) => {
      const d = new Date(p.createdAt);
      if (d.getFullYear() === currentYear) {
        monthlyPatientsData[d.getMonth()] += 1;
      }
    });

    // 2. Appointment status distribution
    const statusCounts = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    allAppointments.forEach((apt) => {
      if (statusCounts[apt.status] !== undefined) {
        statusCounts[apt.status] += 1;
      }
    });

    // 3. Doctor Specialty Distribution
    const doctors = await Doctor.find().select('specialty').lean();
    const specialtyCounts = {};
    doctors.forEach((d) => {
      const spec = d.specialty || 'General';
      specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
    });

    // 4. Medical Record Types Distribution
    const records = await MedicalRecord.find().select('recordType').lean();
    const recordTypeCounts = {};
    records.forEach((r) => {
      const type = r.recordType || 'other';
      recordTypeCounts[type] = (recordTypeCounts[type] || 0) + 1;
    });

    return {
      success: true,
      analytics: {
        monthlyLabels: months,
        monthlyAppointments: monthlyAppointmentsData,
        monthlyPatients: monthlyPatientsData,
        statusDistribution: statusCounts,
        specialtyDistribution: specialtyCounts,
        recordTypeDistribution: recordTypeCounts,
        totalRecords: records.length,
        totalAppointments: allAppointments.length,
      },
    };
  } catch (error) {
    console.error('getPlatformAnalyticsData error:', error);
    return { success: false, error: error.message };
  }
}

