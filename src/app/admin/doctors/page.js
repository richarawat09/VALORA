import { getAllDoctors } from '@/actions/adminActions';
import AdminDoctorsClient from './AdminDoctorsClient';

export default async function AdminDoctorsPage({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search || '';
  const verification = sp?.verification || 'all';

  const res = await getAllDoctors(search, verification);
  const doctors = res.success ? res.doctors : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Physician Credentialing</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Doctor Profiles & Medical License Verification
        </h1>
        <p className="text-xs text-slate-500">
          Verify physician registration licenses, review clinical practice qualifications, and govern specialist permissions.
        </p>
      </div>

      <AdminDoctorsClient initialDoctors={doctors} initialSearch={search} initialVerification={verification} />
    </div>
  );
}

