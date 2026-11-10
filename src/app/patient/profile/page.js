import { getPatientProfile } from '@/actions/patientActions';
import PatientProfileForm from './PatientProfileForm';
import { User, Shield, AlertTriangle } from 'lucide-react';

export default async function PatientProfilePage() {
  const result = await getPatientProfile();

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">Error loading profile</p>
        <p className="text-xs text-slate-500">{result.error}</p>
      </div>
    );
  }

  const { user, profile } = result;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Personal & Clinical Data</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            My Health Profile
          </h1>
          <p className="text-xs text-slate-500">
            Keep your health parameters, allergies, and emergency points of contact updated for attending physicians.
          </p>
        </div>
      </div>

      <PatientProfileForm initialUser={user} initialProfile={profile} />
    </div>
  );
}

