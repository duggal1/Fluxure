// /app/layout.tsx (or wherever your layout component is located)
import { Inter } from 'next/font/google';

import { AIProvider } from '@/components/providers/ai-provider';
import { Toaster } from '@/components/ui/toaster';
import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';

//use this import instead of ./globals.css

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Enterprise AI Agent',
  description: 'Advanced AI Agent for Enterprise Solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Wrap the children with ThemeProvider and AIProvider */}
        <AIProvider>
          <div className="flex flex-col w-full min-h-screen">
            <DashboardNavbar />
            <main className="flex lg:flex-row flex-col flex-1 size-full">
              <DashboardSidebar />
              <div className="lg:ml-72 px-4 py-8 pt-14 w-full">
                {children}
              </div>
            </main>
            <Toaster /> {/* Notification component */}
          </div>
        </AIProvider>
      </body>
    </html>
  );
}