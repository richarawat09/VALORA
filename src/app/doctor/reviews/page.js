import { getDoctorReviewsAction } from '@/actions/doctorActions';
import DoctorReviewsClient from './DoctorReviewsClient';

export default async function DoctorReviewsPage() {
  const res = await getDoctorReviewsAction();
  const reviews = res.success ? res.reviews : [];
  const stats = res.success ? res.stats : { totalReviews: 0, averageRating: 5.0, fiveStar: 0, fourStar: 0, threeStar: 0 };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Patient Feedback & Reputation</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Patient Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500">
          Verified reviews submitted by patients after completed consultations. Reviews cannot be altered by doctors, but you can publish official responses to each review.
        </p>
      </div>

      <DoctorReviewsClient initialReviews={reviews} stats={stats} />
    </div>
  );
}
