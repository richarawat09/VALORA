import { getAllPatients } from '@/actions/adminActions';
import AdminPatientsClient from './AdminPatientsClient';

export default async function AdminPatientsPage({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search || '';

  const res = await getAllPatients(search);
  const patients = res.success ? res.patients : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Patient Governance</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Patient Accounts & Medical Portfolios
        </h1>
        <p className="text-xs text-slate-500">
          Supervise user registrations, inspect digital diagnostic record footprints, and govern access status.
        </p>
      </div>

      <AdminPatientsClient initialPatients={patients} initialSearch={search} />
    </div>
  );
}

