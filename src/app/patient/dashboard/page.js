import { getPatientDashboardData } from '@/actions/patientActions';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import {
  Calendar,
  FolderHeart,
  Pill,
  HeartPulse,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  AlertTriangle,
  Stethoscope,
  Activity,
  Phone,
} from 'lucide-react';
import PatientDashboardClientActions from './PatientDashboardClientActions';

export default async function PatientDashboardPage() {
  const result = await getPatientDashboardData();

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Unable to load Patient Workspace</h3>
        <p className="text-xs text-slate-500 mt-1">{result.error}</p>
        <Link
          href="/login"
          className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl"
        >
          Re-authenticate
        </Link>
      </div>
    );
  }

  const { user, profile, upcomingAppointments, recentRecords, recentPrescriptions, latestConsultation, stats } =
    result.data;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Patient Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Health ID: <span className="font-mono text-slate-700">VAL-PAT-{user._id.slice(-6).toUpperCase()}</span> • Blood Group: <span className="font-bold text-teal-700">{profile?.bloodGroup || 'Not specified'}</span>
          </p>
        </div>

        <PatientDashboardClientActions />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Digital Medical Records"
          value={stats.totalRecords}
          icon={FolderHeart}
          color="brand"
          subtitle="X-rays, MRIs, Lab panels"
        />
        <StatCard
          title="Total Consultations"
          value={stats.totalAppointments}
          icon={Calendar}
          color="blue"
          subtitle={`${upcomingAppointments.length} upcoming scheduled`}
        />
        <StatCard
          title="Active Prescriptions"
          value={stats.totalPrescriptions}
          icon={Pill}
          color="indigo"
          subtitle="Digital prescriptions issued"
        />
        <StatCard
          title="Recorded Vitals Status"
          value={latestConsultation?.vitalSigns?.bloodPressure || '120/80'}
          icon={HeartPulse}
          color="emerald"
          subtitle={latestConsultation ? `Pulse: ${latestConsultation.vitalSigns?.heartRate || 72} bpm` : 'Normal baseline'}
        />
      </div>

      {/* Health Overview & Emergency Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Medical Profile Snapshot
            </h3>
            <Link href="/patient/profile" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Edit Details →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Known Allergies</span>
              <div className="flex flex-wrap gap-1">
                {profile?.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((all, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 font-medium text-[11px]">
                      {all}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">None reported</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Chronic Conditions</span>
              <div className="flex flex-wrap gap-1">
                {profile?.chronicConditions && profile.chronicConditions.length > 0 ? (
                  profile.chronicConditions.map((cond, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 font-medium text-[11px]">
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No chronic illnesses</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Emergency Contact</span>
              {profile?.emergencyContact?.name ? (
                <div>
                  <p className="font-bold text-slate-800">{profile.emergencyContact.name}</p>
                  <p className="text-slate-500">{profile.emergencyContact.relation} • {profile.emergencyContact.phone}</p>
                </div>
              ) : (
                <span className="text-slate-500">Not configured</span>
              )}
            </div>
          </div>
        </div>

        {/* Latest Clinical Vitals / Notes */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Latest Doctor Note</span>
              <span className="text-[11px] text-slate-400">
                {latestConsultation ? new Date(latestConsultation.consultationDate).toLocaleDateString() : 'No notes'}
              </span>
            </div>

            {latestConsultation ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-teal-300 font-medium block">Diagnosis:</span>
                  <p className="text-sm font-bold text-white">{latestConsultation.diagnosis}</p>
                </div>
                {latestConsultation.clinicalNotes && (
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    &ldquo;{latestConsultation.clinicalNotes}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>By {latestConsultation.doctorId?.name || 'Physician'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No past consultations recorded yet. Book an appointment to consult with a doctor.
              </div>
            )}
          </div>

          <Link
            href="/patient/history"
            className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center justify-between"
          >
            <span>View Full Medical Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments & Recent Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Upcoming Scheduled Visits
            </h3>
            <Link href="/patient/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              View All ({upcomingAppointments.length}) →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-teal-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center font-bold text-sm">
                      {new Date(apt.appointmentDate).getDate()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{apt.doctorId?.name || 'Doctor'}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {apt.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'info'}>
                      {apt.status}
                    </Badge>
                    <span className="text-[11px] text-slate-400 capitalize">{apt.type}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No upcoming consultations scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Recent Medical Records */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-teal-600" />
              Recent Diagnostic Records
            </h3>
            <Link href="/patient/medical-records" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Manage Records →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentRecords.length > 0 ? (
              recentRecords.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rec.title}</p>
                      <p className="text-xs text-slate-500">
                        {rec.facilityOrDoctor} • {new Date(rec.recordDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {rec.recordType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No medical documents uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

