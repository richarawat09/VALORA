import { getDoctorConsultations } from '@/actions/doctorActions';
import DoctorConsultationsClient from './DoctorConsultationsClient';

export default async function DoctorConsultationsPage() {
  const res = await getDoctorConsultations();
  const consultations = res.success ? res.consultations : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Clinical Documentation</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Patient Consultations & Clinical Notes
        </h1>
        <p className="text-xs text-slate-500">
          Documented medical evaluations, recorded vitals, differential diagnoses, and treatment plans.
        </p>
      </div>

      <DoctorConsultationsClient initialConsultations={consultations} />
    </div>
  );
}

