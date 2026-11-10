import mongoose from 'mongoose';

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordType: {
      type: String,
      enum: [
        'lab_report',
        'xray',
        'mri_scan',
        'ct_scan',
        'ultrasound',
        'prescription',
        'discharge_summary',
        'other',
      ],
      required: [true, 'Medical record category is required'],
    },
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'Document storage link is required'],
    },
    filePublicId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
    facilityOrDoctor: {
      type: String,
      default: 'VALORA Health',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isConfidential: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);

