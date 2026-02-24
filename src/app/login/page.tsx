'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/lib/store';
import { users } from '@/data/mockData';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const router = useRouter();
  const setCurrentUser = useCivicStore(state => state.setCurrentUser);

  const handleLogin = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Youth For Fix</h1>
          <p className="text-gray-600 mt-2">Choose your account to continue</p>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <motion.button
              key={user.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin(user.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedUser === user.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.city}</p>
                  <p className="text-xs text-emerald-600 font-medium">ID: {987654321000 + user.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-600">{user.credits} credits</div>
                  <div className="text-xs text-gray-500">Level {Math.floor(user.credits / 50) + 1}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo accounts for ideathon presentation</p>
        </div>
      </motion.div>
    </div>
  );
}
