'use client';

import { useState } from 'react';
import { Users, ClipboardList, Pill, UploadCloud, Search, HeartPulse, AlertCircle, Phone, Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ConsultationNoteModal from '@/components/forms/ConsultationNoteModal';
import PrescriptionModal from '@/components/forms/PrescriptionModal';
import MedicalRecordUploadModal from '@/components/forms/MedicalRecordUploadModal';

export default function DoctorPatientsClient({ initialPatients }) {
  const [search, setSearch] = useState('');
  const [selectedPatientForConsult, setSelectedPatientForConsult] = useState(null);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);
  const [selectedPatientForUpload, setSelectedPatientForUpload] = useState(null);

  const filtered = initialPatients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.user.name?.toLowerCase().includes(q) ||
      p.user.email?.toLowerCase().includes(q) ||
      p.profile?.bloodGroup?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authorized patients by name, email, or blood group..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Patients Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.user._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                    {item.user.name ? item.user.name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.user.name}</h3>
                    <p className="text-xs text-slate-500">{item.user.email}</p>
                  </div>
                </div>

                <Badge variant="primary">
                  {item.profile?.bloodGroup || 'O+'}
                </Badge>
              </div>

              {/* Vitals / Health details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                  <span className="text-slate-700 font-semibold">{item.user.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gender</span>
                  <span className="text-slate-700 font-semibold capitalize">{item.profile?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Allergies</span>
                  <span className="text-rose-600 font-semibold truncate block">
                    {item.profile?.allergies?.length > 0 ? item.profile.allergies.join(', ') : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Visits</span>
                  <span className="text-slate-700 font-semibold">{item.totalAppointments} consultations</span>
                </div>
              </div>
            </div>

            {/* Quick Doctor Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedPatientForConsult(item.user)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPatientForRx(item.user)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Write Rx</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPatientForUpload(item.user)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No authorized patients found</p>
            <p className="text-xs text-slate-500 mt-1">
              Patients who book appointments with you will appear in your clinical roster.
            </p>
          </div>
        )}
      </div>

      {selectedPatientForConsult && (
        <ConsultationNoteModal
          isOpen={Boolean(selectedPatientForConsult)}
          onClose={() => setSelectedPatientForConsult(null)}
          prefilledPatient={selectedPatientForConsult}
        />
      )}

      {selectedPatientForRx && (
        <PrescriptionModal
          isOpen={Boolean(selectedPatientForRx)}
          onClose={() => setSelectedPatientForRx(null)}
          targetPatient={selectedPatientForRx}
        />
      )}

      {selectedPatientForUpload && (
        <MedicalRecordUploadModal
          isOpen={Boolean(selectedPatientForUpload)}
          onClose={() => setSelectedPatientForUpload(null)}
          targetPatientId={selectedPatientForUpload._id}
        />
      )}
    </div>
  );
}

