'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAppointmentStatus } from '@/actions/appointmentActions';
import Badge from '@/components/ui/Badge';
import ConsultationNoteModal from '@/components/forms/ConsultationNoteModal';
import PrescriptionModal from '@/components/forms/PrescriptionModal';
import { Calendar, Clock, Check, X, ClipboardList, Pill, AlertCircle } from 'lucide-react';

export default function DoctorAppointmentsClient({ initialAppointments, initialStatus }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [selectedAppointmentForConsult, setSelectedAppointmentForConsult] = useState(null);
  const [selectedAppointmentForRx, setSelectedAppointmentForRx] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    router.push(`/doctor/appointments?status=${status}`);
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    const res = await updateAppointmentStatus(appointmentId, status);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to update status');
    }
    setUpdatingId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="warning">Rescheduled</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleStatusTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {initialAppointments.map((apt) => (
          <div
            key={apt._id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                <span className="text-[10px] uppercase font-semibold text-emerald-600">
                  {new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-base leading-none">{new Date(apt.appointmentDate).getDate()}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">{apt.patientId?.name || 'Patient'}</h3>
                  {getStatusBadge(apt.status)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {apt.timeSlot}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{apt.type}</span>
                  <span>•</span>
                  <span>Phone: {apt.patientId?.phone || 'Not provided'}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Patient Symptoms / Reason:</span> {apt.reason}
                </p>
              </div>
            </div>

            {/* Actions for doctor */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              {apt.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                    disabled={updatingId === apt._id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                    disabled={updatingId === apt._id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </>
              )}

              {['scheduled', 'confirmed'].includes(apt.status) && (
                <button
                  onClick={() => setSelectedAppointmentForConsult(apt)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Start Consultation</span>
                </button>
              )}

              {apt.status === 'completed' && (
                <button
                  onClick={() => setSelectedAppointmentForRx(apt)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Write Rx</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {initialAppointments.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No appointments in this category</p>
            <p className="text-xs text-slate-500 mt-1">Patient bookings will appear here.</p>
          </div>
        )}
      </div>

      {selectedAppointmentForConsult && (
        <ConsultationNoteModal
          isOpen={Boolean(selectedAppointmentForConsult)}
          onClose={() => setSelectedAppointmentForConsult(null)}
          prefilledAppointment={selectedAppointmentForConsult}
          prefilledPatient={selectedAppointmentForConsult.patientId}
        />
      )}

      {selectedAppointmentForRx && (
        <PrescriptionModal
          isOpen={Boolean(selectedAppointmentForRx)}
          onClose={() => setSelectedAppointmentForRx(null)}
          appointmentId={selectedAppointmentForRx._id}
          targetPatient={selectedAppointmentForRx.patientId}
        />
      )}
    </div>
  );
}

