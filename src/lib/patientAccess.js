import mongoose from 'mongoose';
import Appointment from '@/models/Appointment';
import DoctorPatientAccess from '@/models/DoctorPatientAccess';
import User from '@/models/User';

/**
 * Checks whether a doctor is authorized to view or manage a patient's profile.
 * Access is granted only when the patient has at least one non-cancelled appointment
 * request/booking with this doctor and access has not been revoked.
 */
export async function hasDoctorAppointmentAccess(doctorId, patientId) {
  if (
    !doctorId ||
    !patientId ||
    !mongoose.Types.ObjectId.isValid(String(doctorId)) ||
    !mongoose.Types.ObjectId.isValid(String(patientId))
  ) {
    return false;
  }

  const patientUser = await User.findOne({ _id: patientId, role: 'patient' })
    .select('_id')
    .lean();
  if (!patientUser) {
    return false;
  }

  const hasAppointment = await Appointment.exists({
    doctorId,
    patientId,
    status: { $ne: 'cancelled' },
  });

  if (!hasAppointment) {
    return false;
  }

  const revokedAccess = await DoctorPatientAccess.exists({
    doctorId,
    patientId,
    status: 'revoked',
  });

  return !revokedAccess;
}

/**
 * Verifies an optional appointmentId belongs to the doctor and patient and is not cancelled,
 * alongside general appointment-based access.
 */
export async function verifyDoctorPatientAppointment(doctorId, patientId, appointmentId = null) {
  const hasAccess = await hasDoctorAppointmentAccess(doctorId, patientId);
  if (!hasAccess) {
    return false;
  }

  if (appointmentId) {
    if (!mongoose.Types.ObjectId.isValid(String(appointmentId))) {
      return false;
    }

    const matchingAppointment = await Appointment.exists({
      _id: appointmentId,
      doctorId,
      patientId,
      status: { $ne: 'cancelled' },
    });

    return Boolean(matchingAppointment);
  }

  return true;
}

