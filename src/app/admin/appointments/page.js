import { getUserAppointments } from '@/actions/appointmentActions';
import AdminAppointmentsClient from './AdminAppointmentsClient';

export default async function AdminAppointmentsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status || 'all';

  const res = await getUserAppointments({ status });
  const appointments = res.success ? res.appointments : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Hospital Scheduling</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Platform-Wide Appointments
        </h1>
        <p className="text-xs text-slate-500">
          Supervise appointment bookings across all clinics, examine statuses, and govern scheduling conflicts.
        </p>
      </div>

      <AdminAppointmentsClient initialAppointments={appointments} initialStatus={status} />
    </div>
  );
}

