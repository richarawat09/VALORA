import Link from 'next/link';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getCurrentUser } from '@/actions/authActions';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Next-Gen Healthcare Management & Digital EHR</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Unified Digital Health for <br />
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                Patients, Doctors & Care Teams
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              VALORA delivers a modern, responsive medical ecosystem. Manage end-to-end appointments, view diagnostic X-rays and MRI scans, issue verifiable digital prescriptions, and analyze hospital operations in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {user ? (
                <Link
                  href={`/${user.role}/dashboard`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02]"
                >
                  Go to {user.role.toUpperCase()} Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02]"
                  >
                    Enter Platform
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-all"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dedicated Portals for Every Role</h2>
          <p className="text-slate-500 text-sm mt-2">Designed with role-based access control, secure actions, and zero clutter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient Card */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Portal</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Complete control of personal health records. Search verified specialists, book time slots, store radiological scans, and review consultations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Digital health profile & vitals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> X-Rays, MRI, CT & Lab uploads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Doctor search & appointment booking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Active digital prescriptions</li>
              </ul>
            </div>
            <Link
              href="/patient/dashboard"
              className="w-full py-2.5 text-center text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
            >
              Enter Patient Portal
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Doctor Workspace</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                A streamlined clinical workbench for medical practitioners. Manage daily consultation queues, examine permitted patient histories, and issue Rx.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Daily appointment scheduler</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Authorized patient chart reviews</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical notes & vitals logging</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-drug prescription generator</li>
              </ul>
            </div>
            <Link
              href="/doctor/dashboard"
              className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              Enter Doctor Workspace
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Governance</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Full-spectrum institutional oversight. Verify medical license credentials, govern accounts, monitor appointment volumes, and view analytical charts.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Doctor license verification</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Account activation & security</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Appointment oversight</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Chart.js interactive analytics</li>
              </ul>
            </div>
            <Link
              href="/admin/dashboard"
              className="w-full py-2.5 text-center text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              Enter Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-slate-100/60 py-16 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Enterprise Medical Record Capabilities
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Designed according to modern digital health and privacy standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <FileText className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Diagnostic Vault</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stores PDF laboratory reports, high-resolution X-rays, MRI scans, CT scans, and sonographies in secure cloud storage.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <Calendar className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Smart Scheduling</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conflict-free time slot booking with support for in-person consultations and secure teleconsultations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <BarChart3 className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Chart.js Analytics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive graphical visualizations of patient growth, appointment distributions, and specialty workload.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <Lock className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Audit & Access Control</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every record access, upload, prescription, and consultation is logged into audited security trails.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

