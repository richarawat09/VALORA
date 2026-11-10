import { getAdminStats } from '@/actions/adminActions';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import {
  Users,
  Stethoscope,
  ShieldAlert,
  Calendar,
  FolderHeart,
  Pill,
  ShieldCheck,
  Activity,
  ArrowRight,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const result = await getAdminStats();

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">Admin Authentication Required</p>
        <p className="text-xs text-slate-500">{result.error}</p>
        <Link href="/login" className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const {
    totalPatients,
    totalDoctors,
    pendingDoctors,
    totalAppointments,
    totalRecords,
    totalPrescriptions,
    recentAuditLogs,
  } = result.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Platform Governance</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            System Administration
          </h1>
          <p className="text-xs text-slate-500">
            Real-time hospital network oversight, clinical credential verification, and HIPAA audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-all"
          >
            <span>Interactive Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Registered Patients"
          value={totalPatients}
          icon={Users}
          color="blue"
          subtitle="Active patient accounts"
        />
        <StatCard
          title="Clinical Specialists"
          value={totalDoctors}
          icon={Stethoscope}
          color="emerald"
          subtitle={`${pendingDoctors} pending verification`}
        />
        <StatCard
          title="Total Consultations"
          value={totalAppointments}
          icon={Calendar}
          color="brand"
          subtitle="Hospital bookings tracked"
        />
        <StatCard
          title="Diagnostic Scans & Vault"
          value={totalRecords}
          icon={FolderHeart}
          color="purple"
          subtitle={`${totalPrescriptions} prescriptions logged`}
        />
      </div>

      {/* Pending Doctor Verification Alert if any */}
      {pendingDoctors > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {pendingDoctors} Physician {pendingDoctors > 1 ? 'profiles await' : 'profile awaits'} credential verification
              </p>
              <p className="text-xs text-amber-700">
                Medical licenses must be verified before physicians can accept appointments.
              </p>
            </div>
          </div>
          <Link
            href="/admin/doctors?verification=pending"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            Review Licenses
          </Link>
        </div>
      )}

      {/* Operational Modules Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/patients"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Patient Management</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Manage patient accounts, inspect medical record storage footprint, and govern account standing.
          </p>
          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Open Patient Directory →
          </span>
        </Link>

        <Link
          href="/admin/doctors"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Physician Governance</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Verify medical licenses, inspect clinical specialties, and approve doctor onboardings.
          </p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Verify Specialists →
          </span>
        </Link>

        <Link
          href="/admin/appointments"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Appointment Oversight</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Track hospital schedules, manage conflicting booking requests, and supervise status transitions.
          </p>
          <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Manage Appointments →
          </span>
        </Link>
      </div>

      {/* Security Audit Log Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600" />
            Security & Clinical Provenance Audit Logs
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {recentAuditLogs.map((log) => (
            <div key={log._id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-slate-500 ml-2">
                    on {log.entityType} ({log.userId?.name || 'System Actor'})
                  </span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}

          {recentAuditLogs.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No audit records generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

