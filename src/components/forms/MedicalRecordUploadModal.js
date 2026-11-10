'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { uploadMedicalRecordAction } from '@/actions/medicalRecordActions';
import { UploadCloud, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MedicalRecordUploadModal({ isOpen, onClose, targetPatientId = null }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('lab_report');
  const [facility, setFacility] = useState('VALORA Health Diagnostics');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const recordTypes = [
    { value: 'lab_report', label: 'Blood / Lab Diagnostic Report' },
    { value: 'xray', label: 'X-Ray Radiograph' },
    { value: 'mri_scan', label: 'MRI Scan' },
    { value: 'ct_scan', label: 'CT Scan' },
    { value: 'ultrasound', label: 'Ultrasound / Sonography Report' },
    { value: 'prescription', label: 'Doctor Prescription' },
    { value: 'discharge_summary', label: 'Hospital Discharge Summary' },
    { value: 'other', label: 'Other Clinical Document' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('recordType', recordType);
    formData.append('facilityOrDoctor', facility);
    formData.append('description', description);
    formData.append('tags', tags);
    if (targetPatientId) {
      formData.append('patientId', targetPatientId);
    }
    if (file) {
      formData.append('file', file);
    }

    const res = await uploadMedicalRecordAction(formData);

    if (res.success) {
      setSuccess('Medical record securely uploaded & encrypted!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || 'Failed to upload document');
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Medical Document to Vault">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Record Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Brain MRI T2 Contrast, Fasting Lipid Profile, Chest X-Ray"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Category *
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {recordTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnostic Center / Hospital
            </label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="e.g. Apex Diagnostics, City Scan Labs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* File Drag & Drop / Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Medical File (PDF, DICOM/JPEG, PNG)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-teal-500 transition-colors">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
              <div className="flex text-sm text-slate-600 justify-center">
                <label className="relative cursor-pointer font-semibold text-teal-600 hover:text-teal-700 focus-within:outline-none">
                  <span>Browse files</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.png,.jpg,.jpeg,.dcm"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="pl-1 text-slate-500">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-400">PDF, JPG, PNG up to 25MB</p>
              {file && (
                <p className="text-xs font-bold text-teal-700 pt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Radiology, Cholesterol, Annual Checkup"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Summary / Radiologist Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key observations, reference ranges, findings..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            {isSubmitting ? 'Uploading to Vault...' : 'Save & Secure in Vault'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

