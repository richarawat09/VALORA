import { getUserAppointments } from '@/actions/appointmentActions';
import AppointmentsClient from './AppointmentsClient';

export default async function PatientAppointmentsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp?.status || 'all';

  const res = await getUserAppointments({ status });
  const appointments = res.success ? res.appointments : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Consultation Schedule</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          My Appointments
        </h1>
        <p className="text-xs text-slate-500">
          Review, schedule, and manage your in-person clinic visits and telemedicine consultations.
        </p>
      </div>

      <AppointmentsClient initialAppointments={appointments} initialStatus={status} />
    </div>
  );
}

