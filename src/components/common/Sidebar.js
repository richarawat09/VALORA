'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Search,
  Calendar,
  FileText,
  Pill,
  Clock,
  Users,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  FolderHeart,
  ChevronRight,
  Star,
} from 'lucide-react';

export default function Sidebar({ role = 'patient' }) {
  const pathname = usePathname();

  const patientNav = [
    { label: 'Overview', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Health Profile', href: '/patient/profile', icon: User },
    { label: 'Find Doctors', href: '/patient/doctors', icon: Search },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Medical Records', href: '/patient/medical-records', icon: FolderHeart },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
    { label: 'Medical History', href: '/patient/history', icon: Clock },
    { label: 'Doctor Reviews', href: '/patient/reviews', icon: Star },
  ];

  const doctorNav = [
    { label: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Doctor Profile', href: '/doctor/profile', icon: Stethoscope },
    { label: 'My Patients', href: '/doctor/patients', icon: Users },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { label: 'Patient Reviews', href: '/doctor/reviews', icon: Star },
  ];

  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/admin/patients', icon: Users },
    { label: 'Doctors & Verify', href: '/admin/doctors', icon: ShieldCheck },
    { label: 'All Appointments', href: '/admin/appointments', icon: Calendar },
    { label: 'Analytics & Insights', href: '/admin/analytics', icon: BarChart3 },
  ];

  let navItems = patientNav;
  if (role === 'doctor') navItems = doctorNav;
  if (role === 'admin') navItems = adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex flex-col p-4 shadow-xs">
      <div className="mb-4 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role} Workspace
        </span>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs border border-teal-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Safety & Compliance Badge */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Encrypted & HIPAA Compliant</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            All medical records and consultations are encrypted.
          </p>
        </div>
      </div>
    </aside>
  );
}

