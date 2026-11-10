'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyDoctorAction, toggleUserStatusAction } from '@/actions/adminActions';
import Badge from '@/components/ui/Badge';
import { Stethoscope, Search, ShieldCheck, ShieldAlert, Check, X, Award } from 'lucide-react';

export default function AdminDoctorsClient({ initialDoctors, initialSearch, initialVerification }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [verificationTab, setVerificationTab] = useState(initialVerification || 'all');
  const [loadingId, setLoadingId] = useState(null);

  const handleFilter = (tab) => {
    setVerificationTab(tab);
    router.push(`/admin/doctors?verification=${tab}&search=${encodeURIComponent(search)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/doctors?verification=${verificationTab}&search=${encodeURIComponent(search)}`);
  };

  const handleVerify = async (doctorId, shouldVerify) => {
    setLoadingId(doctorId);
    const res = await verifyDoctorAction(doctorId, shouldVerify, 'Audited by System Administrator');
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to update doctor verification');
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'verified'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                verificationTab === tab
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'pending' ? 'Pending Verification' : tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search physician..."
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialDoctors.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                    {doc.name ? doc.name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                    <p className="text-xs font-semibold text-emerald-700">
                      {doc.doctorProfile?.specialty || 'General'}
                    </p>
                  </div>
                </div>

                {doc.doctorProfile?.isVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Verification Pending</Badge>
                )}
              </div>

              {/* License & Credentials */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Medical License:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {doc.doctorProfile?.licenseNumber || 'Not submitted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Qualifications:</span>
                  <span className="font-bold text-slate-800">
                    {doc.doctorProfile?.qualifications?.join(', ') || 'MBBS'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Clinical Experience:</span>
                  <span className="font-bold text-slate-800">
                    {doc.doctorProfile?.experienceYears || 1} Years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-slate-800">
                    ₹{doc.doctorProfile?.consultationFee || 500}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                Email: <span className="font-mono text-slate-700">{doc.email}</span>
              </span>

              <div className="flex items-center gap-2">
                {doc.doctorProfile?.isVerified ? (
                  <button
                    onClick={() => handleVerify(doc._id, false)}
                    disabled={loadingId === doc._id}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    Revoke License
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(doc._id, true)}
                    disabled={loadingId === doc._id}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {initialDoctors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No doctors found in this view</p>
          </div>
        )}
      </div>
    </div>
  );
}

