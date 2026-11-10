import { getDoctorPatients } from '@/actions/doctorActions';
import DoctorPatientsClient from './DoctorPatientsClient';

export default async function DoctorPatientsPage() {
  const res = await getDoctorPatients();
  const patients = res.success ? res.patients : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Clinical Caseload</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Authorized Patient Roster
        </h1>
        <p className="text-xs text-slate-500">
          Review clinical profiles, medical records, and previous consultations for patients under your active clinical care.
        </p>
      </div>

      <DoctorPatientsClient initialPatients={patients} />
    </div>
  );
}

