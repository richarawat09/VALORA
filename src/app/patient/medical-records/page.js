import { getMedicalRecords } from '@/actions/medicalRecordActions';
import MedicalRecordsClient from './MedicalRecordsClient';

export default async function PatientMedicalRecordsPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || 'all';

  const res = await getMedicalRecords({ recordType: category });
  const records = res.success ? res.records : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Encrypted Document Vault</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Medical Records & Diagnostic Scans
        </h1>
        <p className="text-xs text-slate-500">
          Secure digital repository for laboratory panels, X-rays, MRI & CT scans, ultrasound reports, and hospital records.
        </p>
      </div>

      <MedicalRecordsClient initialRecords={records} initialCategory={category} />
    </div>
  );
}

