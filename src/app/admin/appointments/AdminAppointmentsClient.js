'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAppointmentStatus } from '@/actions/appointmentActions';
import Badge from '@/components/ui/Badge';
import { Calendar, Clock, User, Stethoscope, XCircle } from 'lucide-react';

export default function AdminAppointmentsClient({ initialAppointments, initialStatus }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [cancellingId, setCancellingId] = useState(null);

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    router.push(`/admin/appointments?status=${status}`);
  };

  const handleCancel = async (aptId) => {
    if (!confirm('Admin intervention: Cancel this appointment?')) return;

    setCancellingId(aptId);
    const res = await updateAppointmentStatus(aptId, 'cancelled', 'Cancelled by Hospital Admin');
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to cancel appointment');
    }
    setCancellingId(null);
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
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleStatusTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Consultation Mode</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialAppointments.map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">{apt.timeSlot}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{apt.patientId?.name || 'Patient'}</div>
                    <div className="text-slate-400 text-[11px]">{apt.patientId?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{apt.doctorId?.name || 'Doctor'}</div>
                    <div className="text-slate-400 text-[11px]">{apt.doctorId?.email}</div>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-600 font-medium">
                    {apt.type}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                    {apt.reason}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(apt.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {['scheduled', 'confirmed'].includes(apt.status) && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        disabled={cancellingId === apt._id}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {initialAppointments.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No appointments recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}

