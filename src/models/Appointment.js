import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['in-person', 'teleconsultation', 'follow-up'],
      default: 'in-person',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    fee: {
      type: Number,
      default: 500,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

