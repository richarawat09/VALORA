'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import {
  submitPatientReviewAction,
  getReviewsForDoctorPublicAction,
} from '@/actions/reviewActions';
import { Star, ShieldCheck, AlertCircle, CheckCircle2, Send, MessageSquare } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export default function DoctorReviewModal({
  isOpen,
  onClose,
  doctor,
  defaultServiceType = '',
}) {
  const router = useRouter();
  const targetDoctorId = doctor?.userId?._id || doctor?._id || '';
  const doctorName = doctor?.userId?.name || doctor?.name || 'Doctor';
  const doctorSpecialty = doctor?.specialty || '';
  const fallbackService = doctorSpecialty ? `${doctorSpecialty} Consultation` : 'Clinical Consultation';

  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [serviceType, setServiceType] = useState(defaultServiceType || fallbackService);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && targetDoctorId) {
      setRating(5);
      setHoveredRating(0);
      setServiceType(defaultServiceType || fallbackService);
      setComment('');
      setError('');
      setSuccess('');
      setLoadingReviews(true);

      getReviewsForDoctorPublicAction(targetDoctorId)
        .then((res) => {
          if (res.success) {
            setReviews(res.reviews || []);
          }
        })
        .finally(() => setLoadingReviews(false));
    }
  }, [isOpen, targetDoctorId, defaultServiceType, fallbackService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('doctorId', targetDoctorId);
    formData.append('rating', String(rating));
    formData.append('serviceType', serviceType);
    formData.append('comment', comment);

    const res = await submitPatientReviewAction(formData);

    if (res.success) {
      setSuccess(res.message || 'Review published successfully!');
      setComment('');
      setReviews((prev) => [res.review, ...prev]);
      router.refresh();
    } else {
      setError(res.error || 'Failed to publish review');
    }
    setIsSubmitting(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reviews & Rating • ${doctorName}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Write Review Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Write a Patient Review</h3>
              <p className="text-xs text-slate-500">
                Share your consultation experience with {doctorName}.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl self-start sm:self-auto">
              {displayRating}/5 • {RATING_LABELS[displayRating]}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Star Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Your Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg hover:bg-amber-50 transition-colors"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= displayRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Consultation / Visit Type
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Cardiology Checkup, Follow-up Review"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Your Feedback *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the doctor's communication, diagnosis clarity, and overall care..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>

        {/* Existing Reviews for this Doctor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Feedback ({reviews.length})</span>
            </h4>
          </div>

          {loadingReviews ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{rev.patientName}</span>
                      {rev.isVerifiedVisit && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Visit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {rev.serviceType} • {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>

                  {rev.doctorReply?.message && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700">
                      <span className="font-bold text-[11px] text-emerald-800 block mb-0.5">
                        Doctor&apos;s Official Reply:
                      </span>
                      <p>{rev.doctorReply.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
              No reviews yet for {doctorName}. Be the first to share feedback!
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
