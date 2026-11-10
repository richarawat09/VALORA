import { getPlatformAnalyticsData } from '@/actions/adminActions';
import MonthlyAppointmentsChart from '@/components/charts/MonthlyAppointmentsChart';
import PatientGrowthChart from '@/components/charts/PatientGrowthChart';
import StatusDistributionChart from '@/components/charts/StatusDistributionChart';
import SpecialtyDistributionChart from '@/components/charts/SpecialtyDistributionChart';
import RecordTypeChart from '@/components/charts/RecordTypeChart';
import { BarChart3, TrendingUp, PieChart, Activity, Layers, AlertTriangle } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const result = await getPlatformAnalyticsData();

  if (!result.success) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">Error loading platform analytics</p>
        <p className="text-xs text-slate-500">{result.error}</p>
      </div>
    );
  }

  const {
    monthlyLabels,
    monthlyAppointments,
    monthlyPatients,
    statusDistribution,
    specialtyDistribution,
    recordTypeDistribution,
    totalRecords,
    totalAppointments,
  } = result.analytics;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Executive BI & Analytics</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Hospital Analytics & Clinical Intelligence
        </h1>
        <p className="text-xs text-slate-500">
          Powered by Chart.js. Real-time metrics for patient registrations, appointment volumes, specialty workloads, and document storage distribution.
        </p>
      </div>

      {/* Row 1: Monthly Trends (Appointments & Patient Growth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              Monthly Appointment Volume
            </h3>
            <span className="text-xs font-semibold text-slate-400">Current Year</span>
          </div>
          <MonthlyAppointmentsChart labels={monthlyLabels} data={monthlyAppointments} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Patient Registration Statistics
            </h3>
            <span className="text-xs font-semibold text-slate-400">Cohort Growth</span>
          </div>
          <PatientGrowthChart labels={monthlyLabels} data={monthlyPatients} />
        </div>
      </div>

      {/* Row 2: Distribution Doughnuts (Status & Specialty) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-600" />
              Appointment Status
            </h3>
          </div>
          <StatusDistributionChart statusCounts={statusDistribution} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Specialist Distribution
            </h3>
          </div>
          <SpecialtyDistributionChart data={specialtyDistribution} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Medical Vault Records
            </h3>
          </div>
          <RecordTypeChart recordTypeCounts={recordTypeDistribution} />
        </div>
      </div>
    </div>
  );
}

