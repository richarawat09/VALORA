import mongoose from 'mongoose';

const DoctorPatientAccessSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['granted', 'revoked', 'pending'],
      default: 'granted',
    },
    accessLevel: {
      type: String,
      enum: ['full', 'records_only', 'consultation_only'],
      default: 'full',
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default access
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique composite index so a patient-doctor pair has distinct access records
DoctorPatientAccessSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export default mongoose.models.DoctorPatientAccess || mongoose.model('DoctorPatientAccess', DoctorPatientAccessSchema);

