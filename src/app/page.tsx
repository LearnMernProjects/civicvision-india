'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const currentUser = useCivicStore(state => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="text-emerald-600">Loading...</div>
    </div>
  );
}
