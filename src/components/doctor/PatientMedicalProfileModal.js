'use client';

import { useState, useEffect } from 'react';
import {
  X,
  User,
  HeartPulse,
  FolderHeart,
  ClipboardList,
  Pill,
  UploadCloud,
  FileText,
  Calendar,
  Building,
  Eye,
  AlertCircle,
  Stethoscope,
  Activity,
  ShieldAlert,
  Clock,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { getPatientFullHistoryForDoctor } from '@/actions/doctorActions';
import Badge from '@/components/ui/Badge';

export default function PatientMedicalProfileModal({
  isOpen,
  onClose,
  patient,
  onOpenConsultModal,
  onOpenRxModal,
  onOpenUploadModal,
}) {
  const [activeTab, setActiveTab] = useState('consultations');
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patient?._id) {
      setLoading(true);
      setError('');
      getPatientFullHistoryForDoctor(patient._id)
        .then((res) => {
          if (res.success) {
            setHistoryData(res.data);
          } else {
            setError(res.error || 'Failed to load patient history');
          }
        })
        .catch((err) => {
          setError(err.message || 'Error fetching patient history');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setHistoryData(null);
    }
  }, [isOpen, patient?._id]);

  if (!isOpen || !patient) return null;

  const user = historyData?.user || patient;
  const profile = historyData?.profile || {};
  const records = historyData?.records || [];
  const consultations = historyData?.consultations || [];
  const prescriptions = historyData?.prescriptions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-left">
        <div className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all w-full max-w-4xl border border-slate-100 flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-600/20 shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
                    {!loading && !error && historyData && (
                      <>
                        <Badge variant="primary">{profile.bloodGroup || 'Blood Group: N/A'}</Badge>
                        <span className="text-xs text-slate-500 font-medium capitalize">
                          {profile.gender || 'Patient'}
                        </span>
                      </>
                    )}
                  </div>
                  {!loading && !error && historyData && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {user.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Clinical Badges */}
            {!loading && !error && historyData && (
              <>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Allergies</span>
                    <span className="font-semibold text-rose-600 truncate block">
                      {profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'None Reported'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Chronic Conditions</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {profile.chronicConditions?.length > 0
                        ? profile.chronicConditions.join(', ')
                        : 'None Reported'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Contact</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {profile.emergencyContact?.name
                        ? `${profile.emergencyContact.name} (${profile.emergencyContact.relation || 'Contact'})`
                        : 'Not Specified'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Insurance</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {profile.insuranceProvider || 'Direct / Self Pay'}
                    </span>
                  </div>
                </div>

                {/* Quick Action Bar for Current Doctor */}
                {(onOpenConsultModal || onOpenRxModal || onOpenUploadModal) && (
                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600">
                      Doctor Actions for {user.name?.split(' ')[0]}:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenConsultModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenConsultModal(user);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-100/70 hover:bg-teal-200 transition-colors"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>+ Add Clinical Note</span>
                        </button>
                      )}

                      {onOpenRxModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenRxModal(user);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 transition-colors"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>+ Issue Prescription</span>
                        </button>
                      )}

                      {onOpenUploadModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenUploadModal(user);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-100/70 hover:bg-purple-200 transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>+ Upload Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tab Navigation */}
          {!loading && !error && historyData && (
            <div className="px-6 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('consultations')}
                className={`py-3.5 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'consultations'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Previous Doctor Consultations ({consultations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className={`py-3.5 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'records'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FolderHeart className="w-4 h-4" />
                <span>Medical Reports & Scans ({records.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prescriptions')}
                className={`py-3.5 px-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'prescriptions'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>Prescriptions History ({prescriptions.length})</span>
              </button>
            </div>
          )}

          {/* Modal Body / Tab Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {loading && (
              <div className="py-12 text-center text-xs text-slate-500">
                <div className="w-8 h-8 mx-auto border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p>Loading patient clinical profile and prior doctor consultations...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: PREVIOUS DOCTOR CONSULTATIONS */}
            {!loading && !error && historyData && activeTab === 'consultations' && (
              <div className="space-y-4">
                {consultations.length > 0 ? (
                  consultations.map((c) => (
                    <div
                      key={c._id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 hover:border-teal-300 transition-colors"
                    >
                      {/* Doctor Details Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-sm">
                            <Stethoscope className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {c.doctorId?.name || 'Attending Physician'}
                              </span>
                              <Badge variant="purple">{c.doctorSpecialty || 'Specialist'}</Badge>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Consultation Date: {new Date(c.consultationDate).toLocaleDateString()} at{' '}
                              {new Date(c.consultationDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        <Badge variant="primary">{c.diagnosis}</Badge>
                      </div>

                      {/* Symptoms */}
                      {c.symptoms && c.symptoms.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Reported Symptoms
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {c.symptoms.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals Recorded */}
                      {c.vitalSigns && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                            <span className="font-bold text-slate-800">
                              {c.vitalSigns.bloodPressure || '120/80 mmHg'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">Pulse Rate</span>
                            <span className="font-bold text-slate-800">
                              {c.vitalSigns.heartRate || 72} bpm
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">Body Temp</span>
                            <span className="font-bold text-slate-800">
                              {c.vitalSigns.temperature || 98.6}°F
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">SpO2 Oxygen</span>
                            <span className="font-bold text-slate-800">{c.vitalSigns.spO2 || 99}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">Weight</span>
                            <span className="font-bold text-slate-800">
                              {c.vitalSigns.weightKg ? `${c.vitalSigns.weightKg} kg` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Clinical Notes & Observations */}
                      {c.clinicalNotes && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Doctor&apos;s Clinical Assessment & Notes
                          </span>
                          <p className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                            &ldquo;{c.clinicalNotes}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Treatment Plan */}
                      {c.treatmentPlan && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Prescribed Treatment Plan
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">{c.treatmentPlan}</p>
                        </div>
                      )}

                      {/* Prescriptions issued by this doctor during this visit */}
                      {c.prescriptions && c.prescriptions.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            Prescription Issued by {c.doctorId?.name || 'Doctor'}:
                          </span>

                          {c.prescriptions.map((rx) => (
                            <div
                              key={rx._id}
                              className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-xs space-y-2"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-emerald-200/60 text-slate-500 font-bold text-[10px] uppercase">
                                      <th className="pb-1.5">Medication</th>
                                      <th className="pb-1.5">Dosage</th>
                                      <th className="pb-1.5">Frequency</th>
                                      <th className="pb-1.5">Duration</th>
                                      <th className="pb-1.5">Instructions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-emerald-100 text-slate-800">
                                    {rx.medications?.map((m, idx) => (
                                      <tr key={idx}>
                                        <td className="py-1.5 font-bold text-emerald-950">
                                          {m.medicineName}
                                        </td>
                                        <td className="py-1.5">{m.dosage}</td>
                                        <td className="py-1.5">{m.frequency}</td>
                                        <td className="py-1.5">{m.duration}</td>
                                        <td className="py-1.5 text-slate-600">{m.instructions}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {rx.generalAdvice && (
                                <p className="text-[11px] text-emerald-800 pt-1">
                                  <strong>Advice:</strong> {rx.generalAdvice}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No previous consultations recorded</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No doctor has documented consultations for this patient yet.
                    </p>
                    {onOpenConsultModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenConsultModal(user);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        Record First Consultation
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEDICAL REPORTS & SCANS */}
            {!loading && !error && historyData && activeTab === 'records' && (
              <div className="space-y-4">
                {records.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {records.map((rec) => (
                      <div
                        key={rec._id}
                        className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-teal-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {rec.recordType?.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                          {rec.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                              {rec.description}
                            </p>
                          )}

                          <div className="space-y-1 text-xs text-slate-500 pt-2.5 border-t border-slate-100 mt-2.5">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{rec.facilityOrDoctor}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{new Date(rec.recordDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Size: {(rec.fileSize / 1024).toFixed(1)} KB • {rec.fileType}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <a
                            href={rec.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Document</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FolderHeart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No medical documents in vault</p>
                    <p className="text-xs text-slate-500 mt-1">
                      The patient does not have lab results or scan files uploaded yet.
                    </p>
                    {onOpenUploadModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenUploadModal(user);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        Upload Medical Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PRESCRIPTIONS HISTORY */}
            {!loading && !error && historyData && activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {prescriptions.length > 0 ? (
                  prescriptions.map((rx) => (
                    <div
                      key={rx._id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              Prescribed by {rx.doctorId?.name || 'Doctor'}
                            </span>
                            <Badge variant="purple">{rx.doctorSpecialty || 'Practitioner'}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Date: {new Date(rx.prescribedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="success">Active Electronic Rx</Badge>
                      </div>

                      {/* Medications Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                              <th className="pb-2">Medicine Name</th>
                              <th className="pb-2">Dosage</th>
                              <th className="pb-2">Frequency</th>
                              <th className="pb-2">Duration</th>
                              <th className="pb-2">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            {rx.medications?.map((m, idx) => (
                              <tr key={idx}>
                                <td className="py-2 font-bold text-emerald-900">{m.medicineName}</td>
                                <td className="py-2">{m.dosage}</td>
                                <td className="py-2">{m.frequency}</td>
                                <td className="py-2">{m.duration}</td>
                                <td className="py-2 text-slate-600">{m.instructions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {rx.generalAdvice && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                          <strong>Physician Advice:</strong> {rx.generalAdvice}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No prescriptions recorded</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No electronic prescriptions have been issued to this patient yet.
                    </p>
                    {onOpenRxModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRxModal(user);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      >
                        Issue First Prescription
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

