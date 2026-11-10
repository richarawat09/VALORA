'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/authActions';
import { Activity, LogOut, User, Bell, Shield, Stethoscope, HeartPulse } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
    router.push('/login');
    router.refresh();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Stethoscope className="w-3 h-3" /> Doctor
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <HeartPulse className="w-3 h-3" /> Patient
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                  VALORA
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-teal-600 uppercase -mt-1">
                  Health System
                </span>
              </div>
            </Link>
          </div>

          {/* User Nav and Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all hover:shadow-teal-600/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

