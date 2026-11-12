'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPatientReviewAction } from '@/actions/reviewActions';
import { Star, ShieldCheck, AlertCircle, CheckCircle2, Send, Stethoscope, MessageSquare } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export default function PatientReviewsClient({ initialReviews = [], doctorsList = [] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [doctorId, setDoctorId] = useState(doctorsList[0]?.userId?._id || '');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [serviceType, setServiceType] = useState('Clinical Consultation');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('doctorId', doctorId);
    formData.append('rating', String(rating));
    formData.append('serviceType', serviceType);
    formData.append('comment', comment);

    const res = await submitPatientReviewAction(formData);

    if (res.success) {
      const selectedDoc = doctorsList.find((d) => d.userId?._id === doctorId);
      const createdReview = {
        ...res.review,
        doctorId: { _id: doctorId, name: selectedDoc?.userId?.name || 'Doctor' },
        doctorSpecialty: selectedDoc?.specialty || 'Specialist',
      };
      setReviews((prev) => [createdReview, ...prev]);
      setSuccess(res.message || 'Review submitted successfully!');
      setComment('');
      router.refresh();
    } else {
      setError(res.error || 'Failed to publish review');
    }
    setIsSubmitting(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="space-y-8">
      {/* Write Review Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Write a Review for a Doctor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your feedback helps other patients and appears on the physician&apos;s reviews dashboard.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            {displayRating}/5 • {RATING_LABELS[displayRating]}
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Physician *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose a doctor --</option>
              {doctorsList.map((doc) => (
                <option key={doc._id} value={doc.userId._id}>
                  {doc.userId.name} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Consultation / Visit Type
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. Cardiology Consultation, Routine Checkup"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Star Rating *
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1.5 rounded-xl hover:bg-amber-50 transition-colors"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Your Review & Experience *
          </label>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with the consultation, clarity of medical advice, and care..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !doctorId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Review...' : 'Publish Review'}</span>
          </button>
        </div>
      </form>

      {/* Published Reviews List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>My Submitted Reviews ({reviews.length})</span>
        </h3>

        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {rev.doctorId?.name || 'Physician'}
                    </span>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {rev.doctorSpecialty || 'Specialist'}
                    </span>
                    {rev.isVerifiedVisit && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Visit
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {rev.serviceType} • {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/70 self-start sm:self-auto">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-black text-amber-800 ml-1">{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              &ldquo;{rev.comment}&rdquo;
            </p>

            {rev.doctorReply?.message && (
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-900 block">
                  Official Response from {rev.doctorId?.name || 'Doctor'}:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.doctorReply.message}</p>
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No reviews written yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Use the form above to rate and review any doctor on the platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

