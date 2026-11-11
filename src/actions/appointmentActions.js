'use server';

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import DoctorPatientAccess from '@/models/DoctorPatientAccess';
import AuditLog from '@/models/AuditLog';
import { requireAuth, requireRole } from '@/lib/auth';
import { APPOINTMENT_STATUSES } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

/**
 * Book a new appointment
 */
export async function bookAppointment(formData) {
  try {
    const session = await requireRole('patient');
    await connectDB();

    const doctorId = formData.get('doctorId')?.toString();
    const appointmentDateStr = formData.get('appointmentDate')?.toString();
    const timeSlot = formData.get('timeSlot')?.toString().trim();
    const type = formData.get('type')?.toString() || 'in-person';
    const reason = formData.get('reason')?.toString().trim();

    if (!doctorId || !appointmentDateStr || !timeSlot || !reason) {
      return { success: false, error: 'Doctor, date, time slot, and consultation reason are required' };
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return { success: false, error: 'Selected doctor is invalid' };
    }

    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return { success: false, error: 'Selected doctor is invalid' };
    }

    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    const fee = doctorProfile?.consultationFee || 500;

    const appointmentDate = new Date(appointmentDateStr);

    // Check for conflicting appointment
    const conflict = await Appointment.findOne({
      doctorId,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999)),
      },
      timeSlot,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (conflict) {
      return {
        success: false,
        error: `Doctor already has a booking at ${timeSlot} on that date. Please select another slot.`,
      };
    }

    const appointment = await Appointment.create({
      patientId: session.id,
      doctorId,
      appointmentDate,
      timeSlot,
      type,
      status: 'scheduled',
      reason,
      fee,
    });

    // Automatically establish DoctorPatientAccess for record sharing
    await DoctorPatientAccess.findOneAndUpdate(
      { patientId: session.id, doctorId },
      {
        status: 'granted',
        accessLevel: 'full',
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
      { upsert: true }
    );

    // Audit Log
    await AuditLog.create({
      userId: session.id,
      action: 'APPOINTMENT_BOOKED',
      entityType: 'Appointment',
      entityId: appointment._id.toString(),
      details: { doctorId, appointmentDate, timeSlot },
    });

    revalidatePath('/patient/appointments');
    revalidatePath('/patient/dashboard');
    revalidatePath('/doctor/appointments');
    revalidatePath('/doctor/patients');
    revalidatePath('/doctor/dashboard');

    return {
      success: true,
      message: 'Appointment scheduled successfully!',
      appointmentId: appointment._id.toString(),
    };
  } catch (error) {
    console.error('bookAppointment error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get appointments for current user (Doctor, Patient, or Admin)
 */
export async function getUserAppointments(filter = {}) {
  try {
    const session = await requireAuth();
    await connectDB();

    const query = {};

    if (session.role === 'patient') {
      query.patientId = session.id;
    } else if (session.role === 'doctor') {
      query.doctorId = session.id;
    }
    // Admin gets all appointments or filtered

    if (filter.status && filter.status !== 'all') {
      query.status = filter.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    const sanitizedAppointments =
      session.role === 'doctor'
        ? appointments.map((apt) =>
            apt.status === 'cancelled' && apt.patientId
              ? { ...apt, patientId: { _id: apt.patientId._id, name: apt.patientId.name } }
              : apt
          )
        : appointments;

    return {
      success: true,
      appointments: JSON.parse(JSON.stringify(sanitizedAppointments)),
    };
  } catch (error) {
    console.error('getUserAppointments error:', error);
    return { success: false, error: error.message, appointments: [] };
  }
}

/**
 * Update appointment status (confirm, cancel, complete, reschedule)
 */
export async function updateAppointmentStatus(appointmentId, status, notes = '') {
  try {
    const session = await requireAuth();
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(String(appointmentId))) {
      return { success: false, error: 'Invalid appointment ID' };
    }

    if (!APPOINTMENT_STATUSES.includes(status)) {
      return { success: false, error: 'Invalid appointment status' };
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Role check: Only the involved patient, involved doctor, or admin can update
    const isPatient = appointment.patientId.toString() === session.id;
    const isDoctor = appointment.doctorId.toString() === session.id;
    const isAdmin = session.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return { success: false, error: 'Unauthorized to modify this appointment' };
    }

    if (isPatient && !isDoctor && !isAdmin && status !== 'cancelled') {
      return { success: false, error: 'Patients can only cancel appointments' };
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    if (status === 'cancelled') {
      const hasOtherActiveAppointment = await Appointment.exists({
        _id: { $ne: appointment._id },
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        status: { $ne: 'cancelled' },
      });

      if (!hasOtherActiveAppointment) {
        await DoctorPatientAccess.findOneAndUpdate(
          { patientId: appointment.patientId, doctorId: appointment.doctorId },
          { status: 'revoked' }
        );
      }
    } else {
      await DoctorPatientAccess.findOneAndUpdate(
        { patientId: appointment.patientId, doctorId: appointment.doctorId },
        { status: 'granted', accessLevel: 'full' },
        { upsert: true }
      );
    }

    await AuditLog.create({
      userId: session.id,
      action: `APPOINTMENT_${status.toUpperCase()}`,
      entityType: 'Appointment',
      entityId: appointmentId,
      details: { newStatus: status, notes },
    });

    revalidatePath('/patient/appointments');
    revalidatePath('/patient/dashboard');
    revalidatePath('/doctor/appointments');
    revalidatePath('/doctor/patients');
    revalidatePath('/doctor/dashboard');
    revalidatePath('/admin/appointments');

    return { success: true, message: `Appointment marked as ${status}` };
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    return { success: false, error: error.message };
  }
}

