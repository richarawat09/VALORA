import { getDoctorsDirectory } from '@/actions/doctorActions';
import DoctorsDirectoryClient from './DoctorsDirectoryClient';

export default async function PatientDoctorsPage({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search || '';
  const specialty = sp?.specialty || '';

  const result = await getDoctorsDirectory(search, specialty);
  const doctors = result.success ? result.doctors : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Physicians Directory</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Find & Book Verified Specialists
        </h1>
        <p className="text-xs text-slate-500">
          Search across our credentialed medical network, compare clinical specialties, consultation fees, and schedule visits.
        </p>
      </div>

      <DoctorsDirectoryClient initialDoctors={doctors} initialSearch={search} initialSpecialty={specialty} />
    </div>
  );
}

