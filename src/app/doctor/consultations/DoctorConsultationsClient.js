'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import ConsultationNoteModal from '@/components/forms/ConsultationNoteModal';
import PrescriptionModal from '@/components/forms/PrescriptionModal';
import { ClipboardList, Plus, Calendar, Activity, Pill, User } from 'lucide-react';

export default function DoctorConsultationsClient({ initialConsultations }) {
  const [isNewConsultOpen, setIsNewConsultOpen] = useState(false);
  const [selectedConsultForRx, setSelectedConsultForRx] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsNewConsultOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Clinical Note</span>
        </button>
      </div>

      <div className="space-y-4">
        {initialConsultations.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {c.patientId?.name || 'Patient'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Consultation Date: {new Date(c.consultationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary">{c.diagnosis}</Badge>
                <button
                  onClick={() => setSelectedConsultForRx(c)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Issue Rx</span>
                </button>
              </div>
            </div>

            {/* Vitals row */}
            {c.vitalSigns && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
                  <span className="font-bold text-slate-800">{c.vitalSigns.bloodPressure || '120/80'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Heart Rate</span>
                  <span className="font-bold text-slate-800">{c.vitalSigns.heartRate || 72} bpm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Temperature</span>
                  <span className="font-bold text-slate-800">{c.vitalSigns.temperature || 98.6}°F</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SpO2</span>
                  <span className="font-bold text-slate-800">{c.vitalSigns.spO2 || 99}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                  <span className="font-bold text-slate-800">{c.vitalSigns.weightKg ? `${c.vitalSigns.weightKg} kg` : 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Clinical observations */}
            {c.clinicalNotes && (
              <div className="text-xs">
                <span className="font-bold text-slate-700 block mb-1">Clinical Notes & Findings:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {c.clinicalNotes}
                </p>
              </div>
            )}

            {/* Treatment plan */}
            {c.treatmentPlan && (
              <div className="text-xs">
                <span className="font-bold text-slate-700 block mb-1">Prescribed Management Plan:</span>
                <p className="text-slate-600 leading-relaxed">{c.treatmentPlan}</p>
              </div>
            )}
          </div>
        ))}

        {initialConsultations.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No clinical notes recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Start a consultation from today&apos;s queue or click &quot;New Clinical Note&quot;.</p>
          </div>
        )}
      </div>

      <ConsultationNoteModal
        isOpen={isNewConsultOpen}
        onClose={() => setIsNewConsultOpen(false)}
      />

      {selectedConsultForRx && (
        <PrescriptionModal
          isOpen={Boolean(selectedConsultForRx)}
          onClose={() => setSelectedConsultForRx(null)}
          consultationId={selectedConsultForRx._id}
          targetPatient={selectedConsultForRx.patientId}
        />
      )}
    </div>
  );
}

