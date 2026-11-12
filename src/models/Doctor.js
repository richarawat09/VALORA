import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Please specify doctor specialty'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 1,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is mandatory'],
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    biography: {
      type: String,
      default: '',
    },
    clinicAddress: {
      clinicName: { type: String, default: 'VALORA Care Center' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

