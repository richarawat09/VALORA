import { getDoctorProfile } from '@/actions/doctorActions';
import DoctorProfileForm from './DoctorProfileForm';
import { Stethoscope, AlertTriangle } from 'lucide-react';

export default async function DoctorProfilePage() {
  const result = await getDoctorProfile();

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
    </div>
  );
}

