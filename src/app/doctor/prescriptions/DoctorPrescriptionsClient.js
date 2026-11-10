'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import PrescriptionModal from '@/components/forms/PrescriptionModal';
import { Pill, Plus, Calendar, User, FileText } from 'lucide-react';

export default function DoctorPrescriptionsClient({ initialPrescriptions }) {
  const [isRxOpen, setIsRxOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {initialPrescriptions.map((rx) => (
          <div
            key={rx._id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Rx for {rx.patientId?.name || 'Patient'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient ID: <span className="font-mono">{rx.patientId?.email}</span> • Issued: {new Date(rx.prescribedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Badge variant="success">Prescribed & Signed</Badge>
            </div>

            {/* Drugs table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Medicine</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 rounded-r-xl">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rx.medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{med.medicineName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{med.dosage}</td>
                      <td className="py-2.5 px-3 font-semibold text-teal-700">{med.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-600">{med.duration}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Advice */}
            {rx.generalAdvice && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700">Clinical Advice: </span>
                <span className="text-slate-600">{rx.generalAdvice}</span>
              </div>
            )}
          </div>
        ))}

        {initialPrescriptions.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No prescriptions issued yet</p>
            <p className="text-xs text-slate-500 mt-1">Prescriptions written during patient consultations will be cataloged here.</p>
          </div>
        )}
      </div>

      <PrescriptionModal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
      />
    </div>
  );
}

