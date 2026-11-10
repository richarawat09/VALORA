'use server';

import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Consultation from '@/models/Consultation';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import AuditLog from '@/models/AuditLog';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Doctor creates a digital prescription
 */
export async function createPrescriptionAction(formData) {
  try {
    const session = await requireRole('doctor');
    await connectDB();

    const patientId = formData.get('patientId')?.toString();
    const appointmentId = formData.get('appointmentId')?.toString() || undefined;
    const consultationId = formData.get('consultationId')?.toString() || undefined;
    const generalAdvice = formData.get('generalAdvice')?.toString() || '';
    const diagnosticTestsRaw = formData.get('diagnosticTests')?.toString() || '';
    const medicationsJson = formData.get('medications')?.toString();

    if (!patientId) {
      return { success: false, error: 'Patient ID is required' };
    }

    let medications = [];
    if (medicationsJson) {
      try {
        medications = JSON.parse(medicationsJson);
      } catch (err) {
        return { success: false, error: 'Invalid medications format' };
      }
    }

    if (!Array.isArray(medications) || medications.length === 0) {
      // Fallback: check if single medicine was passed via form fields
      const medicineName = formData.get('medicineName')?.toString();
      if (medicineName) {
        medications = [
          {
            medicineName,
            dosage: formData.get('dosage')?.toString() || '1 tablet',
            frequency: formData.get('frequency')?.toString() || 'Twice daily',
            duration: formData.get('duration')?.toString() || '5 days',
            instructions: formData.get('instructions')?.toString() || 'After food',
          },
        ];
      } else {
        return { success: false, error: 'At least one prescribed medicine is required' };
      }
    }

    const diagnosticTestsAdvised = diagnosticTestsRaw
      ? diagnosticTestsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const prescription = await Prescription.create({
      patientId,
      doctorId: session.id,
      appointmentId,
      consultationId,
      medications,
      diagnosticTestsAdvised,
      generalAdvice,
      prescribedDate: new Date(),
    });

    await AuditLog.create({
      userId: session.id,
      action: 'PRESCRIPTION_ISSUED',
      entityType: 'Prescription',
      entityId: prescription._id.toString(),
      details: { patientId, count: medications.length },
    });

    revalidatePath('/doctor/prescriptions');
    revalidatePath('/patient/prescriptions');
    revalidatePath('/patient/history');

    return {
      success: true,
      message: 'Prescription issued successfully',
      prescriptionId: prescription._id.toString(),
    };
  } catch (error) {
    console.error('createPrescriptionAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get prescriptions for current user
 */
export async function getPrescriptions(filter = {}) {
  try {
    const session = await requireAuth();
    await connectDB();

    const query = {};

    if (session.role === 'patient') {
      query.patientId = session.id;
    } else if (session.role === 'doctor') {
      if (filter.patientId) {
        query.patientId = filter.patientId;
      } else {
        query.doctorId = session.id;
      }
    } else if (session.role === 'admin') {
      if (filter.patientId) query.patientId = filter.patientId;
      if (filter.doctorId) query.doctorId = filter.doctorId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name email phone avatar')
      .populate('patientId', 'name email phone avatar')
      .sort({ prescribedDate: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      prescriptions: JSON.parse(JSON.stringify(prescriptions)),
    };
  } catch (error) {
    console.error('getPrescriptions error:', error);
    return { success: false, error: error.message, prescriptions: [] };
  }
}

