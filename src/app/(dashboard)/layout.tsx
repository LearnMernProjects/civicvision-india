'use client';

import Navigation from '@/components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-emerald-50">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
