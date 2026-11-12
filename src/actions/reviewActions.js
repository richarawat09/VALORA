'use server';

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import Appointment from '@/models/Appointment';
import AuditLog from '@/models/AuditLog';
import { requireAuth, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Submit a new patient review and star rating for a doctor.
 */
export async function submitPatientReviewAction(formData) {
  try {
    const session = await requireRole('patient');
    await connectDB();

    const doctorId = formData.get('doctorId')?.toString().trim();
    const ratingRaw = Number(formData.get('rating'));
    const comment = formData.get('comment')?.toString().trim();
    const serviceType = formData.get('serviceType')?.toString().trim() || 'Clinical Consultation';

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return { success: false, error: 'Please select a valid doctor to review.' };
    }

    if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
      return { success: false, error: 'Please select a star rating between 1 and 5.' };
    }

    if (!comment || comment.length < 3) {
      return { success: false, error: 'Please write a short review comment (at least 3 characters).' };
    }

    const [patientUser, doctorUser] = await Promise.all([
      User.findById(session.id).select('name').lean(),
      User.findOne({ _id: doctorId, role: 'doctor' }).select('name').lean(),
    ]);

    if (!patientUser) {
      return { success: false, error: 'Session expired. Please sign in again.' };
    }
    if (!doctorUser) {
      return { success: false, error: 'Selected doctor was not found.' };
    }

    const hasAppointment = await Appointment.exists({
      patientId: session.id,
      doctorId,
      status: { $ne: 'cancelled' },
    });

    const review = await Review.create({
      doctorId,
      patientId: session.id,
      patientName: patientUser.name || 'Patient',
      rating: ratingRaw,
      comment,
      serviceType,
      isVerifiedVisit: Boolean(hasAppointment),
    });

    // Recompute average rating & review count on Doctor profile
    const allReviews = await Review.find({ doctorId }).select('rating').lean();
    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : ratingRaw;

    await Doctor.findOneAndUpdate(
      { userId: doctorId },
      { rating: avgRating, totalReviews }
    );

    await AuditLog.create({
      userId: session.id,
      action: 'REVIEW_SUBMITTED',
      entityType: 'Review',
      entityId: review._id.toString(),
      details: { doctorId, rating: ratingRaw, isVerifiedVisit: Boolean(hasAppointment) },
    });

    revalidatePath('/patient/doctors');
    revalidatePath('/patient/appointments');
    revalidatePath('/patient/reviews');
    revalidatePath('/doctor/reviews');
    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');

    return {
      success: true,
      message: 'Review published successfully!',
      review: JSON.parse(JSON.stringify(review)),
      stats: { averageRating: avgRating, totalReviews },
    };
  } catch (error) {
    console.error('submitPatientReviewAction error:', error);
    return { success: false, error: error.message || 'Failed to submit review' };
  }
}

/**
 * Fetch all reviews for a specific doctor (for patients inspecting doctor cards/modals).
 */
export async function getReviewsForDoctorPublicAction(doctorId) {
  try {
    await requireAuth();
    await connectDB();

    if (!doctorId || !mongoose.Types.ObjectId.isValid(String(doctorId))) {
      return { success: false, error: 'Invalid doctor ID', reviews: [] };
    }

    const reviews = await Review.find({ doctorId })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    return {
      success: true,
      reviews: JSON.parse(JSON.stringify(reviews)),
      stats: { totalReviews, averageRating },
    };
  } catch (error) {
    console.error('getReviewsForDoctorPublicAction error:', error);
    return { success: false, error: error.message, reviews: [] };
  }
}

/**
 * Fetch reviews authored by the logged-in patient, plus active doctors for review submission.
 */
export async function getMyPatientReviewsAction() {
  try {
    const session = await requireRole('patient');
    await connectDB();

    const [reviews, doctors] = await Promise.all([
      Review.find({ patientId: session.id })
        .populate('doctorId', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      Doctor.find()
        .populate({
          path: 'userId',
          select: 'name email status',
          match: { status: { $ne: 'suspended' } },
        })
        .sort({ isVerified: -1, rating: -1 })
        .lean(),
    ]);

    const enrichedReviews = await Promise.all(
      reviews.map(async (r) => {
        let specialty = 'Specialist';
        if (r.doctorId?._id) {
          const docMeta = await Doctor.findOne({ userId: r.doctorId._id }).select('specialty').lean();
          if (docMeta?.specialty) specialty = docMeta.specialty;
        }
        return { ...r, doctorSpecialty: specialty };
      })
    );

    const activeDoctors = doctors.filter((d) => d.userId);

    return {
      success: true,
      reviews: JSON.parse(JSON.stringify(enrichedReviews)),
      doctors: JSON.parse(JSON.stringify(activeDoctors)),
    };
  } catch (error) {
    console.error('getMyPatientReviewsAction error:', error);
    return { success: false, error: error.message, reviews: [], doctors: [] };
  }
}

