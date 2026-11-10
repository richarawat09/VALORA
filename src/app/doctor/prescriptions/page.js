import { getPrescriptions } from '@/actions/prescriptionActions';
import DoctorPrescriptionsClient from './DoctorPrescriptionsClient';

export default async function DoctorPrescriptionsPage() {
  const res = await getPrescriptions();
  const prescriptions = res.success ? res.prescriptions : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Digital Rx Center</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Prescriptions Issued
        </h1>
        <p className="text-xs text-slate-500">
          Track electronic drug orders, dosage regimens, and diagnostic tests advised to patients.
        </p>
      </div>

      <DoctorPrescriptionsClient initialPrescriptions={prescriptions} />
    </div>
  );
}

