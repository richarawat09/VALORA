'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { saveConsultationNotes } from '@/actions/doctorActions';
import { Stethoscope, Activity, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConsultationNoteModal({ isOpen, onClose, prefilledPatient = null, prefilledAppointment = null }) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [heartRate, setHeartRate] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spO2, setSpO2] = useState('99');
  const [weight, setWeight] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const targetPatientId = prefilledPatient?._id || prefilledAppointment?.patientId?._id;
    if (!targetPatientId) {
      setError('Patient record is missing');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('patientId', targetPatientId);
    if (prefilledAppointment?._id) {
      formData.append('appointmentId', prefilledAppointment._id);
    }
    formData.append('diagnosis', diagnosis);
    formData.append('symptoms', symptoms);
    formData.append('clinicalNotes', clinicalNotes);
    formData.append('treatmentPlan', treatmentPlan);
    formData.append('followUpDate', followUpDate);
    formData.append('bloodPressure', bp);
    formData.append('heartRate', heartRate);
    formData.append('temperature', temp);
    formData.append('spO2', spO2);
    if (weight) formData.append('weightKg', weight);

    const res = await saveConsultationNotes(formData);

    if (res.success) {
      setSuccess('Consultation notes & vitals successfully logged!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || 'Failed to save consultation');
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Clinical Consultation & Vitals" maxWidth="max-w-3xl">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {prefilledPatient && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900">Patient: {prefilledPatient.name}</span>
            <span className="text-slate-500 ml-2">({prefilledPatient.email})</span>
          </div>
          {prefilledAppointment && (
            <span className="font-semibold text-teal-700">Apt: {prefilledAppointment.timeSlot}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vitals row */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Recorded Patient Vitals
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={spO2}
                onChange={(e) => setSpO2(e.target.value)}
                placeholder="99"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bronchitis, Stage 1 Hypertension"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Symptoms Reported
            </label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Cough, Mild Dyspnea, Fatigue (comma separated)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Examination & Notes
          </label>
          <textarea
            rows={3}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="Detailed clinical evaluation, chest sounds, abdominal examination..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Treatment & Management Plan
            </label>
            <textarea
              rows={2}
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Prescribed rest, dietary adjustments, hydration..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Follow-up Review Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {isSubmitting ? 'Recording Notes...' : 'Save Consultation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

