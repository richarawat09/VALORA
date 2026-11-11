import { redirect } from 'next/navigation';

export default function DoctorPrescriptionsPage() {
  redirect('/doctor/patients');
}
