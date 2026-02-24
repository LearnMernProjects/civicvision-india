'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/lib/store';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import IssueTracker from '@/components/IssueTracker';

export default function DashboardPage() {
  const currentUser = useCivicStore(state => state.currentUser);
  const users = useCivicStore(state => state.users);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !currentUser) {
      router.push('/login');
    }
  }, [isClient, router]);

  const isAuthenticated = currentUser !== null;

  const leaderboard = [...users]
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 5);

  if (!isClient || !currentUser) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back{isAuthenticated && currentUser?.name ? `, ${currentUser.name}` : ''}!
            {!isAuthenticated && currentUser && (
              <span className="text-emerald-600 font-medium">
                {' '}You can view your submitted issue below.
              </span>
            )}
          </p>
        </motion.div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IssueTracker />
          <RecentActivity />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Civic Leaders</h3>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{user.credits}</p>
                    <p className="text-xs text-gray-500">credits</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
