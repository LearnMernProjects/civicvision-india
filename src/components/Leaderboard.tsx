'use client';

import { motion } from 'framer-motion';
import { useCivicStore } from '@/lib/store';
import { Complaint } from '@/types';

interface LeaderboardProps {
  showFull?: boolean;
}

export default function Leaderboard({ showFull = false }: LeaderboardProps) {
  const users = useCivicStore(state => state.users);
  const complaints = useCivicStore(state => state.complaints);

  const leaderboard = [...users]
    .map(user => {
      const userComplaints = complaints.filter(c => c.userId === user.id);
      const resolvedComplaints = userComplaints.filter(c => c.status === 'resolved');
      
      return {
        ...user,
        complaintsReported: userComplaints.length,
        complaintsResolved: resolvedComplaints.length,
        successRate: userComplaints.length > 0 ? (resolvedComplaints.length / userComplaints.length) * 100 : 0
      };
    })
    .sort((a, b) => b.credits - a.credits)
    .slice(0, showFull ? users.length : 5);

  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-orange-400 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Civic Leaders
      </h3>
      
      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
              index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' :
              'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getBadgeColor(index + 1)}`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">{user.city}</p>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-emerald-600">{user.credits}</span>
                <span className="text-xs text-gray-500">credits</span>
              </div>
              
              {showFull && (
                <div className="text-xs text-gray-500">
                  <span className="mr-2">{user.complaintsReported} reported</span>
                  <span>{user.complaintsResolved} resolved</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {!showFull && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-gray-500">
            Top performers earn civic credits for reporting and resolving issues
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
