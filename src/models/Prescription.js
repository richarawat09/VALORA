import mongoose from 'mongoose';

const MedicationItemSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    default: '1 tablet',
    trim: true,
  },
  frequency: {
    type: String,
    default: 'Twice daily (1-0-1)',
    trim: true,
  },
  duration: {
    type: String,
    default: '5 days',
    trim: true,
  },
  instructions: {
    type: String,
    default: 'After meals',
    trim: true,
  },
});

const PrescriptionSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },
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
    prescribedDate: {
      type: Date,
      default: Date.now,
    },
    medications: {
      type: [MedicationItemSchema],
      default: [],
    },
    diagnosticTestsAdvised: {
      type: [String],
      default: [],
    },
    generalAdvice: {
      type: String,
      default: 'Rest well, drink plenty of fluids, and follow dosage timing.',
    },
    isDispensed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);

