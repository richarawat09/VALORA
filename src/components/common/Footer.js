import Link from 'next/link';
import { Activity, ShieldCheck, HeartHandshake, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">VALORA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              VALORA is a next-generation healthcare management and digital medical records platform connecting patients, licensed physicians, and hospital networks.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit Encrypted Medical Records</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/patient/dashboard" className="hover:text-teal-400 transition-colors">Patient Portal</Link></li>
              <li><Link href="/doctor/dashboard" className="hover:text-teal-400 transition-colors">Doctor Portal</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-teal-400 transition-colors">Admin Governance</Link></li>
              <li><Link href="/patient/doctors" className="hover:text-teal-400 transition-colors">Find a Doctor</Link></li>
            </ul>
          </div>

          {/* Clinical Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Clinical Modules</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Digital Health Records (EHR)</li>
              <li className="text-slate-400">PACS / X-Ray / MRI Cloud Vault</li>
              <li className="text-slate-400">Digital Rx & E-Prescriptions</li>
              <li className="text-slate-400">Vitals & Clinical Consultations</li>
            </ul>
          </div>

          {/* Regulatory Compliance */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Compliance & Ethics</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Compliant with digital healthcare privacy principles, role-based access control, and audited medical provenance.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Physician Network</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} VALORA Healthcare Technologies. All rights reserved. Built with Next.js, React, Tailwind CSS & MongoDB.
        </div>
      </div>
    </footer>
  );
}

