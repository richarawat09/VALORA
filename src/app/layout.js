import './globals.css';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { getCurrentUser } from '@/actions/authActions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'VALORA – Healthcare Management & Digital Medical Records Platform',
  description: 'Enterprise healthcare portal for patients, licensed physicians, and hospital administration with secure digital medical records.',
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        <Navbar user={user} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

