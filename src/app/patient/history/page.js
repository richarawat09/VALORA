import { getPatientHistory } from '@/actions/patientActions';
import Badge from '@/components/ui/Badge';
import {
  Clock,
  ClipboardList,
  FileText,
  Pill,
  Calendar,
  Activity,
  Heart,
  Stethoscope,
  ArrowUpRight,
} from 'lucide-react';

export default async function PatientHistoryPage() {
  const res = await getPatientHistory();
  const { appointments = [], consultations = [], prescriptions = [], records = [] } = res.success ? res.data : {};

  // Build a unified chronological timeline
  const timelineEvents = [
    ...consultations.map((c) => ({
      type: 'consultation',
      date: new Date(c.consultationDate),
      title: `Clinical Consultation: ${c.diagnosis}`,
      subtitle: `Examined by Dr. ${c.doctorId?.name || 'Physician'}`,
      details: c,
    })),
    ...prescriptions.map((p) => ({
      type: 'prescription',
      date: new Date(p.prescribedDate),
      title: `Prescription Issued (${p.medications?.length || 0} drugs)`,
      subtitle: `By Dr. ${p.doctorId?.name || 'Physician'}`,
      details: p,
    })),
    ...records.map((r) => ({
      type: 'record',
      date: new Date(r.recordDate),
      title: `Diagnostic Record: ${r.title}`,
      subtitle: `${r.facilityOrDoctor} • ${r.recordType.replace('_', ' ').toUpperCase()}`,
      details: r,
    })),
    ...appointments
      .filter((a) => a.status === 'completed')
      .map((a) => ({
        type: 'appointment',
        date: new Date(a.appointmentDate),
        title: `Completed Visit: ${a.reason}`,
        subtitle: `With Dr. ${a.doctorId?.name || 'Doctor'} (${a.type})`,
        details: a,
      })),
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Chronological Medical Audit</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Medical History & Consultation Timeline
        </h1>
        <p className="text-xs text-slate-500">
          Complete longitudinal health history combining clinical examinations, recorded vitals, scans, and treatments.
        </p>
      </div>

      {/* Timeline view */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-200 space-y-8 my-6">
        {timelineEvents.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-teal-600 group-hover:scale-125 transition-transform" />

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {event.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Badge
                  variant={
                    event.type === 'consultation'
                      ? 'primary'
                      : event.type === 'prescription'
                      ? 'success'
                      : event.type === 'record'
                      ? 'purple'
                      : 'info'
                  }
                  size="sm"
                >
                  {event.type.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{event.title}</h3>
                <p className="text-xs text-slate-500">{event.subtitle}</p>
              </div>

              {/* Specific details rendering */}
              {event.type === 'consultation' && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-2">
                  {event.details.vitalSigns && (
                    <div className="flex flex-wrap gap-3 text-slate-700 font-medium">
                      <span>BP: <b>{event.details.vitalSigns.bloodPressure}</b></span>
                      <span>Pulse: <b>{event.details.vitalSigns.heartRate} bpm</b></span>
                      <span>Temp: <b>{event.details.vitalSigns.temperature}°F</b></span>
                      <span>SpO2: <b>{event.details.vitalSigns.spO2}%</b></span>
                    </div>
                  )}
                  {event.details.clinicalNotes && (
                    <p className="text-slate-600 italic">
                      Notes: {event.details.clinicalNotes}
                    </p>
                  )}
                  {event.details.treatmentPlan && (
                    <p className="text-teal-800 font-semibold">
                      Plan: {event.details.treatmentPlan}
                    </p>
                  )}
                </div>
              )}

              {event.type === 'prescription' && (
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs">
                  <div className="flex flex-wrap gap-2">
                    {event.details.medications?.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                        {m.medicineName} ({m.dosage}) - {m.frequency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.type === 'record' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    File: {event.details.fileType} ({(event.details.fileSize / 1024).toFixed(1)} KB)
                  </span>
                  <a
                    href={event.details.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-teal-600 font-bold hover:underline"
                  >
                    <span>Inspect Scan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {timelineEvents.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No medical timeline events recorded</p>
            <p className="text-xs text-slate-500 mt-1">
              Your clinical visits, diagnostic uploads, and prescriptions will appear in this timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

