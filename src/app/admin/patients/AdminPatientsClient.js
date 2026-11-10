'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleUserStatusAction } from '@/actions/adminActions';
import Badge from '@/components/ui/Badge';
import { Users, Search, FolderHeart, Calendar, Ban, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminPatientsClient({ initialPatients, initialSearch }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [loadingId, setLoadingId] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/patients?search=${encodeURIComponent(search)}`);
  };

  const handleToggleStatus = async (patientId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark this account as ${nextStatus}?`)) return;

    setLoadingId(patientId);
    const res = await toggleUserStatusAction(patientId, nextStatus);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to update account status');
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, email, or telephone..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
        >
          Search
        </button>
      </form>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Vault Records</th>
                <th className="py-3 px-4">Visits</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Account Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialPatients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-slate-500 text-[11px]">{p.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.phone || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold text-[11px]">
                      {p.profile?.bloodGroup || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    {p.recordsCount} files
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    {p.appointmentsCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.status === 'active' ? 'success' : 'danger'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(p._id, p.status)}
                      disabled={loadingId === p._id}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 ${
                        p.status === 'active'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {p.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {initialPatients.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No patient accounts found</p>
          </div>
        )}
      </div>
    </div>
  );
}

