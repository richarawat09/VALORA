'use client';

import { useState } from 'react';
import { ClipboardList, Pill, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardClientActions() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        href="/doctor/consultations"
        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
      >
        <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
        <span>Clinical Notes</span>
      </Link>

      <Link
        href="/doctor/prescriptions"
        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
      >
        <Pill className="w-3.5 h-3.5 text-emerald-600" />
        <span>Issue Rx</span>
      </Link>

      <Link
        href="/doctor/appointments"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
      >
        <span>Manage Appointments</span>
      </Link>
    </div>
  );
}

