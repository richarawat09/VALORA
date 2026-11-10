'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/authActions';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await loginUser(formData);

    if (result.success) {
      const role = result.user.role;
      if (role === 'doctor') {
        window.location.href = '/doctor/dashboard';
      } else if (role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/patient/dashboard';
      }
    } else {
      setError(result.error || 'Failed to authenticate');
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Valora@123');
    setError('');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 items-center justify-center shadow-lg shadow-teal-500/20 mb-2">
            <Activity className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In to VALORA</h2>
          <p className="text-xs text-slate-500">Access your healthcare portal, consultations, and medical records</p>
        </div>

        {/* Demo Account Quick Pickers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            Quick 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('patient@valora.health')}
              className="py-1.5 px-2 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors text-center"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => fillDemo('dr.sharma@valora.health')}
              className="py-1.5 px-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors text-center"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@valora.health')}
              className="py-1.5 px-2 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@valora.health"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

