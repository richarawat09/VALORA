import { getDoctorProfile, getDoctorReviewsAction } from '@/actions/doctorActions';
import DoctorProfileForm from './DoctorProfileForm';
import { Stethoscope, AlertTriangle, Star, ShieldCheck, MessageSquare, Lock } from 'lucide-react';
import Link from 'next/link';

export default async function DoctorProfilePage() {
  const result = await getDoctorProfile();
  const reviewsRes = await getDoctorReviewsAction();
  const reviews = reviewsRes.success ? reviewsRes.reviews : [];
  const stats = reviewsRes.success ? reviewsRes.stats : { averageRating: 0, totalReviews: 0 };

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">Error loading doctor profile</p>
        <p className="text-xs text-slate-500">{result.error}</p>
      </div>
    );
  }

  const { user, profile } = result;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Professional Credentials</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Physician Profile & Clinical Availability
        </h1>
        <p className="text-xs text-slate-500">
          Manage your medical qualifications, clinic operating hours, consultation fees, and practice address.
        </p>
      </div>

      <DoctorProfileForm initialUser={user} initialProfile={profile} />

      {/* Patient Reviews & Verified Ratings Showcase */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-500 border border-amber-200/60">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Patient Reviews & Ratings ({reviews.length})
              </h3>
              <p className="text-xs text-slate-500">
                Average Rating:{' '}
                <strong className="text-slate-900">
                  {stats.totalReviews > 0 ? `${stats.averageRating} / 5.0` : 'No ratings yet'}
                </strong>{' '}
                • Patient consultations
              </p>
            </div>
          </div>
          <Link
            href="/doctor/reviews"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            Manage & Reply to Reviews →
          </Link>
        </div>

        <div className="space-y-3.5">
          {reviews.slice(0, 3).map((r) => (
            <div key={r._id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{r.patientName}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                    Verified Visit
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 italic">
                &ldquo;{r.comment}&rdquo;
              </p>

              {r.doctorReply?.message ? (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                    ✓ Your Official Reply:
                  </span>
                  <p className="text-slate-700">{r.doctorReply.message}</p>
                </div>
              ) : (
                <Link
                  href="/doctor/reviews"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Reply to this review</span>
                </Link>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No patient reviews published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
