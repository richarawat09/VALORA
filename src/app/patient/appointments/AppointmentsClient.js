'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAppointmentStatus } from '@/actions/appointmentActions';
import AppointmentBookingModal from '@/components/forms/AppointmentBookingModal';
import Badge from '@/components/ui/Badge';
import { Calendar, Plus, Clock, User, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function AppointmentsClient({ initialAppointments, initialStatus }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [notification, setNotification] = useState('');

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    router.push(`/patient/appointments?status=${status}`);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setLoadingId(appointmentId);
    const res = await updateAppointmentStatus(appointmentId, 'cancelled', 'Cancelled by patient');

    if (res.success) {
      setNotification('Appointment successfully cancelled.');
      router.refresh();
    } else {
      alert(res.error || 'Failed to cancel appointment');
    }
    setLoadingId(null);
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
      {notification && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="font-bold text-teal-900">×</button>
        </div>
      )}

      {/* Action Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {initialAppointments.map((apt) => (
          <div
            key={apt._id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                <span className="text-[10px] uppercase font-semibold text-teal-500">
                  {new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-base leading-none">{new Date(apt.appointmentDate).getDate()}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">{apt.doctorId?.name}</h3>
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
                  <span>Fee: ₹{apt.fee || 500}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Reason:</span> {apt.reason}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {['scheduled', 'confirmed'].includes(apt.status) && (
                <button
                  onClick={() => handleCancelAppointment(apt._id)}
                  disabled={loadingId === apt._id}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                >
                  {loadingId === apt._id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}

        {initialAppointments.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No appointments found</p>
            <p className="text-xs text-slate-500 mt-1">Book your first doctor consultation above.</p>
          </div>
        )}
      </div>

      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}

