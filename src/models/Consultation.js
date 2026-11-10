import mongoose from 'mongoose';

const ConsultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
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
    consultationDate: {
      type: Date,
      default: Date.now,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    clinicalNotes: {
      type: String,
      default: '',
    },
    vitalSigns: {
      bloodPressure: { type: String, default: '120/80 mmHg' },
      heartRate: { type: Number, default: 72 },
      temperature: { type: Number, default: 98.6 },
      spO2: { type: Number, default: 99 },
      respiratoryRate: { type: Number, default: 16 },
      weightKg: { type: Number, default: null },
      heightCm: { type: Number, default: null },
    },
    treatmentPlan: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Consultation || mongoose.model('Consultation', ConsultationSchema);

