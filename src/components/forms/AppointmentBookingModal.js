'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { bookAppointment } from '@/actions/appointmentActions';
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AppointmentBookingModal({ isOpen, onClose, selectedDoctor = null, doctorsList = [] }) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(selectedDoctor?.userId?._id || selectedDoctor?._id || '');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [type, setType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeSlots = [
    '09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM',
    '12:00 PM', '02:00 PM', '02:45 PM', '03:30 PM',
    '04:15 PM', '05:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const targetDoctorId = doctorId || selectedDoctor?.userId?._id || selectedDoctor?._id;

    if (!targetDoctorId) {
      setError('Please select a doctor');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('doctorId', targetDoctorId);
    formData.append('appointmentDate', date);
    formData.append('timeSlot', timeSlot);
    formData.append('type', type);
    formData.append('reason', reason);

    const res = await bookAppointment(formData);

    if (res.success) {
      setSuccess('Appointment successfully booked!');
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || 'Failed to book appointment');
    }
    setIsSubmitting(false);
  };

  // Min date is tomorrow
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Medical Consultation">
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
        {/* Doctor selection if not preselected */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Physician / Specialist
          </label>
          {selectedDoctor ? (
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedDoctor.userId?.name || selectedDoctor.name}</p>
                <p className="text-xs text-teal-700">{selectedDoctor.specialty} • Fee: ₹{selectedDoctor.consultationFee || 500}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">Selected</span>
            </div>
          ) : (
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose a doctor --</option>
              {doctorsList.map((doc) => (
                <option key={doc._id} value={doc.userId?._id || doc._id}>
                  {doc.userId?.name || doc.name} ({doc.specialty}) - ₹{doc.consultationFee || 500}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={tomorrow}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Consultation Mode
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="in-person">In-Person Clinic Visit</option>
              <option value="teleconsultation">Secure Teleconsultation (Video/Audio)</option>
              <option value="follow-up">Follow-up Review</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Time Slot
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {timeSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                onClick={() => setTimeSlot(slot)}
                className={`py-2 px-1 text-xs rounded-xl font-medium border transition-colors ${
                  timeSlot === slot
                    ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Symptoms & Primary Reason
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms, duration, or reason for this visit..."
            required
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
            {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

