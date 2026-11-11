'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, ShieldCheck, MapPin, Calendar, Stethoscope, Clock, Award } from 'lucide-react';
import { DOCTOR_SPECIALTIES } from '@/lib/validations';
import AppointmentBookingModal from '@/components/forms/AppointmentBookingModal';

export default function DoctorsDirectoryClient({ initialDoctors, initialSearch, initialSpecialty }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [specialty, setSpecialty] = useState(initialSpecialty || '');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (specialty) params.set('specialty', specialty);
    router.push(`/patient/doctors?${params.toString()}`);
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Specialty Filter Bar */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search physician by name, hospital, or city..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Specialties</option>
          {DOCTOR_SPECIALTIES.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialDoctors.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                    {doc.userId?.name ? doc.userId.name.replace('Dr. ', '').charAt(0) : 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{doc.userId?.name}</h3>
                    <p className="text-xs font-semibold text-teal-700">{doc.specialty}</p>
                  </div>
                </div>

                {doc.isVerified ? (
                  <span
                    title="Verified Medical Practitioner"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span
                    title="Registered Medical Practitioner"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    Practitioner
                  </span>
                )}
              </div>

              {/* Qualifications & Rating */}
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {doc.rating || 4.8}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {doc.experienceYears}+ yrs exp
                </span>
                <span>•</span>
                <span>{doc.qualifications?.join(', ') || 'MBBS'}</span>
              </div>

              {/* Bio snippet */}
              {doc.biography && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {doc.biography}
                </p>
              )}

              {/* Clinic & Availability details */}
              <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {doc.clinicAddress?.clinicName || 'Clinic'}, {doc.clinicAddress?.city || 'City'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {doc.availableHours?.start || '09:00'} - {doc.availableHours?.end || '17:00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Book Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation</span>
                <span className="text-base font-black text-slate-900">₹{doc.consultationFee || 500}</span>
              </div>
              <button
                type="button"
                onClick={() => handleBookClick(doc)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}

        {initialDoctors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No doctors match your query</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the specialty or search term.</p>
          </div>
        )}
      </div>

      {selectedDoctorForBooking && (
        <AppointmentBookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctorForBooking(null);
          }}
          selectedDoctor={selectedDoctorForBooking}
        />
      )}
    </div>
  );
}

