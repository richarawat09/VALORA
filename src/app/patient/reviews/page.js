import { getMyPatientReviewsAction } from '@/actions/reviewActions';
import PatientReviewsClient from './PatientReviewsClient';

export default async function PatientReviewsPage() {
  const res = await getMyPatientReviewsAction();
  const reviews = res.success ? res.reviews : [];
  const doctors = res.success ? res.doctors : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Feedback & Ratings
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Doctor Reviews & Feedback
        </h1>
        <p className="text-xs text-slate-500">
          Rate your attending physicians, share feedback from your visits, and read official doctor responses.
        </p>
      </div>

      <PatientReviewsClient initialReviews={reviews} doctorsList={doctors} />
    </div>
  );
}

