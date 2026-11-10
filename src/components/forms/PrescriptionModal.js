'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { createPrescriptionAction } from '@/actions/prescriptionActions';
import { Plus, Trash2, Pill, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrescriptionModal({ isOpen, onClose, targetPatient = null, appointmentId = null, consultationId = null }) {
  const router = useRouter();
  const [medications, setMedications] = useState([
    {
      medicineName: '',
      dosage: '1 tablet (500mg)',
      frequency: 'Twice daily (1-0-1)',
      duration: '5 days',
      instructions: 'Take after meals with water',
    },
  ]);
  const [diagnosticTests, setDiagnosticTests] = useState('');
  const [generalAdvice, setGeneralAdvice] = useState('Drink adequate water, complete the full antibiotic course, and rest.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addMedicationRow = () => {
    setMedications([
      ...medications,
      {
        medicineName: '',
        dosage: '1 tablet',
        frequency: 'Once daily (1-0-0)',
        duration: '5 days',
        instructions: 'After meals',
      },
    ]);
  };

  const removeMedicationRow = (index) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const patientId = targetPatient?._id || targetPatient?.userId?._id;
    if (!patientId) {
      setError('Patient record is missing');
      setIsSubmitting(false);
      return;
    }

    // Ensure all rows have medicine name
    const invalidRow = medications.some((m) => !m.medicineName.trim());
    if (invalidRow) {
      setError('Please enter a medicine name for all prescribed drugs');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('patientId', patientId);
    if (appointmentId) formData.append('appointmentId', appointmentId);
    if (consultationId) formData.append('consultationId', consultationId);
    formData.append('medications', JSON.stringify(medications));
    formData.append('diagnosticTests', diagnosticTests);
    formData.append('generalAdvice', generalAdvice);

    const res = await createPrescriptionAction(formData);

    if (res.success) {
      setSuccess('Digital Prescription created and signed!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || 'Failed to create prescription');
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Digital Prescription (Rx)" maxWidth="max-w-4xl">
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

      {targetPatient && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900">Patient: {targetPatient.name}</span>
            <span className="text-slate-500 ml-2">({targetPatient.email})</span>
          </div>
          <span className="font-semibold text-teal-700">Digital Rx Authorized</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Medications Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prescribed Medications
            </label>
            <button
              type="button"
              onClick={addMedicationRow}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Drug
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med, index) => (
              <div
                key={index}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl relative grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-4">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Medicine / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin, Paracetamol"
                    value={med.medicineName}
                    onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 1-0-1"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 days"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="After food"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicationRow(index)}
                      className="p-1.5 mt-4 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Diagnostic Investigations / Lab Tests Advised
          </label>
          <input
            type="text"
            value={diagnosticTests}
            onChange={(e) => setDiagnosticTests(e.target.value)}
            placeholder="e.g. Fasting Blood Sugar, HbA1c, Serum Creatinine (comma separated)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            General Clinical Advice & Dietary Precautions
          </label>
          <textarea
            rows={2}
            value={generalAdvice}
            onChange={(e) => setGeneralAdvice(e.target.value)}
            placeholder="Specific dietary guidance, exercise limits, warnings..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
          />
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
            {isSubmitting ? 'Signing Prescription...' : 'Issue Prescription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

