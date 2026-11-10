import { getPrescriptions } from '@/actions/prescriptionActions';
import Badge from '@/components/ui/Badge';
import { Pill, Stethoscope, Calendar, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default async function PatientPrescriptionsPage() {
  const res = await getPrescriptions();
  const prescriptions = res.success ? res.prescriptions : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Digital Pharmacy & Rx</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Prescriptions & Medications
        </h1>
        <p className="text-xs text-slate-500">
          Review all electronic prescriptions issued by your attending physicians, with exact dosage schedules and instructions.
        </p>
      </div>

      <div className="space-y-6">
        {prescriptions.map((rx) => (
          <div
            key={rx._id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Rx from {rx.doctorId?.name || 'Physician'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    License: <span className="font-mono text-slate-700">VAL-RX-{rx._id.slice(-6).toUpperCase()}</span> • Issued: {new Date(rx.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success">Active Prescription</Badge>
              </div>
            </div>

            {/* Medications Table */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Prescribed Drug Regimen
              </span>

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
                        <td className="py-3 px-3 font-bold text-slate-900">{med.medicineName}</td>
                        <td className="py-3 px-3 text-slate-600">{med.dosage}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[11px]">
                            {med.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{med.duration}</td>
                        <td className="py-3 px-3 text-slate-500 italic">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Tests & Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {rx.diagnosticTestsAdvised && rx.diagnosticTestsAdvised.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Recommended Diagnostic Tests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rx.diagnosticTestsAdvised.map((test, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rx.generalAdvice && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Doctor Advice:</span>
                  <p className="text-slate-600 leading-relaxed">{rx.generalAdvice}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {prescriptions.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No prescriptions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Prescriptions issued by your doctors will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

