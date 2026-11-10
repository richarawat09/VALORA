import Sidebar from '@/components/common/Sidebar';
import { getCurrentUser } from '@/actions/authActions';
import { redirect } from 'next/navigation';

export default async function PatientLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If a doctor or admin navigates here, allow if needed or redirect
  if (user.role !== 'patient' && user.role !== 'admin') {
    redirect(`/${user.role}/dashboard`);
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar role="patient" />
      <div className="flex-1 overflow-x-hidden p-6 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </div>
    </div>
  );
}

