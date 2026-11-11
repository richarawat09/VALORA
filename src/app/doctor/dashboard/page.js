import { getDoctorDashboardData } from '@/actions/doctorActions';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import {
  Users,
  Calendar,
  ClipboardList,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Plus,
  ArrowRight,
  Pill,
} from 'lucide-react';
import DoctorDashboardClientActions from './DoctorDashboardClientActions';

export default async function DoctorDashboardPage() {
  const result = await getDoctorDashboardData();

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Doctor Workspace Error</h3>
        <p className="text-xs text-slate-500 mt-1">{result.error}</p>
        <Link
          href="/login"
          className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { user, profile, todaysAppointments, upcomingAppointments, recentConsultations, stats } =
    result.data;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Physician Workbench</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Licensed Practitioner • Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialty: <span className="font-bold text-emerald-700">{profile?.specialty}</span> • License: <span className="font-mono text-slate-700">{profile?.licenseNumber}</span> • Fee: ₹{profile?.consultationFee}
          </p>
        </div>

        <DoctorDashboardClientActions />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Appointments"
          value={stats.todaysCount}
          icon={Calendar}
          color="emerald"
          subtitle="Patients on schedule today"
        />
        <StatCard
          title="Total Patients Treated"
          value={stats.uniquePatients}
          icon={Users}
          color="blue"
          subtitle="Distinct patient histories"
        />
        <StatCard
          title="Clinical Consultations"
          value={stats.completedConsultations}
          icon={ClipboardList}
          color="brand"
          subtitle="Full diagnosis & notes recorded"
        />
        <StatCard
          title="Consultation Fee"
          value={`₹${profile?.consultationFee || 500}`}
          icon={Stethoscope}
          color="indigo"
          subtitle="Standard OPD fee per visit"
        />
      </div>

      {/* Today's Queue & Upcoming Patient Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Today&apos;s Patient Queue ({todaysAppointments.length})
            </h3>
            <Link href="/doctor/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Manage All Appointments →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-emerald-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {apt.timeSlot.split(' ')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{apt.patientId?.name || 'Patient'}</p>
                      <p className="text-xs text-slate-500">
                        {apt.timeSlot} • {apt.type} • {apt.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apt.status === 'completed' ? 'success' : 'info'}>
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No patient consultations scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Doctor Availability & Clinic Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Clinic Availability</h3>
              <Link href="/doctor/profile" className="text-xs font-bold text-teal-600 hover:text-teal-700">
                Edit Schedule
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Consultation Hours</span>
                <span className="font-bold text-slate-800">
                  {profile?.availableHours?.start || '09:00'} to {profile?.availableHours?.end || '17:00'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Operational Days</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile?.availableDays?.map((day, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-medium text-[11px]">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-semibold block">Primary Facility</span>
                <span className="font-bold text-slate-800">
                  {profile?.clinicAddress?.clinicName || 'VALORA Care Center'}
                </span>
                <p className="text-slate-500 text-[11px]">{profile?.clinicAddress?.city || 'City'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/doctor/patients"
              className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Inspect Authorized Patients</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Consultations Completed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            Recent Clinical Consultations Conducted
          </h3>
          <Link href="/doctor/consultations" className="text-xs font-bold text-teal-600 hover:text-teal-700">
            All Consultations ({recentConsultations.length}) →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {recentConsultations.length > 0 ? (
            recentConsultations.map((c) => (
              <div key={c._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{c.patientId?.name || 'Patient'}</span>
                    <Badge variant="primary" size="sm">
                      {c.diagnosis}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: {new Date(c.consultationDate).toLocaleDateString()} • Vitals: BP {c.vitalSigns?.bloodPressure || '120/80'} | Pulse {c.vitalSigns?.heartRate || 72} bpm
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {c.clinicalNotes ? (
                    <span className="line-clamp-1 italic text-slate-600">&ldquo;{c.clinicalNotes}&rdquo;</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent consultations recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

