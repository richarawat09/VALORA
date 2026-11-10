'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMedicalRecord } from '@/actions/medicalRecordActions';
import MedicalRecordUploadModal from '@/components/forms/MedicalRecordUploadModal';
import Badge from '@/components/ui/Badge';
import {
  FolderHeart,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Calendar,
  Building,
  Tag,
  Eye,
  FileCode,
} from 'lucide-react';

export default function MedicalRecordsClient({ initialRecords, initialCategory }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'lab_report', label: 'Lab Reports' },
    { id: 'xray', label: 'X-Rays' },
    { id: 'mri_scan', label: 'MRI Scans' },
    { id: 'ct_scan', label: 'CT Scans' },
    { id: 'ultrasound', label: 'Ultrasound' },
    { id: 'prescription', label: 'Prescriptions' },
    { id: 'discharge_summary', label: 'Discharge Summaries' },
  ];

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    router.push(`/patient/medical-records?category=${catId}`);
  };

  const handleDelete = async (recordId) => {
    if (!confirm('Are you sure you want to permanently delete this record from your vault?')) return;

    setDeletingId(recordId);
    const res = await deleteMedicalRecord(recordId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete record');
    }
    setDeletingId(null);
  };

  const getRecordIconBadge = (type) => {
    switch (type) {
      case 'xray':
      case 'mri_scan':
      case 'ct_scan':
        return <Badge variant="purple">{type.replace('_', ' ').toUpperCase()}</Badge>;
      case 'lab_report':
        return <Badge variant="primary">LAB REPORT</Badge>;
      case 'ultrasound':
        return <Badge variant="info">ULTRASOUND</Badge>;
      default:
        return <Badge variant="default">{type.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Grid of Medical Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialRecords.map((rec) => (
          <div
            key={rec._id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                  <FileText className="w-5 h-5" />
                </div>
                {getRecordIconBadge(rec.recordType)}
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1">{rec.title}</h3>
              {rec.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {rec.description}
                </p>
              )}

              {/* Tags */}
              {rec.tags && rec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Facility & Date */}
              <div className="space-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{rec.facilityOrDoctor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(rec.recordDate).toLocaleDateString()}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Size: {(rec.fileSize / 1024).toFixed(1)} KB • {rec.fileType}
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={rec.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View File</span>
              </a>

              <button
                type="button"
                onClick={() => handleDelete(rec._id)}
                disabled={deletingId === rec._id}
                title="Delete Record"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {initialRecords.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200">
            <FolderHeart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No medical records found</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload laboratory reports, scans, or X-rays to your encrypted vault.
            </p>
          </div>
        )}
      </div>

      <MedicalRecordUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}

