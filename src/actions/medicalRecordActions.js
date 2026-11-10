'use server';

import connectDB from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import DoctorPatientAccess from '@/models/DoctorPatientAccess';
import AuditLog from '@/models/AuditLog';
import { requireAuth } from '@/lib/auth';
import { uploadMedicalDocument, deleteMedicalDocument } from '@/lib/cloudStorage';
import { RECORD_TYPES } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

/**
 * Upload a new medical record (PDF, X-Ray, MRI, CT Scan, Ultrasound, Lab Report, etc.)
 */
export async function uploadMedicalRecordAction(formData) {
  try {
    const session = await requireAuth();
    await connectDB();

    const title = formData.get('title')?.toString().trim();
    const recordType = formData.get('recordType')?.toString();
    const description = formData.get('description')?.toString().trim() || '';
    const facilityOrDoctor = formData.get('facilityOrDoctor')?.toString().trim() || 'VALORA Health';
    const tagsRaw = formData.get('tags')?.toString() || '';
    const isConfidential = formData.get('isConfidential') === 'true';

    // Target patient
    let patientId = formData.get('patientId')?.toString();
    if (!patientId || session.role === 'patient') {
      patientId = session.id;
    }

    if (!title || !recordType) {
      return { success: false, error: 'Document title and medical record type are required' };
    }

    if (!RECORD_TYPES.includes(recordType)) {
      return { success: false, error: 'Invalid medical record category' };
    }

    const file = formData.get('file');
    let fileUrl = '';
    let filePublicId = '';
    let fileSize = 0;
    let fileType = 'application/pdf';

    if (file && typeof file === 'object' && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileSize = file.size;
      fileType = file.type || 'application/pdf';

      const uploadResult = await uploadMedicalDocument(buffer, {
        filename: file.name || `record_${recordType}`,
        folder: `valora/patients/${patientId}`,
      });

      fileUrl = uploadResult.secure_url;
      filePublicId = uploadResult.public_id;
    } else {
      // Fallback demo document if user submitted without attaching an actual binary
      fileUrl = '/uploads/sample_medical_doc.pdf';
      filePublicId = `doc_${Date.now()}`;
      fileSize = 102400;
    }

    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const record = await MedicalRecord.create({
      patientId,
      uploadedBy: session.id,
      recordType,
      title,
      description,
      fileUrl,
      filePublicId,
      fileType,
      fileSize,
      facilityOrDoctor,
      tags,
      isConfidential,
      recordDate: new Date(),
    });

    await AuditLog.create({
      userId: session.id,
      action: 'MEDICAL_RECORD_UPLOADED',
      entityType: 'MedicalRecord',
      entityId: record._id.toString(),
      details: { title, recordType, patientId, fileUrl },
    });

    revalidatePath('/patient/medical-records');
    revalidatePath('/patient/dashboard');
    revalidatePath('/doctor/patients');

    return {
      success: true,
      message: 'Medical document uploaded and securely stored',
      record: JSON.parse(JSON.stringify(record)),
    };
  } catch (error) {
    console.error('uploadMedicalRecordAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve medical records with authorization check
 */
export async function getMedicalRecords(filter = {}) {
  try {
    const session = await requireAuth();
    await connectDB();

    const query = {};

    if (session.role === 'patient') {
      // Patients can only see their own records
      query.patientId = session.id;
    } else if (session.role === 'doctor') {
      if (filter.patientId) {
        // Verify doctor has access to this patient
        const access = await DoctorPatientAccess.findOne({
          doctorId: session.id,
          patientId: filter.patientId,
          status: 'granted',
        });

        if (!access) {
          // If no formal access, verify if they have shared an appointment
          const Appointment = (await import('@/models/Appointment')).default;
          const hasApt = await Appointment.exists({ doctorId: session.id, patientId: filter.patientId });
          if (!hasApt) {
            return { success: false, error: 'Access denied: Patient has not authorized record viewing', records: [] };
          }
        }
        query.patientId = filter.patientId;
      } else {
        // Records uploaded by this doctor
        query.uploadedBy = session.id;
      }
    } else if (session.role === 'admin') {
      if (filter.patientId) {
        query.patientId = filter.patientId;
      }
    }

    if (filter.recordType && filter.recordType !== 'all') {
      query.recordType = filter.recordType;
    }

    const records = await MedicalRecord.find(query)
      .populate('uploadedBy', 'name role')
      .populate('patientId', 'name email')
      .sort({ recordDate: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      records: JSON.parse(JSON.stringify(records)),
    };
  } catch (error) {
    console.error('getMedicalRecords error:', error);
    return { success: false, error: error.message, records: [] };
  }
}

/**
 * Delete a medical record
 */
export async function deleteMedicalRecord(recordId) {
  try {
    const session = await requireAuth();
    await connectDB();

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return { success: false, error: 'Medical record not found' };
    }

    const isOwner = record.patientId.toString() === session.id;
    const isUploader = record.uploadedBy.toString() === session.id;
    const isAdmin = session.role === 'admin';

    if (!isOwner && !isUploader && !isAdmin) {
      return { success: false, error: 'Unauthorized to delete this medical record' };
    }

    await deleteMedicalDocument(record.filePublicId, record.fileUrl);
    await MedicalRecord.findByIdAndDelete(recordId);

    await AuditLog.create({
      userId: session.id,
      action: 'MEDICAL_RECORD_DELETED',
      entityType: 'MedicalRecord',
      entityId: recordId,
      details: { title: record.title },
    });

    revalidatePath('/patient/medical-records');
    revalidatePath('/patient/dashboard');

    return { success: true, message: 'Medical record deleted' };
  } catch (error) {
    console.error('deleteMedicalRecord error:', error);
    return { success: false, error: error.message };
  }
}

