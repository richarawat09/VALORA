'use client';

import { Users, Calendar, Star } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardClientActions() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        href="/doctor/patients"
        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
      >
        <Users className="w-3.5 h-3.5 text-emerald-600" />
        <span>My Patients</span>
      </Link>

      <Link
        href="/doctor/reviews"
        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
      >
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Patient Reviews</span>
      </Link>

      <Link
        href="/doctor/appointments"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Appointments</span>
      </Link>
    </div>
  );
}
