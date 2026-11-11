'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { uploadMedicalRecordAction } from '@/actions/medicalRecordActions';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  FolderLock,
  FolderOpen,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Trash2,
  Image,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MedicalRecordUploadModal({ isOpen, onClose, targetPatientId = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('lab_report');
  const [facility, setFacility] = useState('VALORA Health Diagnostics');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);

  // Permission states: 'idle' | 'granted' | 'denied'
  const [permissionStatus, setPermissionStatus] = useState('idle');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setRecordType('lab_report');
      setFacility('VALORA Health Diagnostics');
      setDescription('');
      setTags('');
      setFile(null);
      setPermissionStatus('idle');
      setShowPermissionPrompt(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

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

  // Trigger permission prompt or directly open file picker if permission already granted
  const handleTriggerFileSelect = () => {
    setError('');
    if (permissionStatus === 'granted') {
      fileInputRef.current?.click();
    } else {
      setShowPermissionPrompt(true);
    }
  };

  // User clicked "Allow" in permission popup
  const handleAllowPermission = () => {
    setPermissionStatus('granted');
    setShowPermissionPrompt(false);
    setError('');

    // Programmatically open system file picker / gallery
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 150);
  };

  // User clicked "Deny" in permission popup
  const handleDenyPermission = () => {
    setPermissionStatus('denied');
    setShowPermissionPrompt(false);
    // Crucial: Do NOT open system file picker or gallery!
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
      // Auto-suggest title if user hasn't typed one
      if (!title) {
        const cleanName = selected.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        if (cleanName) {
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    if (permissionStatus !== 'granted') {
      setShowPermissionPrompt(true);
      return;
    }
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) {
        const cleanName = droppedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        if (cleanName) {
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Ensure a real file is attached
    if (!file) {
      if (permissionStatus === 'denied') {
        setError('Device library access was denied. Please grant permission and select a medical report file.');
      } else {
        setError('Please select a medical report document from your system library before saving.');
        handleTriggerFileSelect();
      }
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('recordType', recordType);
    formData.append('facilityOrDoctor', facility);
    formData.append('description', description);
    formData.append('tags', tags);
    if (targetPatientId) {
      formData.append('patientId', targetPatientId);
    }
    formData.append('file', file);

    const res = await uploadMedicalRecordAction(formData);

    if (res.success) {
      setSuccess('Medical record securely uploaded & encrypted in vault!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1400);
    } else {
      setError(res.error || 'Failed to upload document');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Upload Medical Document to Vault">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start sm:items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
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

          {/* Hidden Native File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.dcm,application/pdf,image/png,image/jpeg,image/dicom"
            onChange={handleFileChange}
          />

          {/* Medical File Selection Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Medical File (PDF, DICOM, JPG, PNG) *
              </label>

              {/* Status badge & Change permission */}
              {permissionStatus === 'granted' && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Library Access Granted</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPermissionPrompt(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium"
                  >
                    Change
                  </button>
                </div>
              )}

              {permissionStatus === 'denied' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  <Lock className="w-3 h-3" />
                  <span>Access Denied</span>
                </span>
              )}
            </div>

            {/* Case A: Permission Denied */}
            {permissionStatus === 'denied' && (
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Access to Device Library Denied
                  </h4>
                  <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">
                    You have denied permission to access your device files and document library. VALORA will not open your gallery or system files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPermissionPrompt(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Request Access Again</span>
                </button>
              </div>
            )}

            {/* Case B: Permission Not Denied & No File Attached */}
            {permissionStatus !== 'denied' && !file && (
              <div
                onClick={handleTriggerFileSelect}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="mt-1 flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 group-hover:scale-105 transition-all flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors text-center">
                  Click to browse device library or drop report here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported: PDF, DICOM, JPG, PNG up to 25MB
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 group-hover:bg-teal-100 border border-teal-200 transition-colors">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse System Files</span>
                </div>
              </div>
            )}

            {/* Case C: File Selected & Attached */}
            {permissionStatus !== 'denied' && file && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {file.name}
                      </p>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ✓ Ready for 256-bit encrypted vault storage
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleTriggerFileSelect}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 px-2.5 py-1.5 rounded-lg hover:bg-teal-100/50 transition-colors"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
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

      {/* Realistic Library Access Permission Prompt Modal */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            {/* Permission Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-inner">
              <FolderLock className="w-8 h-8 text-teal-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Access Device Library & Files?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                <strong>VALORA Health</strong> requests permission to access your device storage, photo gallery, and document library to browse and upload medical reports, X-rays, MRI scans, and prescriptions.
              </p>
            </div>

            {/* Scope explanation */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-left space-y-2 border border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Select PDF diagnostic reports & lab summaries</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Image className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Attach radiology scans, X-rays, and MRI images</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Files are encrypted with AES-256 before upload</span>
              </div>
            </div>

            {/* Permission Actions: Allow vs Deny */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDenyPermission}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Don't Allow (Deny)
              </button>
              <button
                type="button"
                onClick={handleAllowPermission}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Allow Access</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
