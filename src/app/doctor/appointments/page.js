import { getUserAppointments } from '@/actions/appointmentActions';
import DoctorAppointmentsClient from './DoctorAppointmentsClient';

export default async function DoctorAppointmentsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status || 'all';

  const res = await getUserAppointments({ status });
  const appointments = res.success ? res.appointments : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Patient Scheduler</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Clinic Consultations & Bookings
        </h1>
        <p className="text-xs text-slate-500">
          Review consultation requests, confirm patient appointments, record diagnosis, and update visit outcomes.
        </p>
      </div>

      <DoctorAppointmentsClient initialAppointments={appointments} initialStatus={status} />
    </div>
  );
}

