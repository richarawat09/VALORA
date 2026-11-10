'use client';

import { useState } from 'react';
import { Plus, Calendar, UploadCloud, Search } from 'lucide-react';
import Link from 'next/link';
import AppointmentBookingModal from '@/components/forms/AppointmentBookingModal';
import MedicalRecordUploadModal from '@/components/forms/MedicalRecordUploadModal';

export default function PatientDashboardClientActions() {
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/patient/doctors"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find Doctors</span>
        </Link>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
          <span>Upload Record</span>
        </button>

        <button
          onClick={() => setIsAptModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Consultation</span>
        </button>
      </div>

      <AppointmentBookingModal
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
      />

      <MedicalRecordUploadModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </>
  );
}

