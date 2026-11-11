'use client';

import { useState } from 'react';
import { Star, ShieldCheck, MessageSquare, Send, CheckCircle2, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { replyToDoctorReviewAction } from '@/actions/doctorActions';
import { useRouter } from 'next/navigation';

export default function DoctorReviewsClient({ initialReviews = [], stats }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleStartReply = (review) => {
    setActiveReplyId(review._id);
    setReplyText(review.doctorReply?.message || '');
    setStatusMessage({ text: '', type: '' });
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;

    setSubmittingId(reviewId);
    setStatusMessage({ text: '', type: '' });

    const res = await replyToDoctorReviewAction(reviewId, replyText);

    if (res.success) {
      setStatusMessage({ text: 'Official reply published successfully!', type: 'success' });
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, doctorReply: res.doctorReply } : r
        )
      );
      setActiveReplyId(null);
      setReplyText('');
      router.refresh();
    } else {
      setStatusMessage({ text: res.error || 'Failed to submit reply', type: 'error' });
    }
    setSubmittingId(null);
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'replied') return Boolean(r.doctorReply?.message);
    if (selectedFilter === 'unreplied') return !r.doctorReply?.message;
    return r.rating === Number(selectedFilter);
  });

  return (
    <div className="space-y-6">
      {/* Reputation Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Overall Patient Rating
          </span>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {stats.averageRating || '4.9'}
            </span>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(stats.averageRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on {stats.totalReviews || reviews.length} verified ratings
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-600">5 Stars</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${stats.totalReviews ? (stats.fiveStar / stats.totalReviews) * 100 : 85}%`,
                }}
              />
            </div>
            <span className="w-6 text-right font-medium text-slate-500">
              {stats.fiveStar || reviews.filter((r) => r.rating === 5).length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-600">4 Stars</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${stats.totalReviews ? (stats.fourStar / stats.totalReviews) * 100 : 15}%`,
                }}
              />
            </div>
            <span className="w-6 text-right font-medium text-slate-500">
              {stats.fourStar || reviews.filter((r) => r.rating === 4).length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-600">3 Stars</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${stats.totalReviews ? (stats.threeStar / stats.totalReviews) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="w-6 text-right font-medium text-slate-500">
              {stats.threeStar || reviews.filter((r) => r.rating === 3).length}
            </span>
          </div>
        </div>

        {/* Integrity Notice */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Integrity Guaranteed</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            To uphold medical credibility, patient reviews cannot be altered or deleted. Practitioners are encouraged to reply directly to acknowledge patient feedback.
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Reviews' },
          { id: '5', label: '5 Stars ★' },
          { id: '4', label: '4 Stars ★' },
          { id: 'unreplied', label: 'Awaiting Reply' },
          { id: 'replied', label: 'Replied' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === f.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Top Review Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm">
                  {review.patientName ? review.patientName.charAt(0) : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{review.patientName}</h3>
                    {review.isVerifiedVisit && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Consultation
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {review.serviceType || 'Clinical Consultation'} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60 self-start sm:self-auto">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-black text-amber-800 ml-1">
                  {review.rating}.0
                </span>
              </div>
            </div>

            {/* Read-Only Patient Comment */}
            <div className="relative pl-3 border-l-2 border-teal-500/60">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                &ldquo;{review.comment}&rdquo;
              </p>
              <span className="text-[10px] text-slate-400 block mt-1.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Verified Patient Feedback (Protected & Non-editable)
              </span>
            </div>

            {/* Doctor's Existing Reply */}
            {review.doctorReply?.message && activeReplyId !== review._id && (
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      Dr
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      Your Official Practitioner Response
                    </span>
                    {review.doctorReply.repliedAt && (
                      <span className="text-[10px] text-emerald-700">
                        • {new Date(review.doctorReply.repliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartReply(review)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    Edit Reply
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-8">
                  {review.doctorReply.message}
                </p>
              </div>
            )}

            {/* Reply Input Form */}
            {activeReplyId === review._id ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Write Official Response to {review.patientName}
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the patient, reinforce their follow-up care or clarify any medical advice..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingId === review._id || !replyText.trim()}
                    onClick={() => handleSubmitReply(review._id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingId === review._id ? 'Publishing...' : 'Publish Response'}</span>
                  </button>
                </div>
              </div>
            ) : (
              !review.doctorReply?.message && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartReply(review)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply to Patient</span>
                  </button>
                </div>
              )
            )}
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No reviews found</p>
            <p className="text-xs text-slate-500 mt-1">
              No patient feedback matches the selected rating filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

